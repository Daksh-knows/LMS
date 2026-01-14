"use server"

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder() {
  try {
    const order = await razorpay.orders.create({
      amount: 7000 * 100, // ₹7,000 in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    return { success: true, id: order.id, amount: order.amount };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}