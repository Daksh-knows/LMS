import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth"; 

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const courses = await db.course.findMany({
      orderBy: { title: 'asc' },
      include: {
        category: true,
        // Check if THIS specific user is enrolled
        students: userId ? {
          where: { userId: userId },
          select: { userId: true } 
        } : false
      }
    });

    // Add the flag to the response
    const formattedCourses = courses.map(course => ({
      ...course,
      isEnrolled: course.students && course.students.length > 0
    }));

    return NextResponse.json({ success: true, data: formattedCourses });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load" }, { status: 500 });
  }
}