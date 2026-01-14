import { db } from "@/lib/db";
import CourseFilterList, { EnrolledCourse } from "./ClientComp";
import { getCurrentUser } from "@/lib/auth-utils"; // Import the helper
import { notFound } from "next/navigation";

export default async function MyCoursesPage() {
  // 1. Get the authenticated user from the session cookie
  const sessionUser = await getCurrentUser();

  // 2. Security Check: If no user session exists, return notFound or redirect
  if (!sessionUser) {
    return notFound();
  }

  // 3. Fetch courses using the dynamic ID from the cookie
  const enrollments = await db.enrollment.findMany({
    where: {
      userId: sessionUser.id, // Replaced TEST_USER_ID with cookie session ID
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lectures: {
                select: { id: true, title: true, position: true },
              },
            },
          },
        },
      },
    },
  });

  // 4. Fetch the user's progress for specific lectures
  const userProgress = await db.userProgress.findMany({
    where: {
      userId: sessionUser.id, // Replaced TEST_USER_ID with cookie session ID
      isCompleted: true,
    },
    select: { lectureId: true },
  });

  const completedLectureIds = new Set(userProgress.map((p) => p.lectureId));

  // 5. Data Transformation (Mapping DB results to UI props)
  const courses: EnrolledCourse[] = enrollments.map((enrollment) => {
    const course = enrollment.course;
    const allLectures = course.modules.flatMap((m) => m.lectures);
    const totalLectures = allLectures.length;

    const completedCount = allLectures.filter((lec) =>
      completedLectureIds.has(lec.id)
    ).length;

    const progressPercentage =
      totalLectures === 0
        ? 0
        : Math.round((completedCount / totalLectures) * 100);

    let status: "Not Started" | "In Progress" | "Completed" = "Not Started";
    if (completedCount === totalLectures && totalLectures > 0) {
      status = "Completed";
    } else if (completedCount > 0) {
      status = "In Progress";
    }

    const nextLecture = allLectures.find(
      (lec) => !completedLectureIds.has(lec.id)
    );

    const subtitle =
      status === "Completed"
        ? "Course Completed 🎉"
        : nextLecture
        ? `Up Next: ${nextLecture.title}`
        : course.description || "No description";

    return {
      id: course.id,
      title: course.title,
      subtitle: subtitle,
      image: course.imageUrl || "",
      modulesCompleted: completedCount,
      totalModules: totalLectures,
      progress: progressPercentage,
      status: status,
    };
  });

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              My Learning
            </h1>
            <p className="text-gray-500 font-medium">
              Welcome back, {sessionUser.email}
            </p>
          </div>
          <CourseFilterList initialCourses={courses} />
        </div>
      </div>
    </div>
  );
}
