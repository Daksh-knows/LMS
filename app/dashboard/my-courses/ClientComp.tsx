"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Updated Interface to match what we will calculate in page.tsx
export interface EnrolledCourse {
  id: string;
  title: string;
  subtitle: string; // Will show "Next: [Lecture Title]" or Description
  image: string;
  modulesCompleted: number; // Actually "Lectures Completed"
  totalModules: number; // Actually "Total Lectures"
  progress: number; // Percentage (0-100)
  status: "Not Started" | "In Progress" | "Completed";
}

export default function CourseFilterList({
  initialCourses,
}: {
  initialCourses: EnrolledCourse[];
}) {
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  const filteredCourses = initialCourses.filter((course) => {
    if (filter === "All") return true;
    return course.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
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
            <div className="w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
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
                onClick={() => router.push(`/learning/${course.id}`)}
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
