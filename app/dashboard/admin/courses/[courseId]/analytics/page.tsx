import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { 
  getCourseAnalyticsOverview, 
  getCourseEnrollmentHistory, 
  getLecturePerformance 
} from '@/actions/analytics';

import { KPICard } from '@/components/admin/analytics/KPICard';
import { EnrollmentChart } from '@/components/admin/analytics/EnrollmentChart';
import { LectureAnalyticsTable } from '@/components/admin/analytics/LectureAnalyticsTable';
import { 
  Users, 
  Clock, 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

export default async function CourseAnalyticsPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    redirect("/dashboard");
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { title: true }
  });

  if (!course) {
    notFound();
  }

  // Fetch all analytics data in parallel
  const [overview, enrollmentHistory, lecturePerformance] = await Promise.all([
    getCourseAnalyticsOverview(courseId),
    getCourseEnrollmentHistory(courseId),
    getLecturePerformance(courseId)
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <Link 
          href={`/dashboard/admin/edit-course/${courseId}`}
          className="inline-flex items-center text-sm text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Course Editor
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Course Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Detailed performance metrics for <span className="font-semibold text-amber-600 dark:text-amber-500">{course.title}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Total Students"
          value={overview.totalEnrollments}
          icon={Users}
          description="Active enrollments"
          trend={{ value: 12, label: "from last month" }}
        />
        <KPICard 
          title="Course Completion"
          value={`${overview.courseCompletionRate.toFixed(1)}%`}
          icon={Trophy}
          description="Students finished all modules"
        />
        <KPICard 
          title="Total Watch Time"
          value={`${(overview.totalWatchTimeMinutes / 60).toFixed(1)} hrs`}
          icon={Clock}
          description="Across all video lectures"
        />
        <KPICard 
          title="Avg. Quiz Score"
          value={`${overview.avgQuizScore.toFixed(1)}%`}
          icon={BookOpen}
          description="Average passing score"
        />
      </div>

      {/* Charts and Tables Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Full width chart on mobile, 4 columns on large screens */}
        <EnrollmentChart data={enrollmentHistory} />
        
        {/* Full width table */}
        <LectureAnalyticsTable data={lecturePerformance} />
      </div>
    </div>
  );
}
