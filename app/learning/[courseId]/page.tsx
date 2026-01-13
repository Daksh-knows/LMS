"use client";

import React, { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation"; // Hook to get URL params
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Import the JSON database directly
import allCourses from "@/data/courseData.json";

// Reuse your components (ensure import paths are correct based on where you put them)
import VideoPlayer from "../components/VideoPlayer";
import CourseSidebar from "../components/CourseSidebar";
import TabbedContent from "../components/TabbedContent";

// Define types locally or in a separate types file and import them
import { Lecture, Course } from "../types";

export default function LearningPage() {
  const params = useParams();
  const { courseId } = params;

  // 1. FETCH DATA: Find the course matching the URL ID
  const courseData = allCourses.find((c) => c.courseId === courseId);

  // 2. HANDLE 404: If course not found, return Next.js notFound()
  if (!courseData) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <Link href="/" className="text-purple-600 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // 3. STATE: Initialize with the first lecture of the found course
  // We use a key={courseId} on the component to force a reset when switching courses
  const [currentLecture, setCurrentLecture] = useState<Lecture>(
    courseData.sections[0].lectures[0] as Lecture
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Navbar */}
      <nav className="h-14 bg-gray-900 text-white flex items-center justify-between px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/dashboard/my-courses"
            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors group shrink-0"
          >
            <div className="p-1 rounded-full group-hover:bg-gray-800">
              <ChevronLeft size={20} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-[1px] bg-gray-700 mx-2 hidden sm:block shrink-0"></div>
          {/* Dynamic Title */}
          <div className="font-bold text-sm md:text-base truncate text-gray-100">
            {courseData.courseTitle}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="w-full">
            <VideoPlayer videoUrl={currentLecture.videoUrl} />
          </div>
          <div className="max-w-4xl mx-auto px-6 pb-10">
            <div className="mt-8 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentLecture.title}
              </h1>
            </div>
            {/* Cast to any if strict type checking complains about JSON vs Interface differences */}
            <TabbedContent lecture={currentLecture as any} />
          </div>
        </main>

        <aside className="w-[350px] shrink-0 border-l border-gray-200 hidden md:block h-full">
          <CourseSidebar
            sections={courseData.sections as any}
            currentLectureId={currentLecture.id}
            onSelectLecture={(lecture) => setCurrentLecture(lecture)}
          />
        </aside>
      </div>
    </div>
  );
}
