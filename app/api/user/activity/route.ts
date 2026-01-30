import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export async function POST(req: Request) {
  try {
    // 1. Extract userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // 2. Parse the body for activity details
    const { type, duration } = await req.json();

    // 3. Create the activity record
    const activity = await db.userActivity.create({
      data: {
        userId,
        type,
        duration: duration || 0,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[USER_ACTIVITY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    // Get month and year from params, default to current date if missing
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // 1. Define date boundaries for the requested month
    const targetDate = new Date(year, month);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // 2. Define date boundaries for "Today" (for the circles)
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Fetch all activities within that month
    const monthActivities = await db.userActivity.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // 3. Calculate "Today's" stats from the fetched results
    // This is more efficient than a second DB query
    const todayActivities = monthActivities.filter(a => 
      a.createdAt >= todayStart && a.createdAt <= todayEnd
    );

    const stats = {
      // Circle Stats (Today only)
      videoWatchedMins: todayActivities
        .filter((a) => a.type === "VIDEO_WATCH")
        .reduce((sum, a) => sum + (a.duration || 0), 0),
      quizzesCompleted: todayActivities
        .filter((a) => a.type === "QUIZ_ATTEMPT")
        .length,
      
      // Heatmap Data (Full Month)
      // Returns an array of unique date strings like ["2026-01-01", "2026-01-05"]
      activeDays: [...new Set(monthActivities.map(a => 
        a.createdAt.toISOString().split('T')[0]
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