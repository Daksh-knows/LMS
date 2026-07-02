import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lectureId } = await params;

    const lecture = await db.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        videoUrl: true,
        position: true,
        moduleId: true,
        textContent: true,
        duration: true,
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    // Convert gs:// path to a browser-playable public HTTPS URL if needed
    let playableVideoUrl = lecture.videoUrl;
    if (playableVideoUrl && playableVideoUrl.startsWith("gs://")) {
      const path = playableVideoUrl.substring(5); // remove "gs://"
      playableVideoUrl = `https://storage.googleapis.com/${path}`;
    }


    return NextResponse.json({
      ...lecture,
      videoUrl: playableVideoUrl,
    });
  } catch (error) {
    console.error("[ADMIN_LECTURE_GET_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
