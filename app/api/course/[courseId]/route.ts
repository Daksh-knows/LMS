import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = await params;

    const course = await db.course.findUnique({
      where: { 
        id: courseId 
      },
      select: {
        id: true,
        title: true,
        description: true,
        modules: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            position: true,
            lectures: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                position: true,
                videoUrl: true, 
              }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_API_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}