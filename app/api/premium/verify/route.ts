import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    console.log("verify route session:", session);
    // console.log(session);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // --- PRO-TIP: PROPER SIGNATURE VERIFICATION ---
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // Update the user's status
    await db.user.update({
      where: { id: session.user.id },
      data: { hasPremium: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPGRADE_ERROR]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}