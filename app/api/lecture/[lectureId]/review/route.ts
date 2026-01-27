import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }

) {
  try {
    const { lectureId } = await context.params;

    const reviews = await db.review.findMany({
      where: {
        lectureId, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("[GET_REVIEWS_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    const { lectureId } = await context.params;
    const { rating, comment } = await req.json();

    // 1. Authorization Check
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // 2. Upsert Review
    await db.review.upsert({
      where: {
        userId_lectureId: {
          userId,
          lectureId,
        },
      },
      update: {
        rating,
        comment: comment || null,
      },
      create: {
        userId,
        lectureId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[LECTURE_REVIEW_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to save review" },
      { status: 500 }
    );
  }
}