"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Info, ExternalLink, Loader2, FileQuestion, Video, ChevronLeft, ChevronRight, CalendarDays, ArrowRight, CheckCircle2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths , isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";


export default function OverviewClient({ data }: { data: any }) {
  const [courseType, setCourseType] = useState("All");
  const [viewDate, setViewDate] = useState(new Date());
  const [courses, setCourses] = useState<any[]>([]); // State to hold DB courses
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
        console.log("Fetched dashboard stats:", data);
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
  // Fetch courses from DB on mount
  useEffect(() => {
    async function load() {
      try {
        // 1. Fetch data from the new API route
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const response = await fetch(`${baseUrl}/api/course/all`);
        
        // 2. Check if the HTTP request was successful
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch courses`);
        }

        const result = await response.json();

        // 3. Update state based on the API response structure
        if (result.success) {
          setCourses(result.data || []);
        } else {
          console.error(result.error);
        }
      } catch (error) {
        // Handle network errors or parsing issues
        console.error("Fetch Courses Error:", error);
      } finally {
        // 4. Always turn off the loading state
        setLoadingCourses(false);
      }
    }

    load();
  }, []);
  // console.log("Fetched courses from DB:", courses);
  const filteredRecommended = useMemo(() => {
    if (courseType === "All") return courses;
    return courses.filter(course => 
      // Ensure course.tags exists and is an array before filtering
      Array.isArray(course.tags) && course.tags.some((tag: string) => tag.includes(courseType))
    );
  }, [courseType, courses]);

  const handleQuickEnroll = async (e: React.MouseEvent, courseId: string, title: string) => {
    e.stopPropagation(); // Prevents clicking the course card from triggering other events
    console.log("Enrolling in course:", courseId);
    // Set local state to show a spinner on the specific button if needed
    setProcessingId(courseId);

    // 1. Define the enrollment process as a promise
    const enrollPromise = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const response = await fetch(`${baseUrl}/api/course/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Enrollment failed");
      }

      return result;
    };

    // 2. Trigger the Toast UI
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
    e.stopPropagation(); // Stop parent click
    setLoadingResumeId(courseId);

    try {
        const response = await fetch(`/api/course/${courseId}/resume`);
        const data = await response.json();
        
        if (data.url) {
            router.push(data.url);
        }
    } catch (error) {
        toast.error("Failed to load course");
        setLoadingResumeId(null); // Reset on error
    }
    // Note: We don't reset loadingResumeId on success because the page is navigating away
  };

  return (
    <div className="">
      <div className="max-w-6xl ml-5 mt-5 space-y-10 pb-20">
        {/* 1. Progress Section (Unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 px-3 rounded-2xl">
          
          {/* Today's Progress - Simplified Display */}
          <div className="lg:col-span-1 bg-transparent rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-gray-700 font-bold mb-4 sm:mb-6 flex items-center gap-2">
              Today's Progress 
              <div className="relative group">
                <Info size={14} className="text-gray-400 cursor-help" />
                {/* Your Tooltip Component Here */}
              </div>
            </h3>

            {/* Changed to a grid that is 1 col on mobile, 2 on tablet, and 1 on large (since it's a sidebar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5">
              
              {/* Video Card */}
              <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl border border-blue-100 flex justify-between items-center sm:items-start lg:items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Video className="text-blue-600 shrink-0" size={18} />
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-800 uppercase tracking-wider">Video</span>
                </div>
                <p className="flex items-baseline gap-1 text-2xl sm:text-3xl md:text-4xl font-black text-blue-900">
                  {Math.round(stats.videoWatchedMins /60|| 0)}
                  <span className="text-xs sm:text-sm font-normal">mins</span>
                </p>
              </div>

              {/* Quizzes Card */}
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

              {/* Assignments Card - Spans 2 cols on tablet for a balanced look */}
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

          {/* Monthly Activity Heatmap */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden"
          >
            {/* Decorative background glow inside the card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-2xl text-gray-700 shadow-sm border border-gray-100">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-black text-xl tracking-tight">Activity</h3>
                  <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {format(viewDate, "MMMM yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                <button 
                  onClick={() => setViewDate(subMonths(viewDate, 1))} 
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90 text-gray-600"
                >
                  <ChevronLeft size={18}/>
                </button>
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                <button 
                  onClick={() => setViewDate(addMonths(viewDate, 1))} 
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all active:scale-90 text-gray-600"
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 relative z-10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div 
                  key={day} 
                  className="text-[11px] text-center text-gray-400 font-black mb-3 uppercase tracking-widest"
                >
                  {day}
                </div>
              ))}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={format(viewDate, "yyyy-MM")}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="contents" // Grid child wrapper
                >
                  {/* Padding */}
                  {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square w-full" />
                  ))}

                  {/* Days */}
                  {daysInMonth.map((date, idx) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isActive = stats.activeDays?.includes(dateStr);
                    const isUserToday = isToday(date);

                    return (
                      <motion.div 
                        key={dateStr}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.01 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className={`
                          relative aspect-square w-full max-w-[48px] rounded-2xl mx-auto 
                          flex items-center justify-center text-[13px] font-bold cursor-default
                          transition-colors duration-300 shadow-sm
                          ${isActive 
                            ? "bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-500/10" 
                            : "bg-white/50 text-gray-500 border border-gray-100/50 hover:border-blue-200"
                          }
                          ${isUserToday && !isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                        `}
                      >
                        {format(date, "d")}
                        
                        {/* Subtle indicator for current day if not active */}
                        {isUserToday && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 2. All Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">All Courses</h3>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecommended.map((course) => {
                const isProcessing = processingId === course.id;
                // Check the flag from our new API
                const isEnrolled = course.isEnrolled;
                const isResuming = loadingResumeId === course.id;
                return (
                  <div 
                    key={course.id} 
                    // 1. If enrolled, the whole card is a link. If not, it's just a card.
                    onClick={(e) => {
                        if (isEnrolled) {
                          handleResumeCourse(e, course.id);
                        }
                    }}
                    className={`bg-white/80 backdrop-blur-xl border  shadow-[0_8px_30px_rgb(0,0,0,0.04)]   group relative  rounded-3xl overflow-hidden   transition-all duration-300 hover:-translate-y-2
                      ${isEnrolled 
                        ? "border-green-200 cursor-pointer hover:shadow-green-100/50" // Green tint for enrolled
                        : "border-indigo-500 hover:shadow-xl"
                      }
                    `}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 hover:-translate-y-2" 
                      />
                      
                      {/* Tags */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {Array.isArray(course.tags) && course.tags.map((tag: string) => (
                          <span 
                            key={tag} 
                            className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* OVERLAY BUTTON (Hover) */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {isEnrolled ? (
                            <button 
                              onClick={(e) => handleResumeCourse(e, course.id)}
                              disabled={isResuming}
                              className="bg-green-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-green-600 transition-all"
                            >
                              {isResuming ? (
                                <>Loading... <Loader2 size={14} className="animate-spin"/></>
                              ) : (
                                <>Continue Learning <ArrowRight size={14} /></>
                              )}
                            </button>
                        ): (
                            // 3. ENROLL BUTTON (If Not Enrolled)
                            <button 
                              onClick={(e) => handleQuickEnroll(e, course.id, course.title)}
                              disabled={isProcessing}
                              className="bg-blue-600 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-blue-700 transition-all disabled:bg-gray-400"
                            >
                              {isProcessing ? (
                                <>Enrolling... <Loader2 size={14} className="animate-spin" /></>
                              ) : (
                                <>Enroll Now <ExternalLink size={14} /></>
                              )}
                            </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-1">{course.subtitle}</p>
                      
                      <div className="mt-6 flex items-center justify-between">
                          {isEnrolled ? (
                            // 4. TEXT LINK (If Enrolled)
                            <span className="text-green-600 font-bold text-sm flex items-center gap-2">
                                <CheckCircle2 size={16} /> Enrolled
                            </span>
                          ) : (
                            // 5. TEXT BUTTON (If Not Enrolled)
                            <button 
                                onClick={(e) => handleQuickEnroll(e, course.id, course.title)}
                                className="text-blue-600 font-bold text-sm hover:underline disabled:text-gray-400"
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Enroll Now"}
                            </button>
                          )}

                          {/* Arrow Icon */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                              isEnrolled ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
                          }`}>
                              →
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    
    </div>
  );
}