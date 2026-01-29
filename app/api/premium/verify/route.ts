import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount // Amount in paise (e.g., 20000 for ₹200)
    } = await req.json();

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // 2. Determine Plan Type based on Amount
    let planType = "UNKNOWN";
    if (amount == 20000) planType = "COHORT";
    else if (amount == 700000) planType = "PREMIUM_DISCOUNT";
    else if (amount == 900000) planType = "PREMIUM_STANDARD";

    // 3. ATOMIC TRANSACTION: Create Payment Record AND Update User
    await db.$transaction(async (tx) => {
      
      // A. Create the Payment Audit Log
      await tx.payment.create({
        data: {
          userId: session.user.id,
          amount: amount / 100, // Store in Rupees (e.g., 200.00)
          currency: "INR",
          status: "SUCCESS",
          method: paymentDetails.method || "UNKNOWN",
          planType: planType,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });

      // B. Update the User's Status
      if (planType === "COHORT") {
        await tx.user.update({
          where: { id: session.user.id },
          data: { hasRegistered: true },
        });
      } else if (planType === "PREMIUM_DISCOUNT" || planType === "PREMIUM_STANDARD") {
        await tx.user.update({
          where: { id: session.user.id },
          data: { hasPremium: true },
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[PAYMENT_VERIFY_ERROR]", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}