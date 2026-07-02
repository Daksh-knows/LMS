"use client";

import React, { useState, useEffect, useCallback } from "react";
import { VideoOff, Lock, CalendarClock, ListChecks, Sparkles, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "@/utils/Toast";

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
  const [lockInfo, setLockInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [seekTo, setSeekTo] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { course: contextCourse } = useCourse();

  const handleSeekComplete = () => setSeekTo(null);

  const loadLecture = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/lecture/${lectureId}`);
      const data = await response.json();
      if (response.status === 403 && data?.locked) {
        setLockInfo(data);
        setCurrentLecture(null);
      } else if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch lecture");
      } else {
        setLockInfo(null);
        setCurrentLecture(data);
      }
    } catch (error) {
      console.error("Error loading lecture:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lectureId]);

  const handleUnlock = async () => {
    try {
      setUnlocking(true);
      const res = await fetch(`/api/lecture/${lectureId}/bypass`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to unlock");
      showToast.success(`Unlocked! ${data.creditsRemaining} credit(s) left.`);
      await loadLecture();
    } catch (err: any) {
      showToast.error(err.message || "Could not unlock this lecture");
    } finally {
      setUnlocking(false);
    }
  };

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
    loadLecture();
  }, [lectureId, loadLecture]);

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
      ) : lockInfo ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-10 max-w-lg mx-auto">
          <div className="bg-amber-50 p-6 rounded-full mb-5">
            {lockInfo.lockedByTime ? (
              <CalendarClock size={48} className="text-amber-500" />
            ) : (
              <Lock size={48} className="text-amber-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-(--text-color)">
            {lockInfo.title || "Locked content"}
          </h2>

          {lockInfo.lockedByTime ? (
            <p className="text-gray-500 mt-3">
              This content unlocks on{" "}
              <span className="font-bold text-(--text-color)">
                {lockInfo.releaseAt
                  ? new Date(lockInfo.releaseAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "a scheduled date"}
              </span>
              . Please check back later.
            </p>
          ) : (
            <>
              <p className="text-gray-500 mt-3 flex items-center justify-center gap-2">
                <ListChecks size={16} /> Complete these lectures first:
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-(--text-color)">
                {(lockInfo.unmetPrerequisites || []).map((p: any) => (
                  <li key={p.id} className="bg-(--lec-unwatched-bg) border border-(--lec-unwatched-border) rounded-lg px-4 py-2">
                    {p.title}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  onClick={handleUnlock}
                  disabled={unlocking || (lockInfo.creditsRemaining ?? 0) < 1}
                  className="flex items-center gap-2 bg-[#FABD23] text-black font-bold px-6 py-3 rounded-xl hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unlocking ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Spend 1 credit to unlock
                </button>
                <span className="text-xs text-gray-400">
                  {lockInfo.creditsRemaining ?? 0} skip credit(s) remaining
                </span>
              </div>
            </>
          )}
        </div>
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