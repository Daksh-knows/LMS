import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lectureId, courseId, score } = body;
    console.log("Received quiz progress data:", body);
    if (!lectureId || !courseId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // We use upsert so that if they retake the quiz, it updates their best score
    const quizProgress = await db.userProgress.upsert({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lectureId,
        },
      },
      update: {
        quizScore: score,
        isCompleted: true, // A submitted quiz is a completed quiz
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        lectureId: lectureId,
        courseId: courseId,
        quizScore: score,
        isCompleted: true,
      },
    });

    return NextResponse.json(quizProgress);
  } catch (error) {
    console.error("[QUIZ_PROGRESS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}