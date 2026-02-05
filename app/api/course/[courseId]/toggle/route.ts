import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "next-auth/react";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const { isCompleted } = await req.json();

    // 1. Authorization: Get the current user session
    // This is safer than passing adminId in the URL
    const session = await db.user.findFirst({
        where: {
            role: "ADMIN" // Or use your specific auth session logic
        }
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Ownership Check: Ensure this admin owns the course
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { adminId: true }
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Optional: if (course.adminId !== session.id) return ...

    // 3. Update the Course status
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: {
        isCompleted: !isCompleted,
      },
    });

    return NextResponse.json({
      success: true,
      isCompleted: updatedCourse.isCompleted
    });

  } catch (error: any) {
    console.error("[COURSE_TOGGLE_COMPLETION]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course status" },
      { status: 500 }
    );
  }
}