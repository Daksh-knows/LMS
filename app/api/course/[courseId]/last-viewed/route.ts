import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: NextRequest,
  context : { params : Promise< { courseId: string } > }
) {
  try {
    const user = await getCurrentUser();
    const { courseId } = await context.params;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the progress record updated most recently for this course
    const lastProgress = await db.userProgress.findFirst({
        where: {
            userId: user.id,
            courseId: courseId,
        },
        orderBy: {
            updatedAt: "desc", 
        },
        include: {
            lecture: {
            select: {
                id: true,
                title: true,
                type: true,
            },
            },
        },
        });

    if (!lastProgress) {
      return NextResponse.json({ lastLectureId: null });
    }

    return NextResponse.json({
      lastLectureId: lastProgress.lectureId,
      lectureTitle: lastProgress.lecture.title,
      type: lastProgress.lecture.type
    });

  } catch (error) {
    console.error("[LAST_VIEWED_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}