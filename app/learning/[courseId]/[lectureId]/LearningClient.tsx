"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, VideoOff, Loader2 } from "lucide-react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";

// Components
import VideoPlayer from "../../components/VideoPlayer";
import CourseSidebar from "../../components/CourseSidebar";
import TabbedContent from "../../components/TabbedContent";
import QuizComponent from "@/components/QuizComponent";
import AssignmentComponent from "@/components/AssignmentComponent";
import ArticleComponent from "../../components/ArticleComponent";
import LiveSessionComponent from "../../components/LiveSessionComponent";
import Footer from "@/components/Footer";
import { useBookmarks } from "@/context/BookmarkContext";
import { useCourse } from "@/context/CourseContext";
import { LectureProvider, useLecture } from "@/context/LectureContext";
import Loader from "@/utils/Loader";
import ThemeSwitcher from "@/components/Theme/ThemeSwitcher";

interface LearningClientProps {
  user: any ;
  courseId: string
  lectureId: string
}

interface Bookmark {
  id: string;
  time: number;
  label: string;
  type: "BOOKMARK" | "IMPORTANT" | "QUESTION";
}

export default function LearningClient({ courseId , lectureId  , user }: LearningClientProps) {
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const params = useParams();
// Create a handler to clear the seek value after the player reacts
  const handleSeekComplete = () => setSeekTo(null);
  const router = useRouter();
  
  const { course: contextCourse, setCourse } = useCourse();


   useEffect(() => {
    async function fetchCourse(){
        try {
          const response = await fetch(`/api/course/${courseId}?userId=${user?.id}`, {
            cache: 'no-store', 
          });
          // console.log("Fetch response status:", response);
          if (!response.ok) {
            if (response.status === 404) return notFound();
            throw new Error("Failed to fetch course");
          }
      
          const newCourse = await response.json();
          setCourse(newCourse) ;
        } catch (error) {
          console.error("Error fetching course in Server Component:", error);
        }

    }
    fetchCourse() ;
  },[courseId]) ;

  
  const oneCourse = process.env.NEXT_PUBLIC_ONE_COURSE === "true";

  
  useEffect(() => {
    async function fetchCourse(){
        try {
          const response = await fetch(`/api/course/${courseId}?userId=${user?.id}`, {
            cache: 'no-store', 
          });
          // console.log("Fetch response status:", response);
          if (!response.ok) {
            if (response.status === 404) return notFound();
            throw new Error("Failed to fetch course");
          }
      
          const newCourse = await response.json();
          setCourse(newCourse) ;
        } catch (error) {
          console.error("Error fetching course in Server Component:", error);
        }

    }
    fetchCourse() ;
  },[courseId]) ;


  useEffect(() => {
    const updateProgress = async () => {
      try {
        await fetch("/api/lecture/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lectureId: lectureId,
            courseId: courseId
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
    if (!lectureId) return;
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

    if (lectureId) {
      fetchLecture();
    }

    // console.log("FL" , currentLecture) ; 
  }, [lectureId]);

  const handleBookmarkClick = useCallback((time: string) => {
    setSeekTo(time);
  }, []);

  const handleSelectLecture = (selectedLecture: any) => {
    const currentTab = searchParams.get("tab") || "overview";
    router.push(`/learning/${courseId}/${selectedLecture.id}?tab=${currentTab}`);
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
    <div className="">
      <div className="flex flex-col h-screen overflow-hidden bg-(--learning-background)">
        {/* Navbar */}
        <nav className="h-14 bg-(--sidebar-background) theme-transition text-white flex items-center justify-between px-4 shadow-md z-10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors group shrink-0"
            >
              <div className="p-1 rounded-full bg-gray-700 group-hover:bg-gray-800">
                <ChevronLeft size={20} />
              </div>
              <span className="text-sm text-(--text-color) theme-transition font-medium hidden sm:inline">Back to dashboard</span>
            </Link>
          </div>
          <ThemeSwitcher />
        </nav>
         
          {/* Main Content Area */}
          
          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

            <main className="flex-1 overflow-y-auto theme-transition bg-(--learning-background) relative h-full">
              {isLoading ? (
                <Loader message="Loading lecture" />
              ) : currentLecture ? (
                <LectureProvider>
                  {/* CONTAINER START: 
                    Adding 'px-4 md:px-8 lg:px-12' and 'max-w-7xl mx-auto' 
                    gives it the floating/margin look from the image.
                  */}
                  <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2 lg:py-8 space-y-6">

                    <div className="flex items-center gap-4 mb-6">

                      <div className="flex items-center bg-[#FABD23]/30 justify-center w-12 h-12 rounded-full shrink-0 shadow-lg shadow-amber-500/20">
                        <img 
                          src="/images/Graduation_Cap.svg" 
                          alt="Graduation Cap"
                          className="w-9 h-9 object-contain" // Fixed size for the icon inside
                        />
                      </div>

                      {/* Course Title */}
                      <h1 className="text-2xl font-bold text-(--text-color) theme-transition tracking-tight">
                        {contextCourse?.title || "Course Title"}
                      </h1>
                    </div>
                    
                    {/* --- THE STAGE (Video/Quiz Parent) --- */}
                    <div className="w-full flex justify-center items-center overflow-hidden rounded-2xl bg-transparent shadow-(--amber-glow)">
                      <div className="w-full min-h-[20rem]">
                        {/* --- lecture UI --- */}
                        {currentLecture.type === 'VIDEO' && (
                          <div id="video-stage" className="w-full h-full">
                            {currentLecture?.videoUrl && (
                              <VideoPlayer  
                                videoUrl={currentLecture.videoUrl} 
                                lectureId={currentLecture.id} 
                                seekTo={seekTo} 
                                onSeekComplete={handleSeekComplete}
                              />
                            )}
                          </div>
                        )}

                        {/* --- LIVE UI --- */}
                        {currentLecture.type === 'LIVE' && currentLecture.description && (
                          <div className="h-full w-full">
                            <LiveSessionComponent
                              data={currentLecture.description} 
                              lectureTitle={currentLecture.title} 
                            />
                          </div>
                        )}

                        {/* --- QUIZ UI --- */}
                        {currentLecture.type === 'QUIZ' && quizData && (
                          <div className="h-full w-full bg-white overflow-y-auto">
                            <QuizComponent courseId={courseId} />
                          </div>
                        )}

                        {/* ASSIGNMENT UI */}
                        {currentLecture.type === 'ASSIGNMENT' && (
                          <div className="h-full w-full bg-white overflow-y-auto">
                            <AssignmentComponent />
                          </div>
                        )}

                        {/* TEXT / ARTICLE UI */}
                        {currentLecture.type === 'TEXT' && (
                          <div className="h-full w-full bg-white overflow-y-auto">
                            <ArticleComponent/>
                          </div>
                        )}
                      </div>
                    </div>

                      <TabbedContent 
                        onBookmarkClick={handleBookmarkClick}
                      />
                  </div>
                </LectureProvider>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                  <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <VideoOff size={48} className="text-gray-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700">No lectures found</h2>
                  <p className="text-gray-500 max-w-xs mt-2">Content hasn't been uploaded yet.</p>
                </div>
              )}

              <div className="md:hidden border-t p-5 ">
                <CourseSidebar
                  currentLectureId={lectureId}
                  onSelectLecture={handleSelectLecture}
                />
              </div>
              <Footer />
            </main>
            
            {/* Course Sidebar - Stays fixed to the right side */}
            <aside className="hidden rounded-2xl md:block w-[300px] lg:w-[350px] xl:w-[400px] shrink-0 p-4  h-full">
              <CourseSidebar
                currentLectureId={lectureId}
                onSelectLecture={handleSelectLecture}
              />
            </aside>
          </div>
         
      </div>
    </div>
  );
}