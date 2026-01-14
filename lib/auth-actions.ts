"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { revalidatePath } from "next/cache";

// 1. Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- HELPER: Manage Session Cookie (Replaces user.json) ---
async function createSession(user: any) {
  const cookieStore = await cookies();
  // Store essential user info in the cookie
  const sessionData = {
    id: user.id,
    email: user.email,
    role: user.role,
    hasPremium: user.hasPremium,
    fullName: user.profile?.fullName || "User",
  };

  cookieStore.set("user_data", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

// --- SIGN UP ---
export async function signUpUser(formData: any) {
  try {
    const { email, password, fullName } = formData;

    // 1. Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    // 2. Create User and initialize UserStats in one transaction
    const newUser = await db.user.create({
      data: {
        email,
        password, // Note: For production, allow use of bcrypt to hash this
        role: "student",
        hasPremium: false,
        isVerified: false,
        // Create the profile relation
        profile: {
          create: {
            fullName: fullName || "User",
          },
        },
        // Create the stats relation
        stats: {
          create: {
            videoWatchedMins: 0,
            questionsSolved: 0,
          },
        },
      },
      include: {
        profile: true, // Include profile to get the name for the session
      },
    });

    // 3. Create Session (Log them in)
    await createSession(newUser);

    return { success: true };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "Failed to create account." };
  }
}

// --- SIGN IN ---
export async function signInUser(formData: any) {
  try {
    const { email, password } = formData;

    // 1. Find user in DB
    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true }, // Needed for session name
    });

    // 2. Validate Password
    // (In production, replace this with: await bcrypt.compare(password, user.password))
    if (!user || user.password !== password) {
      return { success: false, error: "Invalid credentials" };
    }

    // 3. Create Session
    await createSession(user);

    return { success: true };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, error: "Database access failed" };
  }
}

// --- SEND OTP ---
export async function sendOtpEmail(email: string) {
  try {
    // 1. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins

    // 2. Check if user exists first
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "User not found" };

    // 3. Save OTP to Database
    await db.user.update({
      where: { email },
      data: {
        otp: otp,
        otpExpires: expires,
      },
    });

    // 4. Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #16a34a;">Verification Code</h2>
          <p>Your code is:</p>
          <h1 style="letter-spacing: 5px; color: #111827;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// --- VERIFY OTP ---
export async function verifyUserOtp(email: string, otp: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) return { success: false, error: "User not found" };

    // Check OTP match and Expiry
    if (user.otp !== otp) {
      return { success: false, error: "Invalid OTP" };
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      return { success: false, error: "OTP has expired" };
    }

    // Verify User and Clear OTP
    await db.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpires: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Verify Error:", error);
    return { success: false, error: "Verification failed" };
  }
}

// --- UPGRADE TO PREMIUM ---
export async function upgradeToPremium() {
  try {
    // 1. Get Current User ID from Cookie
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get("user_data")?.value;

    if (!sessionStr) return { success: false, error: "Not logged in" };

    const currentUser = JSON.parse(sessionStr);

    // 2. Update Database
    const updatedUser = await db.user.update({
      where: { id: currentUser.id },
      data: { hasPremium: true },
      include: { profile: true }, // Fetch profile again to update session
    });

    // 3. Update Cookie (So UI reflects Premium immediately)
    await createSession(updatedUser);

    // 4. Refresh UI
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Upgrade Error:", error);
    return { success: false, error: "Failed to upgrade" };
  }
}

export async function logoutUser() {
  // 1. Delete the session cookie
  const cookieStore = await cookies();
  cookieStore.delete("user_data");

  // 2. Redirect to login page
  redirect("/landingpage");
}
