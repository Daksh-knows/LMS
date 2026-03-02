"use client";

import React, { useState, useEffect, useCallback } from "react";
import { VideoOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Components
import VideoPlayer from "../../components/VideoPlayer";
import CourseSidebar from "../../components/CourseSidebar";
import TabbedContent from "../../components/TabbedContent";
import QuizComponent from "@/components/QuizComponent";
import AssignmentComponent from "@/components/AssignmentComponent";
import ArticleComponent from "../../components/ArticleComponent";
import LiveSessionComponent from "../../components/LiveSessionComponent";
import Footer from "@/components/Footer";
import { useCourse } from "@/context/CourseContext";
import { LectureProvider } from "@/context/LectureContext";
import Loader from "@/utils/Loader";

interface LearningClientProps {
  user: any;
  courseId: string;
  lectureId: string;
}

export default function LearningClient({ courseId, lectureId, user }: LearningClientProps) {
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { course: contextCourse } = useCourse();

  const handleSeekComplete = () => setSeekTo(null);

  useEffect(() => {
    const updateProgress = async () => {
      try {
        await fetch("/api/lecture/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lectureId, courseId }),
        });
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    };
    if (lectureId) updateProgress();
  }, [lectureId, courseId]);
  
  useEffect(() => {
    if (!lectureId) return;
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
    fetchLecture();
  }, [lectureId]);

  const handleBookmarkClick = useCallback((time: string) => {
    setSeekTo(time);
  }, []);

  const handleSelectLecture = (selectedLecture: any) => {
    const currentTab = searchParams.get("tab") || "overview";
    router.push(`/learning/${courseId}/${selectedLecture.id}?tab=${currentTab}`);
  };

  const getQuizData = () => {
    if (currentLecture?.type !== "QUIZ" || !currentLecture?.description) return null;
    try {
      return JSON.parse(currentLecture.description);
    } catch (e) {
      return null;
    }
  };

  const quizData = getQuizData();

  return (
    <main className="flex-1 overflow-y-auto theme-transition bg-(--learning-background) relative h-full">
      {isLoading ? (
        <Loader message="Loading lecture" />
      ) : currentLecture ? (
        <LectureProvider>
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2 lg:py-8 space-y-6">

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-[#FABD23]/30 justify-center w-12 h-12 rounded-full shrink-0 shadow-lg shadow-amber-500/20">
                <img 
                  src="/images/Graduation_Cap.svg" 
                  alt="Graduation Cap"
                  className="w-9 h-9 object-contain" 
                />
              </div>
              <h1 className="text-2xl font-bold text-(--text-color) theme-transition tracking-tight">
                {contextCourse?.title || "Course Title"}
              </h1>
            </div>
            
            <div className="w-full flex justify-center items-center overflow-hidden rounded-2xl bg-transparent shadow-(--amber-glow)">
              <div className="w-full min-h-[20rem]">
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
                {currentLecture.type === 'LIVE' && currentLecture.description && (
                  <div className="h-full w-full">
                    <LiveSessionComponent
                      data={currentLecture.description} 
                      lectureTitle={currentLecture.title} 
                    />
                  </div>
                )}
                {currentLecture.type === 'QUIZ' && quizData && (
                  <div className="h-full w-full bg-white overflow-y-auto">
                    <QuizComponent courseId={courseId} />
                  </div>
                )}
                {currentLecture.type === 'ASSIGNMENT' && (
                  <div className="h-full w-full bg-white overflow-y-auto">
                    <AssignmentComponent />
                  </div>
                )}
                {currentLecture.type === 'TEXT' && (
                  <div className="h-full w-full bg-white overflow-y-auto">
                    <ArticleComponent/>
                  </div>
                )}
              </div>
            </div>

            <TabbedContent onBookmarkClick={handleBookmarkClick} />
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

      {/* Mobile Sidebar - Only shows on small screens, scrolls with content */}
      <div className="md:hidden border-t p-5 ">
        <CourseSidebar
          currentLectureId={lectureId}
          onSelectLecture={handleSelectLecture}
        />
      </div>
      <Footer />
    </main>
  );
}