import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const session = await auth();
    console.log(session);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const order = await razorpay.orders.create({
      amount: 7000 * 100, // ₹7,000 in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({ 
      success: true, 
      id: order.id, 
      amount: order.amount 
    });
  } catch (error) {
    console.error("[RAZORPAY_ORDER_ERROR]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}