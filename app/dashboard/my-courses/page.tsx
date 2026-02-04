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

  return (
    <div className="flex-1 p-5  backdrop-blur-xl border border-white/20 min-h-screen rounded-xl">
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
          <CourseFilterList />
        </div>
      </div>
    </div>
  );
}
