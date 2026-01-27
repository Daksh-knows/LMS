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

export async function POST(req: Request) {
  try {


    const data = await req.json();
    // 1. Authorization Check (via Param)
    if (!data.adminId) {
      return new NextResponse("Unauthorized: Admin ID required", { status: 401 });
    }


    // 2. Handle Category (Upsert based on first tag)
    let categoryId = null;
    if (data.tags && data.tags.length > 0) {
      const categoryName = data.tags[0];
      const category = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = category.id;
    }

    // 3. Create Course
    const newCourse = await db.course.create({
      data: {
        title: data.title,
        description: data.subtitle, // Mapping 'subtitle' to 'description'
        imageUrl: data.image,
        adminId: data.adminId,
        categoryId: categoryId,
        isPublished: false,
      },
    });

    return NextResponse.json({ success: true, id: newCourse.id });
  } catch (error: any) {
    console.error("[COURSE_CREATE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}