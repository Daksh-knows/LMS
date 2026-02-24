import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
{ params }: { params: Promise<{ courseId: string }> }
) {
  try {
    console.log()
    const user = await getCurrentUser();
    const courseId = (await params).courseId;
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Get the total number of published lectures in this course
    // We navigate Course -> Modules -> Lectures
    const totalLectures = await db.lecture.count({
      where: {
        module: {
          courseId: courseId,
        },
        isPublished: true,
      },
    });
    console.log("Total lectures " , totalLectures) ;
    // 2. Count completed lectures from UserProgress
    const completedLecturesCount = await db.userProgress.count({
      where: {
        userId: user.id,
        courseId: courseId,
        isCompleted: true,
      },
    });
    console.log("Completed lectures " , completedLecturesCount) ;

    // 3. Calculate percentage
    const progressPercentage = totalLectures > 0 
      ? (completedLecturesCount / totalLectures) * 100 
      : 0;

    return NextResponse.json({
      completedCount: completedLecturesCount,
      totalCount: totalLectures,
      percentage: Math.round(progressPercentage),
    });
  } catch (error) {
    console.error("[COURSE_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}