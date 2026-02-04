"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Info, ExternalLink, Loader2, FileQuestion, Video, ChevronLeft, ChevronRight, CalendarDays, ArrowRight, CheckCircle2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths , isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function OverviewClient({ data }: { data: any }) {
  // CONFIG: Toggle this via .env (e.g., NEXT_PUBLIC_ONE_COURSE=true)
  const oneCourse = process.env.NEXT_PUBLIC_ONE_COURSE === "true";

  const [courseType, setCourseType] = useState("All");
  const [viewDate, setViewDate] = useState(new Date());
  const [courses, setCourses] = useState<any[]>([]); 
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    videoWatchedMins: 0,
    quizzesCompleted: 0,
    activeDays: [] as string[] ,
    assignmentsSubmitted: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/user/activity?userId=${session.user.id}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [session?.user?.id]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(viewDate), end: endOfMonth(viewDate) });
  }, [viewDate]);

  useEffect(() => {
    async function load() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const response = await fetch(`${baseUrl}/api/course/all`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const result = await response.json();
        if (result.success) setCourses(result.data || []);
      } catch (error) {
        console.error("Fetch Courses Error:", error);
      } finally {
        setLoadingCourses(false);
      }
    }
    load();
  }, []);

  const filteredRecommended = useMemo(() => {
    if (courseType === "All") return courses;
    return courses.filter(course => 
      Array.isArray(course.tags) && course.tags.some((tag: string) => tag.includes(courseType))
    );
  }, [courseType, courses]);

  const handleQuickEnroll = async (e: React.MouseEvent, courseId: string, title: string) => {
    e.stopPropagation();
    setProcessingId(courseId);

    const enrollPromise = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const response = await fetch(`${baseUrl}/api/course/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Enrollment failed");
      return result;
    };

    toast.promise(enrollPromise(), {
      loading: `Enrolling you in ${title}...`,
      success: () => {
        setProcessingId(null);
        router.refresh(); 
        return `Successfully enrolled in ${title}! 🚀`;
      },
      error: (err) => {
        setProcessingId(null);
        return err.message;
      },
    });
  };

  const handleResumeCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setLoadingResumeId(courseId);
    try {
      const response = await fetch(`/api/course/${courseId}/resume`);
      const data = await response.json();
      if (data.url) router.push(data.url);
    } catch (error) {
      toast.error("Failed to load course");
      setLoadingResumeId(null);
    }
  };

  return (
    <div className="">
      <div className="max-w-6xl ml-5 mt-5 space-y-10 pb-20">
        
        {/* 1. Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 px-3 rounded-2xl">
          <div className="lg:col-span-1 bg-transparent rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-gray-700 font-bold mb-4 sm:mb-6 flex items-center gap-2">
              Today's Progress <Info size={14} className="text-gray-400 cursor-help" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5">
              <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100 flex justify-between items-center sm:items-start lg:items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Video className="text-blue-600 shrink-0" size={18} />
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-800 uppercase tracking-wider">Video</span>
                </div>
                <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-blue-900">
                  {Math.round(stats.videoWatchedMins / 60 || 0)}
                  <span className="text-xs sm:text-sm font-normal">mins</span>
                </p>
              </div>
              <div className="bg-yellow-50 p-4 sm:p-6 rounded-2xl border border-yellow-100 flex justify-between items-center sm:items-start lg:items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FileQuestion className="text-yellow-600 shrink-0" size={18} />
                  <span className="text-[10px] sm:text-xs font-semibold text-yellow-800 uppercase tracking-wider">Quizzes</span>
                </div>
                <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-yellow-900">
                  {stats.quizzesCompleted || 0}
                  <span className="text-xs sm:text-sm font-normal">done</span>
                </p>
              </div>
              <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100 flex justify-between items-center sm:items-start lg:items-center sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="text-green-600 shrink-0" size={18} />
                  <span className="text-[10px] sm:text-xs font-semibold text-green-800 uppercase tracking-wider">Assignments</span>
                </div>
                <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-green-900">
                  {stats.assignmentsSubmitted || 0}
                  <span className="text-xs sm:text-sm font-normal">sent</span>
                </p>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-2xl text-gray-700 shadow-sm border border-gray-100"><CalendarDays size={22} /></div>
                <div>
                  <h3 className="text-gray-900 font-black text-xl tracking-tight">Activity</h3>
                  <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{format(viewDate, "MMMM yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all active:scale-90 text-gray-600"><ChevronLeft size={18}/></button>
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all active:scale-90 text-gray-600"><ChevronRight size={18}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-3 relative z-10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-[11px] text-center text-gray-400 font-black mb-3 uppercase tracking-widest">{day}</div>
              ))}
              <AnimatePresence mode="wait">
                <motion.div key={format(viewDate, "yyyy-MM")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="contents">
                  {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => <div key={`pad-${i}`} className="aspect-square w-full" />)}
                  {daysInMonth.map((date, idx) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isActive = stats.activeDays?.includes(dateStr);
                    const isUserToday = isToday(date);
                    return (
                      <motion.div 
                        key={dateStr} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.01 }}
                        className={`relative aspect-square w-full max-w-[48px] rounded-2xl mx-auto flex items-center justify-center text-[13px] font-bold cursor-default transition-all shadow-sm
                          ${isActive ? "bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-500/10" : "bg-white/50 text-gray-500 border border-gray-100/50"}
                          ${isUserToday && !isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                      >
                        {format(date, "d")}
                        {isUserToday && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 2. Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-3">
            <h3 className="text-sm md:text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">
              {oneCourse ? "Featured Course" : "All Courses"}
            </h3>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <>
              {oneCourse && filteredRecommended.length > 0 ? (
                /* --- BIG CARD FORMAT --- */
                <div className="px-3">
                  {(() => {
                    const course = filteredRecommended[0];
                    const isProcessing = processingId === course.id;
                    const isEnrolled = course.isEnrolled;
                    const isResuming = loadingResumeId === course.id;

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={(e) => isEnrolled && handleResumeCourse(e, course.id)}
                        className={`relative group overflow-hidden rounded-[2.5rem] border bg-white/50 backdrop-blur-xl flex flex-col md:flex-row transition-all duration-500 shadow-2xl shadow-gray-200/50 hover:shadow-indigo-100/50 ${
                          isEnrolled ? "border-green-200 cursor-pointer" : "border-indigo-100"
                        }`}
                      >
                        <div className="md:w-[45%] h-64 md:h-[400px] relative overflow-hidden">
                          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                            {Array.isArray(course.tags) && course.tags.map((tag: string) => (
                              <span key={tag} className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                          <span className="text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Recommended for you</span>
                          <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">{course.title}</h2>
                          <p className="text-gray-500 text-lg mt-4 font-medium leading-relaxed line-clamp-2">{course.subtitle}</p>
                          
                          <div className="mt-8 flex flex-wrap items-center gap-4">
                            {isEnrolled ? (
                              <button 
                                onClick={(e) => handleResumeCourse(e, course.id)}
                                disabled={isResuming}
                                className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
                              >
                                {isResuming ? <Loader2 className="animate-spin" size={18}/> : <>Continue Learning <ArrowRight size={18} /></>}
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => handleQuickEnroll(e, course.id, course.title)}
                                disabled={isProcessing}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                              >
                                {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <>Enroll Now <ExternalLink size={18} /></>}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>
              ) : (
                /* --- GRID FORMAT --- */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-3">
                  {filteredRecommended.map((course) => {
                    const isProcessing = processingId === course.id;
                    const isEnrolled = course.isEnrolled;
                    const isResuming = loadingResumeId === course.id;
                    return (
                      <div 
                        key={course.id} 
                        onClick={(e) => isEnrolled && handleResumeCourse(e, course.id)}
                        className={`bg-white/80 backdrop-blur-xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                          isEnrolled ? "border-green-200 cursor-pointer" : "border-indigo-500 hover:shadow-xl"
                        }`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {Array.isArray(course.tags) && course.tags.map((tag: string) => (
                              <span key={tag} className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm">{tag}</span>
                            ))}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {isEnrolled ? (
                              <button onClick={(e) => handleResumeCourse(e, course.id)} className="bg-green-500 text-white px-4 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-green-600">
                                {isResuming ? <Loader2 size={14} className="animate-spin"/> : <>Continue Learning <ArrowRight size={14} /></>}
                              </button>
                            ) : (
                              <button onClick={(e) => handleQuickEnroll(e, course.id, course.title)} className="bg-blue-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-blue-700">
                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <>Enroll Now <ExternalLink size={14} /></>}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h4>
                          <p className="text-gray-400 text-sm mt-2 line-clamp-1">{course.subtitle}</p>
                          <div className="mt-6 flex items-center justify-between">
                            {isEnrolled ? (
                              <span className="text-green-600 font-bold text-sm flex items-center gap-2"><CheckCircle2 size={16} /> Enrolled</span>
                            ) : (
                              <button onClick={(e) => handleQuickEnroll(e, course.id, course.title)} className="text-blue-600 font-bold text-sm hover:underline">{isProcessing ? "Processing..." : "Enroll Now"}</button>
                            )}
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isEnrolled ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"}`}>→</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}