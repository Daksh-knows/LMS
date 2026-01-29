"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";
import { useSession } from "next-auth/react";

export interface EnrolledCourse {
  id: string;
  title: string;
  subtitle: string; 
  image: string;
  modulesCompleted: number; 
  totalModules: number; 
  progress: number; 
  status: "Not Started" | "In Progress" | "Completed";
}

export default function CourseFilterList() {
  const [filter, setFilter] = useState("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [initialCourses, setInitialCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for the initial fetch
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/courses"); // The API we created earlier
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setInitialCourses(data);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  const filteredCourses = initialCourses.filter((course) => {
    if (filter === "All") return true;
    return course.status === filter;
  });

  const handleCourseSelect = async (courseId: string) => {
    try {
      setLoadingId(courseId);
      const baseUrl = window.location.origin;
      // 1. Fetch the last viewed lecture for this specific user and course
      const lastViewedRes = await fetch(`${baseUrl}/api/course/${courseId}/last-viewed`);
      const lastViewedData = await lastViewedRes.json();

      // 2. If a last viewed lecture exists, redirect there immediately
      if (lastViewedData && lastViewedData.lastLectureId) {
        router.push(`/learning/${courseId}/${lastViewedData.lastLectureId}`);
        return; // Exit early
      }
      // 3. FALLBACK: If no progress exists, fetch course structure to find the first lecture
      const courseResponse = await fetch(`${baseUrl}/api/course/${courseId}?userId=${userId}`, {
        cache: 'no-store'
      });

      if (!courseResponse.ok) throw new Error("Failed to fetch course data");
      const courseData = await courseResponse.json();
      // Get the first lecture of the first module
      const firstLectureId = courseData.modules?.[0]?.lectures?.[0]?.id;

      if (firstLectureId) {
        router.push(`/learning/${courseId}/${firstLectureId}`);
      } else {
        alert("This course has no lectures available yet.");
      }
    } catch (error) {
      console.error("Redirection error:", error);
      alert("An error occurred while trying to start the course.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {["All", "Completed", "In Progress"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === tab
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No courses found in this category.
          </p>
        )}

        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl p-4 flex gap-6 shadow-sm border border-gray-100 items-center hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="w-48 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">
                  NO IMAGE
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm mb-3">{course.subtitle}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">
                {course.modulesCompleted} / {course.totalModules} Lectures
                Completed
              </p>
            </div>

            {/* Progress & Action */}
            <div className="flex flex-col items-end gap-4">
              <div className="relative w-10 h-10">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-gray-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    className={
                      course.progress === 100
                        ? "text-green-500"
                        : "text-purple-600"
                    }
                    strokeDasharray={`${course.progress}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              {/* DYNAMIC BUTTON LOGIC */}
              <button
                onClick={() => handleCourseSelect(course.id)}
                className={`px-6 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  course.status === "Completed"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                }`}
              >
                {course.status === "Not Started" && "Start Course"}
                {course.status === "In Progress" && "Continue Learning"}
                {course.status === "Completed" && "Review Course"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
