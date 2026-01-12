"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { courseData, Lecture } from './data';
import VideoPlayer from './components/VideoPlayer';
import CourseSidebar from './components/CourseSidebar';
import TabbedContent from './components/TabbedContent';

export default function LearningPage() {
  // Accessing the first lecture dynamically through the courseData object
  const [currentLecture, setCurrentLecture] = useState<Lecture>(
    courseData.sections[0].lectures[0]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* NAVBAR: Showing Course Name from data.ts */}
      <nav className="h-14 bg-gray-900 text-white flex items-center justify-between px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors group shrink-0"
          >
            <div className="p-1 rounded-full group-hover:bg-gray-800">
              <ChevronLeft size={20} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>
          
          <div className="h-6 w-[1px] bg-gray-700 mx-2 hidden sm:block shrink-0"></div>
          
          {/* Dynamic Course Title from data.ts */}
          <div className="font-bold text-sm md:text-base truncate text-gray-100">
            {courseData.courseTitle}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
           <button className="text-xs border border-gray-600 px-3 py-1 rounded hover:bg-gray-800 transition-colors">
             Share
           </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="w-full">
            <VideoPlayer videoUrl={currentLecture.videoUrl} />
          </div>
          <div className="max-w-4xl mx-auto px-6 pb-10">
             {/* Component title within the page is still the lecture title */}
             <div className="mt-8 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{currentLecture.title}</h1>
             </div>
             <TabbedContent lecture={currentLecture} />
          </div>
        </main>

        {/* Sidebar: Passing sections from courseData */}
        <aside className="w-[350px] shrink-0 border-l border-gray-200 hidden md:block h-full">
          <CourseSidebar 
            sections={courseData.sections} 
            currentLectureId={currentLecture.id}
            onSelectLecture={(lecture) => setCurrentLecture(lecture)}
          />
        </aside>
      </div>
    </div>
  );
}