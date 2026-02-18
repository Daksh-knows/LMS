import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: Request) {
  try {
    const razorpay = getRazorpay();
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { action } = body; 

    let amountInPaise = 0;
    
    // Receipt needs to be short (<40 chars)
    const receiptId = `rcpt_${session.user.id.slice(-8)}_${Date.now().toString().slice(-6)}`;

    if (action === "REGISTER_COHORT") {
      amountInPaise = 200 * 100; // ₹200
    } 
    else if (action === "BUY_PREMIUM") {
      // SMART CHECK: Look at DB to find actual status
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { hasRegistered: true }
      });

      if (user?.hasRegistered) {
        amountInPaise = 7000 * 100; // Discounted
      } else {
        amountInPaise = 9000 * 100; // Standard (User missed the cohort or date passed)
      }
    } 
    else {
      return NextResponse.json({ success: false, error: "Invalid Action" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
    });

    return NextResponse.json({ 
      success: true, 
      id: order.id, 
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error("[RAZORPAY_ORDER_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}