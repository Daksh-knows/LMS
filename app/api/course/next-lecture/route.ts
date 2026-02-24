import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const lectureId = searchParams.get("lectureId");

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

    // 2. Logic to find the next lecture in the same module
    const nextInModule = await db.lecture.findFirst({
      where: {
        moduleId: currentLecture.moduleId,
        position: { gt: currentLecture.position },
        isPublished: true,
      },
      orderBy: { position: "asc" },
    });

    if (nextInModule) return NextResponse.json({ nextId: nextInModule.id });

    // 3. Logic to find the first lecture of the next module
    const nextModule = await db.module.findFirst({
      where: {
        courseId: courseId,
        position: { gt: currentLecture.module.position },
        isPublished: true,
      },
      include: {
        lectures: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          take: 1,
        },
      },
      orderBy: { position: "asc" },
    });
    console.log('-----------------------');
    console.log(nextModule);
    console.log('-----------------------');

    if (nextModule?.lectures?.[0]) {
      return NextResponse.json({ nextId: nextModule.lectures[0].id });
    }

    return NextResponse.json({ nextId: null });
  } catch (error) {
    console.error("[NEXT_LECTURE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}