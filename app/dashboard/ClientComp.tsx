"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Info, ExternalLink, Loader2, FileQuestion, Video, ChevronLeft, ChevronRight, CalendarDays, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from "date-fns";

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
    activeDays: [] as string[] // Array of dates like ["2024-05-20", "2024-05-21"]
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
    <div className="max-w-6xl ml-5 mt-5 space-y-10 pb-20">
      {/* 1. Progress Section (Unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 px-3 rounded-2xl">
        
        {/* Today's Progress - Simplified Display */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-gray-700 font-bold mb-6 flex items-center gap-2">
            Today's Progress <Info size={14} className="text-gray-400" />
          </h3>
          <div className="flex flex-col gap-5 justify-around">
            <div className="bg-blue-50/50 px-6 py-6 rounded-2xl border border-blue-100 flex justify-between">
              <div className="flex items-center gap-3 mb-2">
                <Video className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-blue-800 uppercase tracking-wider">Video Time</span>
              </div>
              <p className="text-4xl font-black text-blue-900 ">
                {Math.round(stats.videoWatchedMins || 0)} <span className="text-lg font-normal">mins</span>
              </p>
            </div>

            <div className="bg-green-100 p-6 rounded-2xl border border-green-100 flex justify-between">
              <div className="flex items-center gap-3 mb-2">
                <FileQuestion className="text-green-600" size={20} />
                <span className="text-sm font-medium text-green-800 uppercase tracking-wider">Quizzes</span>
              </div>
              <p className="text-4xl font-black text-green-900">
                {stats.quizzesCompleted || 0} <span className="text-lg font-normal">completed</span>
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Activity Heatmap */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-gray-800 font-bold text-lg">Activity</h3>
                  <p className="text-sm font-medium text-blue-600">{format(viewDate, "MMMM yyyy")}</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button 
                  onClick={() => setViewDate(subMonths(viewDate, 1))} 
                  className="p-2 hover:bg-white rounded-lg transition-all"
                >
                  <ChevronLeft size={20}/>
                </button>
                <button 
                  onClick={() => setViewDate(addMonths(viewDate, 1))} 
                  className="p-2 hover:bg-white rounded-lg transition-all"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>

            {/* FIXED GRID: Exactly 7 columns */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {/* 1. Weekday Headers - Ensure exactly 7 items */}
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div 
                  key={day} 
                  className="text-[10px] sm:text-xs text-center text-gray-400 font-bold mb-2 uppercase tracking-tighter"
                >
                  {day}
                </div>
              ))}
              
              {/* 2. Padding logic - This shifts the 1st of the month to the correct day */}
              {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square w-full" />
              ))}

              {/* 3. Actual Calendar Days */}
              {daysInMonth.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isActive = stats.activeDays?.includes(dateStr);
                return (
                  <div 
                    key={dateStr}
                    className={`aspect-square w-full max-w-[45px] rounded-lg mx-auto flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                      isActive 
                        ? "bg-green-500 text-white shadow-md ring-2 ring-white" 
                        : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}
                  >
                    {format(date, "d")}
                  </div>
                );
              })}
            </div>
          </div>
      </div>

      {/* 2. Recommended Courses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-lg lg:text-xl font-extrabold text-gray-900 tracking-tight">All Courses</h3>
          {/* <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {["All", "Frontend", "Advanced"].map((type) => (
              <button
                key={type}
                onClick={() => setCourseType(type)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  courseType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div> */}
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
                  className={`group relative bg-white rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 hover:-translate-y-2
                    ${isEnrolled 
                      ? "border-green-200 cursor-pointer hover:shadow-green-100/50" // Green tint for enrolled
                      : "border-gray-100 hover:shadow-xl"
                    }
                  `}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
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
  );
}