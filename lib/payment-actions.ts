"use server"

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import { db } from "./db";

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

export async function verifyAndUpgradeStatus(paymentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    // In a production app, you would verify the Razorpay signature here.
    // For now, we update the user's status
    await db.user.update({
      where: { id: session.user.id },
      data: { hasPremium: true },
    });

    // Clear the cache for dashboard and learning routes
    revalidatePath("/dashboard");
    revalidatePath("/learning");

    return { success: true };
  } catch (error) {
    console.error("Upgrade Error:", error);
    return { success: false };
  }
}