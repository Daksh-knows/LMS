import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary"; 

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;
  const { searchParams } = new URL(request.url);
  let userId = searchParams.get("userId");
  if(!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {

    const course = await db.course.findUnique({
      where: { 
        id: courseId 
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        language: true,
        estimatedDuration: true,
        adminId: true, 
        admin: {
          select: {
            name: true,
            image: true,
            bio: true,
          }
        },
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
                textContent: true,
                duration: true,
                type: true,
                userProgress: {
                  where: {
                    userId: userId || ""
                  },
                  select: {
                    isCompleted: true
                  }
                }
              }
            }
          }
        }
      }
    });
    // console.log("Course fetched:", course);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_API_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;

    // 1. Ownership & Existence Check
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lectures: {
              where: { type: "VIDEO" },
              select: { videoUrl: true }
            }
          }
        }
      }
    });

    if (!course) return new NextResponse("Course not found", { status: 404 });
    

    // 2. Cloudinary Cleanup: Delete all videos in the course
    const videoUrls = course.modules.flatMap(m => 
      m.lectures.map(l => l.videoUrl).filter(Boolean)
    );

    for (const url of videoUrls) {
      if (url?.includes("cloudinary.com")) {
        try {
          const publicId = url.split("/").pop()?.split(".")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
          }
        } catch (error) {
          console.error("Cloudinary Cleanup Error:", error);
        }
      }
    }

    // 3. Delete from DB
    // This will trigger cascade deletes for modules, lectures, and enrollments 
    await db.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return new NextResponse("Unauthorized: Admin ID required", { status: 401 });
    }

    // 1. Get the payload from the EditCourseForm submission
    const updatedData = await req.json();

    // 2. Ownership & Existence Check
    const course = await db.course.findUnique({ 
      where: { id: courseId } 
    });

    if (!course || course.adminId !== adminId) {
      return new NextResponse("Unauthorized or Course not found", { status: 401 });
    }

    // 3. Prepare Precise Update Data
    // We now separate subtitle from description to support the rich-text editor
    const dataToUpdate: any = {
      title: updatedData.title,
      subtitle: updatedData.subtitle,          // Matches the new subtitle field
      description: updatedData.description,    // Stores the TipTap HTML string
      imageUrl: updatedData.image,             // Correctly mapping the Cloudinary URL
      language: updatedData.language,          // New metadata field
      estimatedDuration: updatedData.estimatedDuration, // New metadata field
    };

    // 4. Update Database
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: dataToUpdate,
    });

    return NextResponse.json({ 
      success: true, 
      course: updatedCourse 
    });
  } catch (error: any) {
    console.error("[COURSE_UPDATE_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}