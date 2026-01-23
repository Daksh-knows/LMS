"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, VideoOff, Loader2, BrainCircuit, PlayCircle, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Components
import VideoPlayer from "../../components/VideoPlayer";
import CourseSidebar from "../../components/CourseSidebar";
import TabbedContent from "../../components/TabbedContent";
import QuizComponent from "@/components/QuizComponent";

interface LearningClientProps {
  course: any;
  lectureId: string;
}

export default function LearningClient({ course, lectureId }: LearningClientProps) {
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/lecture/${lectureId}`);
        if (!response.ok) throw new Error("Failed to fetch lecture");
        const data = await response.json();
        setCurrentLecture(data);
      } catch (error) {
        console.error("Error loading lecture:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lectureId) {
      fetchLecture();
    }
  }, [lectureId]);

  const handleSelectLecture = (selectedLecture: any) => {
    router.push(`/learning/${course.id}/${selectedLecture.id}`);
  };

  // --- Helper to parse Quiz Metadata ---
  const getQuizData = () => {
    if (currentLecture?.type !== "QUIZ" || !currentLecture?.description) return null;
    try {
      return JSON.parse(currentLecture.description);
    } catch (e) {
      console.error("Failed to parse quiz metadata", e);
      return null;
    }
  };

  const quizData = getQuizData();

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
          <div className="font-bold text-sm md:text-base truncate text-gray-100">
            {course.title}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-white relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Loading content...</p>
            </div>
          ) : currentLecture ? (
            <>
              <div className="w-full">
                {/* --- VIDEO PLAYER --- */}
                {currentLecture.type === 'VIDEO' && <VideoPlayer videoUrl={currentLecture.videoUrl} />}

                {/* --- QUIZ UI --- */}
                {currentLecture.type === 'QUIZ' && quizData && <QuizComponent lecture={currentLecture} />}
              </div>

              {/* Lecture Info and Tabs */}
              <div className="w-full p-5">
                <div className="mt-8 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentLecture.title}
                  </h1>
                </div>
                <TabbedContent lecture={currentLecture} courseId={course.id} adminId={course.adminId} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <VideoOff size={48} className="text-gray-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">No lectures found</h2>
              <p className="text-gray-500 max-w-xs mt-2">Content hasn't been uploaded yet.</p>
            </div>
          )}
        </main>

        <aside className="w-[350px] shrink-0 border-l border-gray-200 hidden md:block h-full">
          <CourseSidebar
            sections={course.modules || []}
            currentLectureId={lectureId}
            onSelectLecture={handleSelectLecture}
          />
        </aside>
      </div>
    </div>
  );
}