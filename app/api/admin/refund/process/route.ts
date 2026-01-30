import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { requestId, decision } = await req.json();

    const refundRequest = await db.refundRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!refundRequest) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    if (decision === 'REJECT') {
      await db.refundRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });
      return NextResponse.json({ success: true });
    }

    if (decision === 'APPROVE') {
      // 1. Find the latest successful payment to refund
      const payment = await db.payment.findFirst({
        where: { userId: refundRequest.userId, status: "SUCCESS" },
        orderBy: { createdAt: "desc" }
      });

      if (!payment) {
        return NextResponse.json({ success: false, error: "No successful payment found for this user" }, { status: 400 });
      }

      // 2. Initiate Razorpay Refund
      await razorpay.payments.refund(payment.razorpayPaymentId, {
        notes: {
          reason: "Admin Approved Refund",
          refundRequestId: requestId
        }
      });

      // 3. Update DB state in transaction
      await db.$transaction([
        // Mark request approved
        db.refundRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED" }
        }),
        // Revoke Access
        db.user.update({
          where: { id: refundRequest.userId },
          data: { hasPremium: false, hasRegistered: false }
        })
      ]);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid Decision" });
  } catch (error: any) {
    console.error("Refund Process Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process" }, { status: 500 });
  }
}