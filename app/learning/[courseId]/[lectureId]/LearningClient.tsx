"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, VideoOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Components
import VideoPlayer from "../../components/VideoPlayer";
import CourseSidebar from "../../components/CourseSidebar";
import TabbedContent from "../../components/TabbedContent";
import QuizComponent from "@/components/Quiz/QuizComponent";
import AssignmentComponent from "@/components/AssignmentComponent";
import ArticleComponent from "../../components/ArticleComponent";
import LiveSessionComponent from "../../components/LiveSessionComponent";
import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface LearningClientProps {
  course: any;
  lectureId: string;
  user: any;
}

interface Bookmark {
  id: string;
  time: number;
  label: string;
  type: "BOOKMARK" | "IMPORTANT" | "QUESTION";
}

export default function LearningClient({
  course,
  lectureId,
  user,
}: LearningClientProps) {
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const oneCourse = process.env.NEXT_PUBLIC_ONE_COURSE === "true";

  const handleSeekComplete = () => setSeekTo(null);

  const handleAddBookmark = (newBookmark: Bookmark) => {
    setBookmarks((prev) => [newBookmark, ...prev]);
  };

  /* ---------------------- UPDATE PROGRESS ---------------------- */
  useEffect(() => {
    const updateProgress = async () => {
      try {
        await fetch("/api/lecture/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lectureId,
            courseId: course.id,
          }),
        });
      } catch (error) {
        console.error("Failed to update progress:", error);
      }
    };

    if (lectureId) updateProgress();
  }, [lectureId, course.id]);

  /* ---------------------- FETCH DATA ---------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [lecRes, bookmarkRes] = await Promise.all([
          fetch(`/api/lecture/${lectureId}`),
          fetch(`/api/lecture/bookmark?lectureId=${lectureId}`),
        ]);

        if (lecRes.ok) {
          const lectureData = await lecRes.json();
          setCurrentLecture(lectureData);
        }

        if (bookmarkRes.ok) {
          const bookmarkData = await bookmarkRes.json();
          setBookmarks(bookmarkData);
        }
      } catch (error) {
        console.error("Error loading lecture:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lectureId) fetchData();
  }, [lectureId]);

  /* ---------------------- QUIZ METADATA ---------------------- */
  const getQuizData = () => {
    if (currentLecture?.type !== "QUIZ" || !currentLecture?.description)
      return null;

    try {
      return JSON.parse(currentLecture.description);
    } catch (e) {
      console.error("Failed to parse quiz metadata", e);
      return null;
    }
  };

  const quizData = getQuizData();

  /* ---------------------- NAVIGATION ---------------------- */
  const handleSelectLecture = (selectedLecture: any) => {
    const currentTab = searchParams.get("tab") || "overview";
    router.push(
      `/learning/${course.id}/${selectedLecture.id}?tab=${currentTab}`
    );
  };

  /* ========================================================== */
  /* ======================== UI ============================== */
  /* ========================================================== */

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <div className="flex flex-col h-screen overflow-hidden">

        {/* ================= NAVBAR ================= */}
        <nav className="h-16 bg-card/80 backdrop-blur-md border-b border-border-muted flex items-center justify-between px-6 shadow-sm z-30 shrink-0 transition-all duration-500">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={oneCourse ? "/dashboard" : "/dashboard/my-courses"}
              className="flex items-center gap-2 text-foreground/60 hover:text-brand-blue transition-all group"
            >
              <div className="p-1.5 rounded-xl bg-background border border-border-muted group-hover:border-brand-blue/50 group-hover:shadow-lg transition-all">
                <ChevronLeft size={18} strokeWidth={3} />
              </div>
              <span className="text-xs font-black tracking-widest hidden sm:inline">
                Back
              </span>
            </Link>

            <div className="h-6 w-[1px] bg-border-muted mx-2 hidden sm:block"></div>

            <div className="font-black text-sm md:text-base truncate tracking-tighter">
              {course.title}
            </div>
          </div>

          <ThemeToggle />
        </nav>

        {/* ================= MAIN BODY ================= */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

          {/* ================= MAIN CONTENT ================= */}
          <main className="flex-1 overflow-y-auto bg-background relative h-full scroll-smooth no-scrollbar transition-colors duration-500">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
              </div>
            ) : currentLecture ? (
              <div className="flex flex-col min-h-full">

                {/* ================= STAGE ================= */}
                <div
                  className={`w-full flex justify-center items-center min-h-[45vh] md:min-h-[55vh] lg:min-h-[65vh] transition-all duration-700 ${
                    ["VIDEO", "LIVE"].includes(currentLecture.type)
                      ? "bg-black shadow-[inset_0_-20px_50px_rgba(0,0,0,0.5)]"
                      : "bg-background"
                  }`}
                >
                  <div className="w-full h-full max-w-[1600px] mx-auto">

                    {currentLecture.type === "VIDEO" && (
                      <div id="video-stage" className="aspect-video w-full h-full shadow-2xl">
                        <VideoPlayer
                          videoUrl={currentLecture.videoUrl}
                          lectureId={currentLecture.id}
                          seekTo={seekTo}
                          onSeekComplete={handleSeekComplete}
                          onBookmarkAdded={handleAddBookmark}
                        />
                      </div>
                    )}

                    {currentLecture.type === "LIVE" &&
                      currentLecture.description && (
                        <LiveSessionComponent
                          data={currentLecture.description}
                          lectureTitle={currentLecture.title}
                        />
                      )}

                    {currentLecture.type === "QUIZ" && quizData && (
                      <div className="bg-card p-6 transition-colors">
                        <QuizComponent
                          lecture={currentLecture}
                          courseId={course.id}
                        />
                      </div>
                    )}

                    {currentLecture.type === "ASSIGNMENT" && (
                      <div className="bg-card p-6 transition-colors">
                        <AssignmentComponent lecture={currentLecture} />
                      </div>
                    )}

                    {currentLecture.type === "TEXT" && (
                      <div className="max-w-4xl mx-auto p-8 md:p-16">
                        <ArticleComponent lecture={currentLecture} />
                      </div>
                    )}
                  </div>
                </div>

                {/* ================= INFO + TABS ================= */}
                <div className="flex-1 bg-card border-t border-border-muted transition-colors duration-500 pb-20">
                  <div className="max-w-6xl mx-auto p-6 md:p-10">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">
                      {currentLecture.title}
                    </h1>

                    <TabbedContent
                      lecture={currentLecture}
                      courseId={course.id}
                      adminId={course.adminId}
                      onBookmarkClick={(time) => setSeekTo(time)}
                      bookmarks={bookmarks}
                      loadingBookmarks={loadingBookmarks}
                      setBookmarks={setBookmarks}
                      setLoadingBookmarks={setLoadingBookmarks}
                      course={course}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10">
                <VideoOff size={64} className="text-foreground/20 mb-4" />
                <h2 className="text-2xl font-black tracking-tight">
                  Lecture not found
                </h2>
              </div>
            )}

            <Footer />
          </main>

          {/* ================= SIDEBAR ================= */}
          <aside className="hidden lg:block w-[350px] xl:w-[420px] shrink-0 border-l border-border-muted h-full bg-card transition-all duration-500 overflow-hidden">
            <CourseSidebar
              sections={course.modules || []}
              currentLectureId={lectureId}
              onSelectLecture={handleSelectLecture}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
