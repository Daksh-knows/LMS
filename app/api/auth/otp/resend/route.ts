import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOtpEmailInternal } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.user.update({
      where: { email },
      data: { otp, otpExpires: expires },
    });

    await sendOtpEmailInternal(email, otp);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}