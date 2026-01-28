import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lectureId, courseId } = await req.json();

    if (!lectureId || !courseId) {
      return NextResponse.json({ error: "Missing lectureId or courseId" }, { status: 400 });
    }

    const progress = await db.userProgress.upsert({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lectureId,
        },
      },
      update: {
        isCompleted: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        lectureId: lectureId,
        courseId: courseId, 
        isCompleted: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LECTURE_COMPLETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}