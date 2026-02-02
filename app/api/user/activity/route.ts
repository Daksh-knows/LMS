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
    
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const targetDate = new Date(year, month);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const monthActivities = await db.userActivity.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const todayActivities = monthActivities.filter(a => 
      a.createdAt >= todayStart && a.createdAt <= todayEnd
    );

    const stats = {
      // Today's Stats
      videoWatchedMins: todayActivities
        .filter((a) => a.type === "VIDEO_WATCH")
        .reduce((sum, a) => sum + (a.duration || 0), 0),
      
      quizzesCompleted: todayActivities
        .filter((a) => a.type === "QUIZ_ATTEMPT")
        .length,

      // ADDED: Assignments submitted in the last 24h (today's window)
      assignmentsSubmitted: todayActivities
        .filter((a) => a.type === "ASSIGNMENT_SUBMISSION")
        .length,
      
      // Heatmap Data (Full Month)
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