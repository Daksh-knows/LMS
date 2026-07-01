import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { videoQuestionId, answer, isCorrect } = body;

    if (!videoQuestionId || answer === undefined) {
      return NextResponse.json(
        { error: "Missing videoQuestionId or answer" },
        { status: 400 }
      );
    }

    const response = await db.videoQuestionResponse.upsert({
      where: {
        userId_videoQuestionId: {
          userId,
          videoQuestionId,
        },
      },
      update: {
        answer,
        isCorrect: !!isCorrect,
      },
      create: {
        userId,
        videoQuestionId,
        answer,
        isCorrect: !!isCorrect,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[VIDEO_QUESTIONS_RESPOND_POST_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
