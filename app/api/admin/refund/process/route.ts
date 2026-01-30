import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Razorpay from "razorpay";
import { sendRefundStatusEmail } from "@/lib/mail"; // Import the new function

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { requestId, decision } = await req.json();

    const refundRequest = await db.refundRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // We need this to get the User's Email
    });

    if (!refundRequest) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    // --- HANDLE REJECTION ---
    if (decision === 'REJECT') {
      console.log('----------------------------------------------------');
      console.log(`Rejecting refund request ID: ${requestId} for user ID: ${refundRequest.userId}`);
      console.log('----------------------------------------------------');
      await db.refundRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });

      // Send Rejection Email (Non-blocking)
      sendRefundStatusEmail(
        refundRequest.user.email, 
        refundRequest.user.name || "Student", 
        "REJECTED"
      ).catch(err => console.error("Email failed:", err));

      return NextResponse.json({ success: true });
    }

    // --- HANDLE APPROVAL ---
    if (decision === 'APPROVE') {
      console.log('----------------------------------------------------');
      console.log(`Approving refund request ID: ${requestId} for user ID: ${refundRequest.userId}`);
      console.log('----------------------------------------------------');
      // 1. Find the latest successful payment
      const payment = await db.payment.findFirst({
        where: { userId: refundRequest.userId, status: "SUCCESS" },
        orderBy: { createdAt: "desc" }
      });
      console.log('----------------------------------------------------');
      console.log(payment);
      console.log(refundRequest.paymentId == payment?.id);
      console.log('----------------------------------------------------');
      if (!payment) {
        return NextResponse.json({ success: false, error: "No successful payment found" }, { status: 400 });
      }

      // 2. Initiate Razorpay Refund
      await razorpay.payments.refund(payment.razorpayPaymentId, {
        notes: {
          reason: "Admin Approved Refund",
          refundRequestId: requestId
        }
      });
      // 3. Update DB state
      await db.$transaction([
        db.refundRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED" }
        }),
        db.user.update({
          where: { id: refundRequest.userId },
          data: { hasPremium: false, hasRegistered: false }
        })
      ]);

      // 4. Send Approval Email (Non-blocking)
      // We pass the payment.amount so the email shows the exact refund value
      sendRefundStatusEmail(
        refundRequest.user.email, 
        refundRequest.user.name || "Student", 
        "APPROVED",
        payment.amount // Amount in Rupees (from your DB schema)
      ).catch(err => console.error("Email failed:", err));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid Decision" });
  } catch (error: any) {
    console.error("Refund Process Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process" }, { status: 500 });
  }
}