import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth"; 

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. OPTIMIZED: Find the last touched lecture using direct 'courseId'
    const lastProgress = await db.userProgress.findFirst({
      where: {
        userId: userId,
        courseId: courseId, // Direct index lookup (Fast!)
      },
      orderBy: {
        updatedAt: 'desc' // Most recently updated/watched
      },
      select: {
        lectureId: true
      }
    });

    if (lastProgress) {
      return NextResponse.json({ 
        url: `/learning/${courseId}/${lastProgress.lectureId}` 
      });
    }

    // 2. Fallback: Find the very first lecture of the course
    // (This part remains the same as it relies on the Course structure)
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          take: 1,
          include: {
            lectures: {
              orderBy: { position: 'asc' },
              take: 1,
              select: { id: true }
            }
          }
        }
      }
    });

    const firstLectureId = course?.modules[0]?.lectures[0]?.id;

    if (firstLectureId) {
      return NextResponse.json({ 
        url: `/learning/${courseId}/${firstLectureId}` 
      });
    }

    // Edge case: Course has no lectures created yet
    return NextResponse.json({ 
      url: `/dashboard/courses/${courseId}` 
    });

  } catch (error) {
    console.error("[COURSE_RESUME_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}