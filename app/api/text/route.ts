import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 
import { auth } from "@/auth"; // Adjust path to your auth config

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");

    if (!session?.user?.id || !lectureId) {
      return NextResponse.json({ isCompleted: false }, { status: 400 });
    }

    const progress = await db.userProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId: lectureId,
        },
      },
    });

    return NextResponse.json({ isCompleted: !!progress?.isCompleted });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { lectureId, courseId } = await req.json();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const progress = await db.userProgress.upsert({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId: lectureId,
        },
      },
      update: { 
        isCompleted: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lectureId: lectureId,
        courseId: courseId,
        isCompleted: true,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[TEXT_PROGRESS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}