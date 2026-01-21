"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, VideoOff } from "lucide-react";

// Components
import VideoPlayer from "../components/VideoPlayer";
import CourseSidebar from "../components/CourseSidebar";
import TabbedContent from "../components/TabbedContent";

interface LearningClientProps {
  course: any;
}

export default function LearningClient({ course }: LearningClientProps) {
  // 1. Safe state initialization (defaults to null if no lectures exist)
  const [currentLecture, setCurrentLecture] = useState(
    course.modules?.[0]?.lectures?.[0] || null
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Navbar - This will now always show */}
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
          <div className="font-bold text-sm md:text-base truncate text-gray-100">
            {course.title}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white">
          {currentLecture ? (
            <>
              <div className="w-full">
                <VideoPlayer videoUrl={currentLecture.videoUrl} />
              </div>
              <div className="max-w-4xl mx-auto px-6 pb-10">
                <div className="mt-8 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentLecture.title}
                  </h1>
                </div>
                <TabbedContent lecture={currentLecture} />
              </div>
            </>
          ) : (
            /* 2. Placeholder UI when no lecture is selected/available */
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <VideoOff size={48} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">No lectures found</h2>
              <p className="text-gray-500 max-w-xs mt-2">
                Content hasn't been uploaded for this course yet. Please check back later.
              </p>
            </div>
          )}
        </main>

        <aside className="w-[350px] shrink-0 border-l border-gray-200 hidden md:block h-full">
          {/* 3. Sidebar remains visible, but passes empty arrays if modules don't exist */}
          <CourseSidebar
            sections={course.modules || []}
            currentLectureId={currentLecture?.id}
            onSelectLecture={(lecture: any) => setCurrentLecture(lecture)}
          />
        </aside>
      </div>
    </div>
  );
}