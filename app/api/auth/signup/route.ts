import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendOtpEmailInternal } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP immediately during signup
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName || "User",
        role: "STUDENT",
        hasPremium: false,
        isVerified: false,
        otp,           // Store OTP
        otpExpires: expires,
        stats: { create: { videoWatchedMins: 0, questionsSolved: 0 } },
        profile: { create: { fullName: fullName || "User" } }
      },
    });

    // Send the email
    await sendOtpEmailInternal(email, otp);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 });
  }
}