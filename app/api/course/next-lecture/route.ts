import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { computeLockState } from "@/lib/drip";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const lectureId = searchParams.get("lectureId");
    const userId = searchParams.get("userId");

    if (!courseId || !lectureId) {
      return new NextResponse("Missing IDs", { status: 400 });
    }

    // 1. Fetch current lecture and its module position
    const currentLecture = await db.lecture.findUnique({
      where: { id: lectureId, isPublished: true },
      include: {
        module: {
          select: { position: true }
        },
      },
    });

    if (!currentLecture) return new NextResponse("Not found", { status: 404 });

    // Completed lectures for prereq evaluation (only when we know the user).
    let completedLectureIds: string[] = [];
    if (userId) {
      const done = await db.userProgress.findMany({
        where: { userId, courseId, isCompleted: true },
        select: { lectureId: true },
      });
      completedLectureIds = done.map((d) => d.lectureId);
    }

    // A lecture is skippable as "next" if drip-locked (time or prereq).
    const isLocked = (lec: {
      releaseAt: Date | null;
      prerequisites: { prerequisiteId: string }[];
    }, moduleReleaseAt: Date | null) =>
      computeLockState({
        lectureReleaseAt: lec.releaseAt,
        moduleReleaseAt,
        prerequisiteIds: lec.prerequisites.map((p) => p.prerequisiteId),
        completedLectureIds,
      }).isLocked;

    // 2. Next unlocked lecture in the same module
    const laterInModule = await db.lecture.findMany({
      where: {
        moduleId: currentLecture.moduleId,
        position: { gt: currentLecture.position },
        isPublished: true,
      },
      orderBy: { position: "asc" },
      select: {
        id: true,
        releaseAt: true,
        prerequisites: { select: { prerequisiteId: true } },
        module: { select: { releaseAt: true } },
      },
    });

    const nextInModule = laterInModule.find((l) => !isLocked(l, l.module.releaseAt));
    if (nextInModule) return NextResponse.json({ nextId: nextInModule.id });

    // 3. First unlocked lecture of a following module
    const laterModules = await db.module.findMany({
      where: {
        courseId: courseId,
        position: { gt: currentLecture.module.position },
        isPublished: true,
      },
      orderBy: { position: "asc" },
      select: {
        releaseAt: true,
        lectures: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            releaseAt: true,
            prerequisites: { select: { prerequisiteId: true } },
          },
        },
      },
    });

    for (const mod of laterModules) {
      const firstUnlocked = mod.lectures.find((l) => !isLocked(l, mod.releaseAt));
      if (firstUnlocked) return NextResponse.json({ nextId: firstUnlocked.id });
    }

    return NextResponse.json({ nextId: null });
  } catch (error) {
    console.error("[NEXT_LECTURE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}