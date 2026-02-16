import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { user_email, temp_password } = await req.json();

    if (!user_email || !temp_password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: user_email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // 2. Hash the temporary password
    const hashedPassword = await bcrypt.hash(temp_password, 10);

    // 3. Create the new user with the flag set to true
    const newUser = await db.user.create({
      data: {
        email: user_email,
        password: hashedPassword,
        isTempPassword: true, // Explicitly set, though default handles it
      },
    });

    return NextResponse.json({ 
      success: true, 
      userId: newUser.id 
    }, { status: 201 });

  } catch (error) {
    console.error("INGEST_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}