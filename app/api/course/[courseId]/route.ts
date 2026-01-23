import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary"; // Your Cloudinary configuration


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
        adminId: true, // <--- ADDED THIS FIELD HERE
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
                type: true,
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

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = await params;

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
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return new NextResponse("Unauthorized: Admin ID required", { status: 401 });
    }

    const updatedData = await req.json();

    // 1. Ownership Check
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.adminId !== adminId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Prepare Update Data
    const dataToUpdate: any = {
      title: updatedData.title,
      description: updatedData.description || updatedData.subtitle,
      imageUrl: updatedData.image || updatedData.imageUrl,
    };

    // 3. Handle Category Update (if tags provided)
    if (updatedData.tags && updatedData.tags.length > 0) {
      const categoryName = updatedData.tags[0];
      const category = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      dataToUpdate.categoryId = category.id;
    }

    // 4. Update Database
    await db.course.update({
      where: { id: courseId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[COURSE_UPDATE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update course" },
      { status: 500 }
    );
  }
}