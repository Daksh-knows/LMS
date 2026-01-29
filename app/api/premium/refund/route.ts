import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ success: false, error: "Reason is required" }, { status: 400 });
    }

    // 1. Check if a pending request already exists
    const existingRequest = await db.refundRequest.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ success: false, error: "You already have a pending refund request." }, { status: 400 });
    }

    // 2. Create the request
    await db.refundRequest.create({
      data: {
        userId: user.id,
        reason: reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refund Request Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}