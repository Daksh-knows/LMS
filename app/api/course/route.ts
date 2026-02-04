import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // 1. Get adminId from the URL search parameters
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return new NextResponse("Admin ID is required", { status: 400 });
    }

    // 2. Database Query using the provided ID
    const courses = await db.course.findMany({
      where: { adminId: adminId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: { modules: true, students: true }
        }
      }
    });

    // 3. Data Mapping
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      tags: course.category ? [course.category.name] : ["General"],
      imageUrl: course.imageUrl,
      isPublished: course.isPublished,
      moduleCount: course._count.modules,
      studentCount: course._count.students
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("[GET_MANAGED_COURSES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1. Authorization Check
    if (!data.adminId) {
      return new NextResponse("Unauthorized: Admin ID required", { status: 401 });
    }

    // 2. Prepare the payload based on the new schema
    const payload: any = {
      title: data.title,
      subtitle: data.subtitle,          // The catchy one-liner
      description: data.description,    // The rich-text HTML from TipTap
      imageUrl: data.imageUrl,          // Cloudinary URL from the frontend upload
      language: data.language || "English",
      estimatedDuration: data.estimatedDuration,
      adminId: data.adminId,
      isPublished: false,
    };

    // 4. Create Course in Database
    const newCourse = await db.course.create({
      data: payload,
    });

    return NextResponse.json({ 
      success: true, 
      id: newCourse.id 
    });

  } catch (error: any) {
    console.error("[COURSE_CREATE_POST]", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to create course" 
      },
      { status: 500 }
    );
  }
}