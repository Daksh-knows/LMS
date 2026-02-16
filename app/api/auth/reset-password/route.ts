import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const { newPassword, token } = await req.json();

    if (!newPassword) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let userToUpdate = null;

    // CASE 1: Reset via Email Token
    if (token) {
      const user = await db.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }, // Ensure token hasn't expired
        },
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
      }
      userToUpdate = user;
    } 
    else {
      const session = await auth(); 
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      userToUpdate = user;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: userToUpdate.id },
      data: {
        password: hashedPassword,
        isTempPassword: false, 
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESET_PWD_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}