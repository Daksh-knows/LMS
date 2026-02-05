import { db } from "@/lib/db";
import { auth } from "@/auth"; // Adjust based on your auth path
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");

    if (!session?.user?.id || !lectureId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const progress = await db.userProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId: lectureId,
        },
      },
      select: {
        isCompleted: true,
      },
    });

    return NextResponse.json({ 
      isCompleted: progress?.isCompleted || false 
    });
  } catch (error) {
    console.error("[LECTURE_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}