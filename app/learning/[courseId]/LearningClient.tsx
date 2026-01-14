"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Components
import VideoPlayer from "../components/VideoPlayer";
import CourseSidebar from "../components/CourseSidebar";
import TabbedContent from "../components/TabbedContent";

interface LearningClientProps {
  course: any;
}

export default function LearningClient({ course }: LearningClientProps) {
  // Initialize state with the first lecture of the first module
  const [currentLecture, setCurrentLecture] = useState(
    course.modules[0]?.lectures[0]
  );
  // Safety check if a course has no content
  if (!currentLecture) {
    return <div className="p-10">This course has no lectures yet.</div>;
  }

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
            {course.title}
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
            {/* Pass the current lecture data including resources/attachments */}
            <TabbedContent lecture={currentLecture} />
          </div>
        </main>

        <aside className="w-[350px] shrink-0 border-l border-gray-200 hidden md:block h-full">
          <CourseSidebar
            // Map 'modules' to 'sections' if your Sidebar component expects 'sections'
            sections={course.modules}
            currentLectureId={currentLecture.id}
            onSelectLecture={(lecture: any) => setCurrentLecture(lecture)}
          />
        </aside>
      </div>
    </div>
  );
}
