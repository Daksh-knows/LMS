import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    if (user.otp !== otp) {
      return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    }
    
    if (user.otpExpires && new Date() > user.otpExpires) {
      return NextResponse.json({ success: false, error: "OTP Expired" }, { status: 400 });
    }

    await db.user.update({
      where: { email },
      data: { 
        isVerified: true, 
        emailVerified: new Date(), 
        otp: null, 
        otpExpires: null 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}