import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch ASSIGNMENT lectures that have submissions
    const assignments = await db.lecture.findMany({
      where: {
        type: "ASSIGNMENT",
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

    // Sort lectures with pending reviews first
    data.sort((a, b) => b.pendingReviews - a.pendingReviews);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[ADMIN_ASSIGNMENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal Error" },
      { status: 500 }
    );
  }
}
