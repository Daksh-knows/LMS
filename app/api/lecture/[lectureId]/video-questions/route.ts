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

    const { lectureId } = await params;
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
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const { lectureId } = await params;
    
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, text, imageUrl, options, correctAnswer, type } = body;

    if (!id || !text) {
      return NextResponse.json(
        { error: "Missing required fields (id, text)" },
        { status: 400 }
      );
    }

    const updatedQuestion = await db.videoQuestion.update({
      where: { id },
      data: {
        text,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        options: options || [],
        correctAnswer: correctAnswer || "",
        type: type || undefined,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("[VIDEO_QUESTIONS_PUT_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "Missing questionId parameter" },
        { status: 400 }
      );
    }

    await db.videoQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VIDEO_QUESTIONS_DELETE_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
