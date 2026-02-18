import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Razorpay from "razorpay";
import { sendRefundStatusEmail } from "@/lib/mail";

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: Request) {
  try {
    const razorpay = getRazorpay(); // ✅ safe now

    const { requestId, decision } = await req.json();

    const refundRequest = await db.refundRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!refundRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    if (decision === "REJECT") {
      await db.refundRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      sendRefundStatusEmail(
        refundRequest.user.email,
        refundRequest.user.name || "Student",
        "REJECTED"
      ).catch(console.error);

      return NextResponse.json({ success: true });
    }

    if (decision === "APPROVE") {
      const payment = await db.payment.findFirst({
        where: {
          userId: refundRequest.userId,
          status: "SUCCESS",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!payment) {
        return NextResponse.json(
          { success: false, error: "No successful payment found" },
          { status: 400 }
        );
      }

      await razorpay.payments.refund(payment.razorpayPaymentId, {
        notes: {
          reason: "Admin Approved Refund",
          refundRequestId: requestId,
        },
      });

      await db.$transaction([
        db.refundRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED" },
        }),
        db.user.update({
          where: { id: refundRequest.userId },
          data: {
            hasPremium: false,
            hasRegistered: false,
          },
        }),
      ]);

      sendRefundStatusEmail(
        refundRequest.user.email,
        refundRequest.user.name || "Student",
        "APPROVED",
        payment.amount
      ).catch(console.error);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Invalid decision" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Refund Process Error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to process refund" },
      { status: 500 }
    );
  }
}
