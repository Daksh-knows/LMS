"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, VideoOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function LearningClient({ course, lectureId, user }: LearningClientProps) {
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const searchParams = useSearchParams();
  const handleSeekComplete = () => setSeekTo(null);
  const router = useRouter();

  const handleAddBookmark = (newBookmark: Bookmark) => {
    setBookmarks((prev) => [newBookmark, ...prev]);
  };

  const oneCourse = process.env.NEXT_PUBLIC_ONE_COURSE === "true";

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

    if (lectureId) updateProgress();
  }, [lectureId, course.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [lecRes, bmarkRes] = await Promise.all([
          fetch(`/api/lecture/${lectureId}`),
          fetch(`/api/lecture/bookmark?lectureId=${lectureId}`)
        ]);
        
        if (lecRes.ok) setCurrentLecture(await lecRes.json());
        if (bmarkRes.ok) setBookmarks(await bmarkRes.json());
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lectureId) fetchData();
  }, [lectureId]);

  const handleSelectLecture = (selectedLecture: any) => {
    const currentTab = searchParams.get("tab") || "overview";
    router.push(`/learning/${course.id}/${selectedLecture.id}?tab=${currentTab}`);
  };

  const quizData = currentLecture?.type === "QUIZ" && currentLecture?.description 
    ? JSON.parse(currentLecture.description) : null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-500">
      <div className="flex flex-col h-screen overflow-hidden">
        
        {/* Navbar - Using --color-card and --color-border-muted */}
        <nav className="h-14 bg-card border-b border-border-muted flex items-center justify-between px-4 shadow-sm z-10 shrink-0 transition-all duration-500">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={oneCourse ? "/dashboard" : "/dashboard/my-courses"}
              className="flex items-center gap-1 text-foreground/60 hover:text-foreground transition-colors group shrink-0"
            >
              <div className="p-1 rounded-full bg-background border border-border-muted group-hover:scale-110 transition-transform">
                <ChevronLeft size={20} />
              </div>
              <span className="text-sm font-black  tracking-tighter hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-[1px] bg-border-muted mx-2 hidden sm:block shrink-0"></div>
            <div className="font-black text-sm md:text-base truncate  tracking-tight text-foreground">
              {course.title}
            </div>
          </div>
          <ThemeToggle />
        </nav>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-background relative h-full scroll-smooth no-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
              </div>
            ) : currentLecture ? (
              <>
                {/* Stage Area: Cinematic black for videos, theme-aware for other content */}
                <div className={`w-full flex justify-center items-center min-h-[45vh] md:min-h-[60vh] overflow-hidden shadow-2xl transition-all duration-500 ${
                  ['VIDEO', 'LIVE'].includes(currentLecture.type) ? 'bg-black' : 'bg-background'
                }`}>
                  <div className="w-full flex justify-center items-center h-full mx-auto">
                    {currentLecture.type === 'VIDEO' && (
                      <div className="aspect-video w-full h-full max-h-[85vh]">
                        <VideoPlayer
                          videoUrl={currentLecture.videoUrl}
                          lectureId={currentLecture.id}
                          seekTo={seekTo}
                          onSeekComplete={handleSeekComplete}
                          onBookmarkAdded={handleAddBookmark}
                        />
                      </div>
                    )}
                    {currentLecture.type === 'QUIZ' && (
                      <div className="h-full w-full bg-card p-4 md:p-8 overflow-y-auto">
                        <QuizComponent lecture={currentLecture} courseId={course.id} />
                      </div>
                    )}
                    {currentLecture.type === 'ASSIGNMENT' && (
                      <div className="h-full w-full bg-card overflow-y-auto no-scrollbar">
                        <AssignmentComponent lecture={currentLecture} />
                      </div>
                    )}
                    {currentLecture.type === 'TEXT' && (
                      <div className="h-full w-full max-w-4xl mx-auto p-6 md:p-12">
                        <ArticleComponent lecture={currentLecture} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Lecture Info and Tabs */}
                <div className="w-full p-6 bg-card border-t border-border-muted transition-all duration-500">
                  <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                      <h1 className="text-2xl md:text-3xl font-black text-foreground  tracking-tighter">
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
                      course={course}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-background">
                <div className="bg-card p-8 rounded-[2rem] border border-border-muted mb-4">
                  <VideoOff size={48} className="text-foreground/20" />
                </div>
                <h2 className="text-xl font-black text-foreground uppercase tracking-widest">No Content Found</h2>
              </div>
            )}
            <Footer />
          </main>

          {/* Course Sidebar */}
          <aside className="hidden md:block w-[300px] xl:w-[380px] shrink-0 border-l border-border-muted h-full bg-card transition-all duration-500 overflow-y-auto no-scrollbar">
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