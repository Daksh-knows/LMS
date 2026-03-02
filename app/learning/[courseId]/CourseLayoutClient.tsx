"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CourseSidebar from "../components/CourseSidebar";
import ThemeSwitcher from "@/components/Theme/ThemeSwitcher";
import NotificationButton from "@/components/notification/NotificationButton";
import { useCourse } from "@/context/CourseContext";

export default function CourseLayoutClient({ 
  children, 
  courseId, 
  user 
}: { 
  children: React.ReactNode; 
  courseId: string; 
  user: any; 
}) {
  const { setCourse } = useCourse();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Dynamically grab lectureId from URL so the sidebar knows what's active
  const lectureId = params.lectureId as string;

  // Fetch course data ONCE for the entire layout
  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/course/${courseId}?userId=${user?.id}`, {
          cache: 'no-store', 
        });
        if (response.ok) {
          const newCourse = await response.json();
          setCourse(newCourse);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    }
    fetchCourse();
  }, [courseId, user?.id, setCourse]);

  const handleSelectLecture = (selectedLecture: any) => {
    const currentTab = searchParams.get("tab") || "overview";
    router.push(`/learning/${courseId}/${selectedLecture.id}?tab=${currentTab}`);
  };

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
          <div className="flex gap-4">
            <NotificationButton />
            <ThemeSwitcher />
          </div>
        </nav>
         
        {/* Main Content Area Split */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* This renders LearningClient.tsx */}
          {children}
          
          {/* Course Sidebar - Stays fixed to the right side on Desktop */}
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