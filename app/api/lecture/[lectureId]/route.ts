import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  // Ensure the param name matches your folder name [lectureId]
  { params }: { params: { lectureId: string } } 
) {
  try {
    const { lectureId } = await params;

    const lecture = await db.lecture.findUnique({
      where: { 
        id: lectureId 
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        videoUrl: true,
        position: true,
        moduleId: true,
        resources: {
          select: {
            id: true,
            url: true,
          }
        },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("[COURSE_ITEM_GET_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}