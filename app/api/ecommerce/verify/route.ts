import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import Razorpay from "razorpay";

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

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature
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

    const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // 2. Extract item details from notes
    const { itemId, itemType, userId } = orderDetails.notes as Record<string, string>;

    if (userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "User mismatch" }, { status: 400 });
    }

    if (!itemId || !itemType) {
      return NextResponse.json({ success: false, error: "Missing item details in order notes" }, { status: 400 });
    }

    // 3. ATOMIC TRANSACTION: Create Payment Record AND Enroll User
    await db.$transaction(async (tx) => {
      // A. Create the Payment Audit Log
      await tx.payment.create({
        data: {
          userId: session.user.id,
          amount: (orderDetails.amount as number) / 100, // Store in Rupees
          currency: "INR",
          status: "SUCCESS",
          method: paymentDetails.method || "UNKNOWN",
          planType: `ECOMMERCE_${itemType}`,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          courseId: itemType === "COURSE" ? itemId : null,
          bundleId: itemType === "BUNDLE" ? itemId : null,
        },
      });

      // B. Enroll the user
      if (itemType === "COURSE") {
        await tx.myEnrollment.upsert({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: itemId
            }
          },
          update: {},
          create: {
            userId: session.user.id,
            courseId: itemId,
          }
        });
      } else if (itemType === "BUNDLE") {
        const bundle = await tx.courseBundle.findUnique({
          where: { id: itemId },
          include: { courses: true }
        });

        if (bundle) {
          for (const course of bundle.courses) {
            await tx.myEnrollment.upsert({
              where: {
                userId_courseId: {
                  userId: session.user.id,
                  courseId: course.id
                }
              },
              update: {},
              create: {
                userId: session.user.id,
                courseId: course.id,
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[ECOMMERCE_PAYMENT_VERIFY_ERROR]", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 });
  }
}
