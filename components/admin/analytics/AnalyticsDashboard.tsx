"use client";

import React, { useEffect, useState } from 'react';
import { KPICard } from './KPICard';
import { EnrollmentChart } from './EnrollmentChart';
import { LectureAnalyticsTable, LectureAnalytics } from './LectureAnalyticsTable';
import { Users, Clock, Trophy, BookOpen, AlertCircle } from 'lucide-react';
import Loader from "@/utils/Loader";

interface AnalyticsDashboardProps {
  courseId: string;
}

export function AnalyticsDashboard({ courseId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<{
    overview: any;
    enrollmentHistory: any[];
    lecturePerformance: LectureAnalytics[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/courses/${courseId}/analytics`);
        if (!res.ok) {
          throw new Error("Failed to load analytics data.");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
        <AlertCircle className="w-8 h-8" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Students"
          value={data.overview.totalEnrollments}
          icon={Users}
          description="Active enrollments"
        />
        <KPICard 
          title="Course Completion"
          value={`${data.overview.courseCompletionRate.toFixed(1)}%`}
          icon={Trophy}
          description="Students finished all modules"
        />
        <KPICard 
          title="Total Watch Time"
          value={`${(data.overview.totalWatchTimeMinutes / 60).toFixed(1)} hrs`}
          icon={Clock}
          description="Across all video lectures"
        />
        <KPICard 
          title="Avg. Quiz Score"
          value={`${data.overview.avgQuizScore.toFixed(1)}%`}
          icon={BookOpen}
          description="Average passing score"
        />
      </div>

      {/* Charts and Tables Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <EnrollmentChart data={data.enrollmentHistory} />
        <LectureAnalyticsTable data={data.lecturePerformance} />
      </div>
    </div>
  );
}
