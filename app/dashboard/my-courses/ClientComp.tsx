"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion"; // Import motion
import { generateCertificate } from "@/lib/certificate-generator";

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const tabs = ["All", "Completed", "In Progress"];
  
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

    const handleDownloadCertificate = (courseTitle: string) => {
        generateCertificate({
          userName: session?.user?.name || "Valued Student",
          courseTitle: courseTitle
        });
      };
  
  if(loading) {
      return (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }
  return (
      <div className="space-y-6">
      {/* Filters: Allow horizontal scrolling on very small screens */}
      <div className="flex p-1 bg-gray-100/50 rounded-full w-fit border border-gray-200 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`relative px-5 md:px-8 py-2 rounded-full text-xs md:text-sm font-semibold transition-colors duration-300 whitespace-nowrap focus-visible:outline-none ${
              filter === tab ? "text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {/* The Sliding Pill */}
            {filter === tab && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-gray-900 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {/* Text Label - Needs z-index to stay above the pill */}
            <span className="relative z-10">{tab}</span>
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
            // 1. CLICKABLE WRAPPER
            onClick={() => handleCourseSelect(course.id)}
            // 2. CURSOR POINTER
            className="bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:gap-6 shadow-sm border border-gray-100 items-start md:items-center hover:shadow-md transition-shadow cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="w-full md:w-48 h-40 md:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
              {course.image ? (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">
                  NO IMAGE
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full">
              <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.subtitle}</p>
              <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wide font-semibold">
                {course.modulesCompleted} / {course.totalModules} Lectures Completed
              </p>
            </div>

            {/* Progress & Action Section */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
              {/* Progress Circle */}
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={course.progress === 100 ? "text-green-500" : "text-purple-600"}
                    strokeDasharray={`${course.progress}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 w-full sm:w-auto">
                {course.progress === 100 && (
                  <button
                    onClick={(e) => {
                      // 3. STOP PROPAGATION
                      e.stopPropagation(); 
                      handleDownloadCertificate(course.title);
                    }}
                    className="px-3 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs shadow-sm whitespace-nowrap z-10"
                  >
                    Download Certificate
                  </button>
                )}

                {/* This button essentially duplicates the card click, but is kept for visual clarity */}
                <div
                  className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-xs md:text-sm flex-1 text-center ${
                    course.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {course.status === "Not Started" && "Start Course"}
                  {course.status === "In Progress" && "Continue"}
                  {course.status === "Completed" && "Review"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
