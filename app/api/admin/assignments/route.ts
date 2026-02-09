import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated and is an ADMIN (or INSTRUCTOR)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const adminId = session.user.id;

    // Fetch ASSIGNMENT lectures that belong to courses created by THIS admin/instructor
    const assignments = await db.lecture.findMany({
      where: {
        type: "ASSIGNMENT",
        // 1. Filter by Course Creator (Instructor)
        module: {
          course: {
            adminId: adminId, 
          },
        },
        // 2. Only show assignments that actually have submissions
        submissions: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        module: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        submissions: {
          select: {
            grade: true,
          },
        },
      },
    });

    // Transform data
    const data = assignments.map((lecture) => {
      const total = lecture.submissions.length;
      const pending = lecture.submissions.filter(
        (s) => s.grade === null
      ).length;

      return {
        id: lecture.id,
        title: lecture.title,
        courseName: lecture.module.course.title,
        totalSubmissions: total,
        pendingReviews: pending,
      };
    });

    // Sort lectures: pending reviews first, then by total count
    data.sort((a, b) => b.pendingReviews - a.pendingReviews || b.totalSubmissions - a.totalSubmissions);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[ADMIN_ASSIGNMENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal Error" },
      { status: 500 }
    );
  }
}