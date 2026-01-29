import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount // We get this from the order details on frontend
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // Logic based on Amount Paid (in paise)
    if (amount == 20000) { // ₹200
      await db.user.update({
        where: { id: session.user.id },
        data: { hasRegistered: true },
      });
    } else if (amount == 700000 || amount == 900000) { // ₹7,000 or ₹9,000
      await db.user.update({
        where: { id: session.user.id },
        data: { hasPremium: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VERIFY_ERROR]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}