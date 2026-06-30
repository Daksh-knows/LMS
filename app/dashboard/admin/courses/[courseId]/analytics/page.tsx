import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { ArrowLeft } from 'lucide-react';
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

      {/* Client-side Dashboard Component */}
      <AnalyticsDashboard courseId={courseId} />
    </div>
  );
}
