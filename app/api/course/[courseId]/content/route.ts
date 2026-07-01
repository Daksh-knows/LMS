import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
   context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    // 1. Basic Authorization Check
    if (!adminId) {
      return new NextResponse("Unauthorized: Admin ID required", { status: 401 });
    }

    // 2. Fetch Course with all nested relations
    const course = await db.course.findUnique({
      where: { 
        id: courseId,
        adminId: adminId // Ensure the course belongs to this admin
      },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lectures: {
              orderBy: { position: 'asc' },
              include: {
                resources: true,      // Attachments
                quizQuestions: {      // Quiz Data
                  include: { options: true },
                  orderBy: { position: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found." }, { status: 404 });
    }

    // 3. Map Database structure to UI structure
    const sections = course.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      lectures: mod.lectures.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type, 
        isPublished: item.isPublished,
        isFree: item.isFree,
        
        // Mapped Fields
        videoUrl: item.videoUrl,
        duration: item.duration,
        htmlContent: item.textContent, // Map DB 'textContent' to UI 'htmlContent'
        description: item.description, // Used for assignment instructions / Quiz metadata
        
        attachments: item.resources,   // Map DB 'resources' to UI 'attachments'
        questions: item.quizQuestions,
        rubric: item.rubric,
      }))
    }));

    return NextResponse.json({ 
      success: true, 
      courseTitle: course.title, 
      sections: sections 
    });

  } catch (error: any) {
    console.error("[GET_COURSE_CONTENT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load content." }, 
      { status: 500 }
    );
  }
}