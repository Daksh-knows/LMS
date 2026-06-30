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
    const { itemId, itemType } = body; 

    if (!itemId || !itemType || !["COURSE", "BUNDLE"].includes(itemType)) {
      return NextResponse.json({ success: false, error: "Invalid item details" }, { status: 400 });
    }

    let amountInPaise = 0;

    if (itemType === "COURSE") {
      const course = await db.course.findUnique({
        where: { id: itemId },
        select: { price: true }
      });
      if (!course || course.price === null) {
        return NextResponse.json({ success: false, error: "Course not found or price not set" }, { status: 404 });
      }
      amountInPaise = Math.round(course.price * 100);
    } else if (itemType === "BUNDLE") {
      const bundle = await db.courseBundle.findUnique({
        where: { id: itemId },
        select: { price: true }
      });
      if (!bundle || bundle.price === null) {
        return NextResponse.json({ success: false, error: "Bundle not found or price not set" }, { status: 404 });
      }
      amountInPaise = Math.round(bundle.price * 100);
    }

    if (amountInPaise <= 0) {
      return NextResponse.json({ success: false, error: "Invalid price" }, { status: 400 });
    }

    const receiptId = `rcpt_${session.user.id.slice(-8)}_${Date.now().toString().slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        itemId: itemId,
        itemType: itemType,
        userId: session.user.id,
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: order.id, 
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error("[ECOMMERCE_ORDER_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
