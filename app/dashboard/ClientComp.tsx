"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProgressSection from "@/components/dashboard/ProgressSection";
import CourseList from "@/components/dashboard/CourseList";

export default function OverviewClient({ data }: { data: any }) {
  const { data: session } = useSession();
  
  // Stats State
  const [stats, setStats] = useState({
    videoWatchedMins: 0,
    quizzesCompleted: 0,
    activeDays: [] as string[],
    assignmentsSubmitted: 0
  });
  
  // Courses State
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // 1. Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/user/activity?userId=${session.user.id}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, [session?.user?.id]);

  // 2. Fetch Courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        const response = await fetch(`${baseUrl}/api/course/all`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const result = await response.json();

        if (result.success) {
          setCourses(result.data || []);
        }
      } catch (error) {
        console.error("Fetch Courses Error:", error);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="">
      <div className="max-w-6xl ml-5 mt-5 space-y-10 pb-20">
        
        {/* Component 1: Course Grid */}
        <CourseList courses={courses} loading={loadingCourses} />
        {/* Component 1: Stats & Heatmap */}
        <ProgressSection stats={stats} />
      </div>
    </div>
  );
}