"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

interface Course {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  modulesCompleted: number;
  totalModules: number;
  status: string;
}

export default function CourseFilterList({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  const [filter, setFilter] = useState("All");
  const router = useRouter(); // Initialize router

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
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl p-4 flex gap-6 shadow-sm border border-gray-100 items-center hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="w-48 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-blue-900 relative">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover opacity-80"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-gray-400 text-xs mb-1 font-bold tracking-wide uppercase">
                COURSE ID: {course.id}
              </p>
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                Up Next: {course.subtitle}
              </p>
              <p className="text-gray-400 text-xs">
                {course.modulesCompleted}/{course.totalModules} Modules
                Completed
              </p>
            </div>

            {/* Progress & Action */}
            <div className="flex flex-col items-end gap-4">
              <div className="relative w-10 h-10">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-400"
                    strokeDasharray={`${
                      (course.modulesCompleted / course.totalModules) * 100
                    }, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              {/* LINKING LOGIC HERE */}
              <button
                onClick={() => router.push(`/learning/${course.id}`)}
                className="bg-orange-100 text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-200 transition-colors whitespace-nowrap"
              >
                {course.modulesCompleted > 0
                  ? "Continue Learning"
                  : "Start Course"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
