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
<div className="flex-1 p-4 md:p-8  backdrop-blur-xl border  min-h-screen rounded-[2.5rem] transition-colors duration-500 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex-1">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight transition-colors">
              My Learning
            </h1>
            <p className="text-foreground/50 font-bold mt-1 text-sm md:text-base">
              Welcome back, <span className="text-brand-blue">{sessionUser.email}</span>
            </p>
          </div>
          
          <CourseFilterList />
        </div>
      </div>
    </div>
  );
}
