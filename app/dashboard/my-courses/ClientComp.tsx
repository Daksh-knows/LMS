"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Award, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateCertificate } from "@/lib/certificate-generator";
import Loader from "@/utils/Loader";


export interface EnrolledCourse {
  id: string;
  title: string;
  subtitle: string; 
  image: string;
  modulesCompleted: number; 
  totalModules: number; 
  progress: number; 
  courseCompleted: boolean;
  status: "Not Started" | "In Progress" | "Completed";
}

export default function CourseFilterList() {
  const [filter, setFilter] = useState("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [initialCourses, setInitialCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const tabs = ["All", "Completed", "In Progress"];
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/courses");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setInitialCourses(data);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);
  
  const filteredCourses = initialCourses.filter((course) => {
    if (filter === "All") return true;
    return course.status === filter;
  });

  const handleCourseSelect = async (courseId: string) => {
      try {
        setLoadingId(courseId);
        const baseUrl = window.location.origin;
        // 1. Fetch the last viewed lecture for this specific user and course
        const lastViewedRes = await fetch(`${baseUrl}/api/course/${courseId}/last-viewed`);
        const lastViewedData = await lastViewedRes.json();

        // 2. If a last viewed lecture exists, redirect there immediately
        if (lastViewedData && lastViewedData.lastLectureId) {
          router.push(`/learning/${courseId}/${lastViewedData.lastLectureId}`);
          return; // Exit early
        }
        // 3. FALLBACK: If no progress exists, fetch course structure to find the first lecture
        const courseResponse = await fetch(`${baseUrl}/api/course/${courseId}?userId=${userId}`, {
          cache: 'no-store'
        });

        if (!courseResponse.ok) throw new Error("Failed to fetch course data");
        const courseData = await courseResponse.json();
        // Get the first lecture of the first module
        const firstLectureId = courseData.modules?.[0]?.lectures?.[0]?.id;

        if (firstLectureId) {
          router.push(`/learning/${courseId}/${firstLectureId}`);
        } else {
          alert("This course has no lectures available yet.");
        }
      } catch (error) {
        console.error("Redirection error:", error);
        alert("An error occurred while trying to start the course.");
      } finally {
        setLoadingId(null);
      }
    };

  const handleDownloadCertificate = (courseTitle: string) => {
    generateCertificate({
      userName: session?.user?.name || "Valued Student",
      courseTitle: courseTitle
    });
  };
  
  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <Loader message="Fetching your enrolled courses..." size="lg" center={true} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters: Adaptive Pill Navigation */}
      <div className="flex p-1 bg-card-muted backdrop-blur-md rounded-full w-fit border border-border-muted gap-1 transition-colors duration-500">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`relative px-5 md:px-8 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap focus-visible:outline-none ${
              filter === tab ? "text-background" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {filter === tab && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-foreground rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Course List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredCourses.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-foreground/40 text-center py-20 font-medium"
            >
              No courses found in this category.
            </motion.p>
          ) : (
            filteredCourses.map((course) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className="bg-card-muted backdrop-blur-xl rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 md:gap-6 shadow-xl border border-border-muted items-start md:items-center hover:border-brand-blue/30 transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-48 h-40 md:h-28 rounded-2xl overflow-hidden shrink-0 bg-foreground/5 relative">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/20 font-black">
                      NO IMAGE
                    </div>
                  )}
                  {loadingId === course.id && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="animate-spin text-brand-blue" size={24} />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 w-full">
                  <h3 className="font-black text-foreground text-base md:text-xl mb-1 leading-tight group-hover:text-brand-blue transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-foreground/50 text-sm mb-3 line-clamp-1 font-medium">{course.subtitle}</p>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full max-w-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <p className="text-foreground/40 text-[10px] uppercase tracking-widest font-bold">
                        {course.modulesCompleted} / {course.totalModules} Lectures
                      </p>
                      <span className="text-foreground/60 text-[10px] font-bold">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-brand-blue'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-border-muted/50">
                  <div className="flex flex-row md:flex-col lg:flex-row gap-2 w-full sm:w-auto">
                    {course.courseCompleted && course.progress === 100 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleDownloadCertificate(course.title);
                        }}
                        className="px-4 py-2.5 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-all text-xs shadow-lg shadow-green-500/20 flex items-center gap-2 z-10 active:scale-95"
                      >
                        <Award size={14} /> Certificate
                      </button>
                    )}

                    <div
                      className={`px-5 py-2.5 rounded-xl font-black transition-all whitespace-nowrap text-xs flex items-center gap-2 ${
                        course.status === "Completed"
                          ? "bg-foreground/5 text-foreground/60"
                          : "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                      }`}
                    >
                      {course.status === "Not Started" && <><PlayCircle size={14} /> Start</>}
                      {course.status === "In Progress" && "Continue"}
                      {course.status === "Completed" && "Revisit"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}