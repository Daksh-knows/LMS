import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { lectureId } = await params;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await db.userProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lectureId,
        },
      },
      select: {
        isCompleted: true,
        quizScore: true,
        updatedAt: true,
      }
    });

    // If no progress record OR quizScore is null, it's a first-time start
    if (!progress || progress.quizScore === null) {
      return NextResponse.json({ 
        hasSubmitted: false, 
        message: "First time starting the quiz." 
      });
    }

    // If record exists with a score, it was previously submitted
    return NextResponse.json({
      hasSubmitted: true,
      score: progress.quizScore,
      completedAt: progress.updatedAt,
    });

  } catch (error) {
    console.error("[QUIZ_STATUS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}