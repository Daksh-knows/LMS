"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, VideoOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Components
import VideoPlayer from "../../components/VideoPlayer";
import CourseSidebar from "../../components/CourseSidebar";
import TabbedContent from "../../components/TabbedContent";
import QuizComponent from "@/components/QuizComponent";
import AssignmentComponent from "@/components/AssignmentComponent";
import ArticleComponent from "../../components/ArticleComponent";

interface LearningClientProps {
  course: any;
  lectureId: string;
  user: any ;
}

interface Bookmark {
  id: string;
  time: number;
  label: string;
  type: "BOOKMARK" | "IMPORTANT" | "QUESTION";
}

export default function LearningClient({ course, lectureId , user }: LearningClientProps) {
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const searchParams = useSearchParams();
// Create a handler to clear the seek value after the player reacts
  const handleSeekComplete = () => setSeekTo(null);
  const router = useRouter();

  const handleAddBookmark = (newBookmark: Bookmark) => {
    setBookmarks((prev) => [newBookmark, ...prev]);
  };
  
  useEffect(() => {
    const updateProgress = async () => {
      try {
        await fetch("/api/lecture/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lectureId: lectureId,
            courseId: course.id
          }),
        });
      } catch (error) {
        console.error("Failed to update last viewed pulse:", error);
      }
    };

    if (lectureId) {
      updateProgress();
    } 
    console.log("Updating progress for lectureId:", lectureId);
  }, [lectureId]);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/lecture/${lectureId}`);
        if (!response.ok) throw new Error("Failed to fetch lecture");
        const data = await response.json();
        setCurrentLecture(data);
        console.log("Fetched lecture data:", data);
      } catch (error) {
        console.error("Error loading lecture:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBookmarks = async () => {
      setLoadingBookmarks(true);
      try {
        const response = await fetch(`/api/lecture/bookmark?lectureId=${lectureId}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setBookmarks(data);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoadingBookmarks(false);
      }
    };
    if (lectureId) {
      fetchLecture();
      fetchBookmarks() ;
    }

    // console.log("FL" , currentLecture) ; 
  }, [lectureId]);

  const handleSelectLecture = (selectedLecture: any) => {
    const currentTab = searchParams.get("tab") || "overview";
    router.push(`/learning/${course.id}/${selectedLecture.id}?tab=${currentTab}`);
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
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto bg-gray-50 relative h-full">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : currentLecture ? (
                <>
                  {/* --- THE STAGE (Video/Quiz Parent) --- */}
                  <div className="w-full bg-black flex justify-center items-center h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden shadow-inner">
                    <div className="w-full h-full max-w-5xl mx-auto">
                      {/* --- lecture UI --- */}
                      {currentLecture.type === 'VIDEO' && (
                        <div className="flex justify-center aspect-video w-full h-full">
                          <VideoPlayer  
                             videoUrl={currentLecture.videoUrl} 
                             lectureId={currentLecture.id} 
                             seekTo={seekTo} 
                             onSeekComplete={handleSeekComplete}
                             onBookmarkAdded={handleAddBookmark}
                          />
                        </div>
                      )}

                      {/* --- QUIZ UI --- */}
                      {currentLecture.type === 'QUIZ' && quizData && (
                        <div className="h-full w-full bg-white overflow-y-auto">
                          <QuizComponent lecture={currentLecture} courseId={course.id} />
                        </div>
                      )}


                      {/* ASSIGNMENT UI */}
                      {currentLecture.type === 'ASSIGNMENT' && (
                        <div className="h-full w-full bg-white overflow-y-auto scrollbar-hide">
                          <AssignmentComponent lecture={currentLecture} />
                        </div>
                      )}


                      {/* TEXT / ARTICLE UI */}
                      {currentLecture.type === 'TEXT' && (
                        <div className="h-full w-full bg-white overflow-y-auto scrollbar-hide">
                          <ArticleComponent lecture={currentLecture} />
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {/* Lecture Info and Tabs - Now more visible on page load */}
                  <div className="w-full p-5 bg-white border-t border-gray-200">
                    <div className="max-w-5xl mx-auto">
                      <div className="mt-4 mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                          {currentLecture.title}
                        </h1>
                      </div>
                      <TabbedContent 
                         lecture={currentLecture} 
                         courseId={course.id} 
                         adminId={course.adminId} 
                         onBookmarkClick={(time) => setSeekTo(time)}
                         bookmarks={bookmarks}
                         loadingBookmarks={loadingBookmarks}
                         setBookmarks={setBookmarks}
                         setLoadingBookmarks={setLoadingBookmarks}
                      />
                    </div>
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

          <div className="md:hidden border-t border-gray-200">
            <CourseSidebar
              sections={course.modules || []}
              currentLectureId={lectureId}
              onSelectLecture={handleSelectLecture}
            />
          </div>
        </main>
         
         {/* Course Sidebar */}
        <aside className="hidden md:block w-[220px] md:w-[260px] xl:w-[350px] shrink-0 border-l border-gray-200 h-full">
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