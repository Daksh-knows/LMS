import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, startOfDay, endOfDay , format, startOfWeek } from "date-fns";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const { type, duration } = await req.json();
    
    // 1. Normalize the date to MIDNIGHT UTC
    // This makes the 'createdAt' part of the unique key predictable
    const now = new Date();
    const todayAtMidnight = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      0, 0, 0, 0
    ));

    // 2. Use UPSERT with the unique constraint
    // This is atomic and prevents race conditions
    const activity = await db.userActivity.upsert({
      where: {
        userId_type_createdAt: {
          userId,
          type,
          createdAt: todayAtMidnight,
        },
      },
      update: {
        duration: {
          increment: Math.round(duration) || 0,
        },
      },
      create: {
        userId,
        type,
        duration: Math.round(duration) || 0,
        createdAt: todayAtMidnight,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[USER_ACTIVITY_UPSERT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    // 1. Get Month/Year for the Heatmap range
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // 2. Define target ranges
    const targetDate = new Date(year, month);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // Calculate the start of the current week (Sunday)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
    const weekEnd = endOfDay(now); // Current moment

    // 3. Fetch all activities for the month (to populate the heatmap)
    const monthActivities = await db.userActivity.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 4. Filter activities specifically for the WEEKLY progress
    const weeklyActivities = monthActivities.filter(a => {
      const activityDate = new Date(a.createdAt);
      return activityDate >= weekStart && activityDate <= weekEnd;
    });

    // 5. Build the stats using the weekly filtered data
    const stats = {
      // These now represent the sum of the current week
      videoWatchedMins: weeklyActivities
        .filter((a) => a.type === "VIDEO_WATCH")
        .reduce((sum, a) => sum + (a.duration || 0), 0),
      
      quizzesCompleted: weeklyActivities
        .filter((a) => a.type === "QUIZ_ATTEMPT")
        .length,

      assignmentsSubmitted: weeklyActivities
        .filter((a) => a.type === "ASSIGNMENT_SUBMISSION")
        .length,
      
      // Heatmap Data remains monthly so the calendar looks full
      activeDays: [...new Set(monthActivities.map(a => 
        format(a.createdAt, 'yyyy-MM-dd')
      ))],
      
      lastActive: monthActivities.length > 0 
        ? monthActivities[monthActivities.length - 1].createdAt 
        : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[USER_ACTIVITY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}