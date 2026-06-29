import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lectureId } = await context.params;
    const body = await req.json();
    const { timestamp, type, text, imageUrl, options, correctAnswer } = body;

    if (!text || timestamp === undefined || !type) {
      return NextResponse.json(
        { error: "Missing required fields (text, timestamp, type)" },
        { status: 400 }
      );
    }

    // Create the question in the database
    const videoQuestion = await db.videoQuestion.create({
      data: {
        lectureId,
        timestamp: parseFloat(timestamp),
        type,
        text,
        imageUrl: imageUrl || null,
        options: options || [],
        correctAnswer: correctAnswer || "",
      },
    });

    return NextResponse.json(videoQuestion);
  } catch (error) {
    console.error("[VIDEO_QUESTIONS_POST_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }
) {
  try {
    const { lectureId } = await context.params;

    const questions = await db.videoQuestion.findMany({
      where: { lectureId },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("[VIDEO_QUESTIONS_GET_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
