import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Get the total count of published lectures for this course
    const totalLectures = await db.lecture.count({
      where: {
        module: {
          courseId: courseId,
        },
        isPublished: true,
      },
    });

    // 2. Get the count of completed lectures for this user in this course
    const completedLectures = await db.userProgress.count({
      where: {
        userId: userId,
        courseId: courseId,
        isCompleted: true,
      },
    });

    // 3. Determine eligibility
    // If totalLectures is 0 (shouldn't happen with published courses), we return false
    const isEligible = totalLectures > 0 && completedLectures === totalLectures;

    return NextResponse.json({
      isEligible,
      completedCount: completedLectures,
      totalCount: totalLectures,
      percentage: totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0
    });
    
  } catch (error) {
    console.error("[CERTIFICATE_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}