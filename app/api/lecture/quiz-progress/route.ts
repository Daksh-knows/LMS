import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lectureId, courseId, score } = await req.json();

    // 1. Mastery Logic Check
    const PASSING_SCORE = 80;
    const hasPassed = score >= PASSING_SCORE;

    // If they didn't pass, we don't save progress as 'completed'
    // We just return a success message so the UI can show the fail state
    if (!hasPassed) {
      return NextResponse.json({ 
        passed: false, 
        message: "Score below 80%. Progress not recorded." 
      });
    }

    // 2. If they passed, we upsert progress
    const quizProgress = await db.userProgress.upsert({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lectureId,
        },
      },
      update: {
        quizScore: score,
        isCompleted: true,
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

    return NextResponse.json({ ...quizProgress, passed: true });
  } catch (error) {
    console.error("[QUIZ_PROGRESS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}