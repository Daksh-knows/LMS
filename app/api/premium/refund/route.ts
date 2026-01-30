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

    // 1. Find the eligible payment to be refunded
    // We look for either the Discounted Premium (7k) or Standard Premium (9k)
    const paymentToRefund = await db.payment.findFirst({
      where: {
        userId: user.id,
        status: "SUCCESS",
        planType: {
          in: ["PREMIUM_DISCOUNT", "PREMIUM_STANDARD"],
        },
      },
      orderBy: {
        createdAt: "desc", // Get the most recent payment
      },
    });

    if (!paymentToRefund) {
      return NextResponse.json({ 
        success: false, 
        error: "No eligible premium payment found to refund." 
      }, { status: 404 });
    }

    // 2. Check if a pending request already exists for this SPECIFIC payment
    const existingRequest = await db.refundRequest.findFirst({
      where: {
        paymentId: paymentToRefund.id,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ 
        success: false, 
        error: "A refund request for this payment is already pending." 
      }, { status: 400 });
    }

    // 3. Create the request linked to the specific payment
    await db.refundRequest.create({
      data: {
        userId: user.id,
        paymentId: paymentToRefund.id, // Storing the specific payment ID
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