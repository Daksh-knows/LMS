"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { auth, signIn, signOut } from "@/auth"; // Integrated with NextAuth config
import { revalidatePath } from "next/cache";

// 1. Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- SIGN UP (Registration Only) ---
export async function signUpUser(formData: any) {
  // console.log(formData);
  try {
    const { email, password, fullName } = formData;

    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    // 2. Hash the password before storing in DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User following NextAuth schema requirements
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName || "User", // Mapping to standard 'name' field for NextAuth
        role: "student",
        hasPremium: false,
        isVerified: false, 
        // Initialize relations
        stats: {
          create: { videoWatchedMins: 0, questionsSolved: 0 },
        },
        profile: {
          create: { fullName: fullName || "User" }
        }
      },
    });

    // 4. Send OTP so they can verify before their first login
    await sendOtpEmail(email);

    return { success: true };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "Failed to create account." };
  }
}

// --- SEND OTP ---
export async function sendOtpEmail(email: string) {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "User not found" };

    await db.user.update({
      where: { email },
      data: { otp, otpExpires: expires },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Your Academy Verification</h2>
          <p>Your code is: <strong style="font-size: 24px; letter-spacing: 2px;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send email" };
  }
}

// --- VERIFY OTP ---
export async function verifyUserOtp(email: string, otp: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "User not found" };

    if (user.otp !== otp) return { success: false, error: "Invalid OTP" };
    if (user.otpExpires && new Date() > user.otpExpires) return { success: false, error: "OTP Expired" };

    // Update DB status
    await db.user.update({
      where: { email },
      data: { 
        isVerified: true, 
        emailVerified: new Date(), // Standard NextAuth field
        otp: null, 
        otpExpires: null 
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}

// --- UPGRADE TO PREMIUM ---
export async function upgradeToPremium() {
  try {
    // 1. Get Session from NextAuth secure helper
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not logged in" };

    // 2. Update DB
    await db.user.update({
      where: { id: session.user.id },
      data: { hasPremium: true },
    });

    // 3. Clear cache to reflect new status in UI
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to upgrade" };
  }
}

export async function updateProfile(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const { fullName, domain, collegeName, collegeDegree, collegeYear } = data;

    // Update or Create the StudentProfile
    await db.studentProfile.upsert({
      where: { userId: session.user.id },
      update: {
        fullName,
        domain,
        collegeName,
        collegeDegree,
        collegeYear: parseInt(collegeYear) || 1,
      },
      create: {
        userId: session.user.id,
        fullName,
        domain,
        collegeName,
        collegeDegree,
        collegeYear: parseInt(collegeYear) || 1,
      },
    });

    // Also update the main User name for NextAuth consistency
    await db.user.update({
      where: { id: session.user.id },
      data: { name: fullName }
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: "Failed to update profile." };
  }
}