import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    console.log("E " , email , password , name) ;
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user already verified as a STUDENT
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
        role: "STUDENT",
        hasPremium: false,
        isVerified: true, // Automatically verified during signup
        isTempPassword: false,
        stats: { create: { videoWatchedMins: 0, questionsSolved: 0 } },
        profile: { create: { fullName: name } }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 });
  }
}
