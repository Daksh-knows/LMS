"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function getCourseAnalyticsOverview(courseId: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  // 1. Total Enrollments
  const totalEnrollments = await db.myEnrollment.count({
    where: { courseId },
  });

  // 2. Total Watch Time & Avg Quiz Score (across all users for this course)
  const userProgresses = await db.userProgress.findMany({
    where: { courseId },
    select: {
      watchTime: true,
      quizScore: true,
      isCompleted: true,
    },
  });

  const totalWatchTimeSeconds = userProgresses.reduce((acc, curr) => acc + (curr.watchTime || 0), 0);
  const totalWatchTimeMinutes = Math.round(totalWatchTimeSeconds / 60);

  const quizScores = userProgresses.filter(up => up.quizScore !== null).map(up => up.quizScore as number);
  const avgQuizScore = quizScores.length > 0 
    ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : 0;

  // 3. Course Completion Rate
  // Defined as: How many distinct users have completed all published lectures in the course?
  // Alternative simpler calculation: Total completed lecture records / Total expected lecture records for enrolled students
  
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lectures: {
            where: { isPublished: true },
          }
        }
      }
    }
  });

  let courseCompletionRate = 0;
  if (course && totalEnrollments > 0) {
    const totalPublishedLectures = course.modules.reduce((acc, mod) => acc + mod.lectures.length, 0);
    
    if (totalPublishedLectures > 0) {
      // Find how many users have completed all lectures
      const completedLecturesPerUser = await db.userProgress.groupBy({
        by: ['userId'],
        where: {
          courseId,
          isCompleted: true,
        },
        _count: {
          lectureId: true
        }
      });

      const usersWhoCompletedAll = completedLecturesPerUser.filter(
        userGrp => userGrp._count.lectureId >= totalPublishedLectures
      ).length;

      courseCompletionRate = (usersWhoCompletedAll / totalEnrollments) * 100;
    }
  }

  // 4. Assignment Engagement
  // Count how many AssignmentSubmission records exist for this course vs Total expected
  const assignmentSubmissions = await db.assignmentSubmission.count({
    where: {
      lecture: {
        module: {
          courseId
        }
      }
    }
  });

  return {
    totalEnrollments,
    totalWatchTimeMinutes,
    avgQuizScore,
    courseCompletionRate,
    assignmentSubmissions,
  };
}

export async function getCourseEnrollmentHistory(courseId: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  // Group enrollments by day over the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const enrollments = await db.myEnrollment.findMany({
    where: {
      courseId,
      enrolledAt: {
        gte: thirtyDaysAgo,
      }
    },
    select: {
      enrolledAt: true,
    },
    orderBy: {
      enrolledAt: 'asc'
    }
  });

  // Aggregate into { date: 'MMM DD', count: number }
  const dailyCounts: Record<string, number> = {};
  
  enrollments.forEach(e => {
    // Format date nicely e.g., "Oct 12"
    const dateStr = e.enrolledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dailyCounts[dateStr]) dailyCounts[dateStr] = 0;
    dailyCounts[dateStr]++;
  });

  // Convert to array and calculate cumulative
  let cumulative = 0;
  // Also get the base enrollments before 30 days ago to have accurate cumulative sum
  const priorEnrollments = await db.myEnrollment.count({
    where: {
      courseId,
      enrolledAt: {
        lt: thirtyDaysAgo,
      }
    }
  });
  
  cumulative = priorEnrollments;

  // We want to fill in missing days in the last 30 days so the chart is contiguous
  const chartData: { date: string, count: number }[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const countForDay = dailyCounts[dateStr] || 0;
    cumulative += countForDay;
    
    chartData.push({
      date: dateStr,
      count: cumulative
    });
  }

  return chartData;
}

export async function getLecturePerformance(courseId: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    throw new Error("Unauthorized");
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lectures: {
            where: { isPublished: true },
            orderBy: { position: 'asc' },
            include: {
              userProgress: true
            }
          }
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!course) return [];

  const totalEnrollments = await db.myEnrollment.count({
    where: { courseId },
  });

  const lectureStats = [];

  for (const mod of course.modules) {
    for (const lecture of mod.lectures) {
      const progresses = lecture.userProgress;
      
      const completedCount = progresses.filter(p => p.isCompleted).length;
      const totalWatchTimeSecs = progresses.reduce((acc, curr) => acc + (curr.watchTime || 0), 0);
      
      let completionRate = 0;
      if (totalEnrollments > 0) {
         completionRate = (completedCount / totalEnrollments) * 100;
      } else if (progresses.length > 0) {
         completionRate = (completedCount / progresses.length) * 100;
      }

      const avgWatchTimeMinutes = progresses.length > 0 
        ? Math.round((totalWatchTimeSecs / progresses.length) / 60)
        : 0;

      lectureStats.push({
        id: lecture.id,
        title: lecture.title,
        type: lecture.type,
        moduleTitle: mod.title,
        completionRate,
        avgWatchTimeMinutes: lecture.type === 'VIDEO' ? avgWatchTimeMinutes : undefined,
        totalViews: progresses.length,
      });
    }
  }

  return lectureStats;
}
