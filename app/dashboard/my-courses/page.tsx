import { db } from "@/lib/db"; // Ensure db is imported correctly
import CourseFilterList, { EnrolledCourse } from "./ClientComp";

// HARDCODED USER ID (Replace with real auth later)
const TEST_USER_ID = "cmkcija2h0000u0esuroeb24t";

export default async function MyCoursesPage() {
  // 1. Fetch courses the user is enrolled in
  const enrollments = await db.enrollment.findMany({
    where: {
      userId: TEST_USER_ID,
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lectures: {
                select: { id: true, title: true, position: true }, // Fetch IDs to count totals
              },
            },
          },
        },
      },
    },
  });

  // 2. Fetch the user's progress (all completed lectures)
  const userProgress = await db.userProgress.findMany({
    where: {
      userId: TEST_USER_ID,
      isCompleted: true,
    },
    select: { lectureId: true },
  });

  // Create a Set for fast O(1) lookups
  const completedLectureIds = new Set(userProgress.map((p) => p.lectureId));

  // 3. Transform Data: Calculate Progress per Course
  const courses: EnrolledCourse[] = enrollments.map((enrollment) => {
    const course = enrollment.course;

    // Flatten all lectures in the course into one array
    const allLectures = course.modules.flatMap((m) => m.lectures);
    const totalLectures = allLectures.length;

    // Count how many are completed
    const completedCount = allLectures.filter((lec) =>
      completedLectureIds.has(lec.id)
    ).length;

    // Calculate percentage
    const progressPercentage =
      totalLectures === 0
        ? 0
        : Math.round((completedCount / totalLectures) * 100);

    // Determine Status
    let status: "Not Started" | "In Progress" | "Completed" = "Not Started";
    if (completedCount === totalLectures && totalLectures > 0) {
      status = "Completed";
    } else if (completedCount > 0) {
      status = "In Progress";
    }

    // Find "Next Up" Lecture Title
    // Find the first lecture that is NOT in the completed set
    const nextLecture = allLectures.find(
      (lec) => !completedLectureIds.has(lec.id)
    );

    // If completed, show "Course Completed", otherwise show next lecture title
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
      image: course.imageUrl || "", // Handle nullable image
      modulesCompleted: completedCount,
      totalModules: totalLectures,
      progress: progressPercentage,
      status: status,
    };
  });

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto flex gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">My Learning</h1>
          <CourseFilterList initialCourses={courses} />
        </div>
      </div>
    </div>
  );
}
