import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Enrollments
    const enrollments = await db.myEnrollment.findMany({
      where: { userId: sessionUser.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lectures: {
                  select: { 
                    id: true, 
                    title: true, 
                    position: true ,
                    userProgress: {
                        where: { userId: sessionUser.id },
                        select: { isCompleted: true }
                    }
                },
                },
              },
            },
          },
        },
      },
    });

    // 2. Fetch User Progress
    const userProgress = await db.userProgress.findMany({
      where: {
        userId: sessionUser.id,
        isCompleted: true,
      },
      select: { lectureId: true },
    });

    const completedLectureIds = new Set(userProgress.map((p) => p.lectureId));

    // 3. Transform Data
    const courses = enrollments.map((enrollment) => {
      const course = enrollment.course;
      const allLectures = course.modules.flatMap((m) => m.lectures);
      const totalLectures = allLectures.length;

      const completedCount = allLectures.filter((lec) =>
        completedLectureIds.has(lec.id)
      ).length;

      const progressPercentage =
        totalLectures === 0 ? 0 : Math.round((completedCount / totalLectures) * 100);

      let status = "Not Started";
      if (completedCount === totalLectures && totalLectures > 0) {
        status = "Completed";
      } else if (completedCount > 0) {
        status = "In Progress";
      }

      const nextLecture = allLectures.find((lec) => !completedLectureIds.has(lec.id));

      const subtitle =
        status === "Completed"
          ? "Course Completed 🎉"
          : nextLecture
          ? `Up Next: ${nextLecture.title}`
          : course.subtitle || "No description";

      return {
        id: course.id,
        title: course.title,
        courseCompleted: course.isCompleted,
        subtitle,
        image: course.imageUrl || "",
        modulesCompleted: completedCount,
        totalModules: totalLectures,
        progress: progressPercentage,
        status,
      };
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("[USER_COURSES_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}