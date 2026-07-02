import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { computeLockState } from "@/lib/drip";

/**
 * Spend one skip credit to unlock a prerequisite-gated lecture.
 * Marks the lecture's unmet prerequisites as completed for the user and
 * decrements the enrollment's credit balance. Time gates cannot be bypassed.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }
) {
  try {
    const { lectureId } = await context.params;

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lecture = await db.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        releaseAt: true,
        prerequisites: { select: { prerequisiteId: true } },
        module: { select: { releaseAt: true, courseId: true } },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    const courseId = lecture.module.courseId;

    const enrollment = await db.myEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { skipCredits: true },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    const prerequisiteIds = lecture.prerequisites.map((p) => p.prerequisiteId);
    const done = await db.userProgress.findMany({
      where: { userId, courseId, isCompleted: true },
      select: { lectureId: true },
    });
    const completedLectureIds = done.map((d) => d.lectureId);

    const lock = computeLockState({
      lectureReleaseAt: lecture.releaseAt,
      moduleReleaseAt: lecture.module.releaseAt,
      prerequisiteIds,
      completedLectureIds,
    });

    // Time gates are absolute and cannot be bypassed with credits.
    if (lock.lockedByTime) {
      return NextResponse.json(
        { error: "This lecture is time-locked and cannot be unlocked with credits.", releaseAt: lock.releaseAt },
        { status: 400 }
      );
    }

    if (!lock.lockedByPrereq) {
      return NextResponse.json({ error: "This lecture has no prerequisites to unlock." }, { status: 400 });
    }

    if (enrollment.skipCredits < 1) {
      return NextResponse.json({ error: "No skip credits remaining.", creditsRemaining: 0 }, { status: 400 });
    }

    // Atomically mark unmet prerequisites complete and spend one credit.
    await db.$transaction([
      ...lock.unmetPrerequisiteIds.map((prereqId) =>
        db.userProgress.upsert({
          where: { userId_lectureId: { userId, lectureId: prereqId } },
          update: { isCompleted: true },
          create: { userId, lectureId: prereqId, courseId, isCompleted: true },
        })
      ),
      db.myEnrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: { skipCredits: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      creditsRemaining: enrollment.skipCredits - 1,
      unlockedPrerequisiteIds: lock.unmetPrerequisiteIds,
    });
  } catch (error: any) {
    console.error("[LECTURE_BYPASS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
