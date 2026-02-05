import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");

    if (!session?.user?.id || !lectureId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // 1. Fetch the progress (what you already had)
    const progress = await db.userProgress.findUnique({
      where: {
        userId_lectureId: {
          userId,
          lectureId,
        },
      },
      select: {
        isCompleted: true,
      },
    });

    // 2. Update User Activity
    // We create a "LECTURE_VIEW" (or similar) activity log
    try {
      await db.userActivity.create({
        data: {
          userId,
          type: "VIDEO_WATCH", // Ensure this matches your ActivityType enum
          duration: 0, // Initial status check doesn't add watch time yet
        },
      });
    } catch (activityError) {
      // We wrap this in a sub-try-catch so that if activity logging fails, 
      // the user still gets their lecture status.
      console.error("[ACTIVITY_LOG_ERROR]", activityError);
    }

    return NextResponse.json({ 
      isCompleted: progress?.isCompleted || false 
    });
  } catch (error) {
    console.error("[LECTURE_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}