import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, startOfDay, endOfDay , format } from "date-fns";

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
    console.log("Hell" ) ;
    // 1. Handle Timezone Offset from Client
    // The client should send: /api/user/activity?userId=...&timezone=Asia/Kolkata
    const userTimezone = searchParams.get("timezone") || "UTC";

    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Target Month Range
    const targetDate = new Date(year, month);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // 2. Fix "Today" calculation
    // We use the current system time but ensure we compare dates correctly
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd'); // "2026-02-03"

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

    console.log("Months activities " , monthActivities) ;
    
    // 3. Filter "Today" using string comparison to avoid UTC hour shifts
    const todayActivities = monthActivities.filter(a => 
      format(a.createdAt, 'yyyy-MM-dd') === todayStr
    );

    const stats = {
      videoWatchedMins: todayActivities
        .filter((a) => a.type === "VIDEO_WATCH")
        .reduce((sum, a) => sum + (a.duration || 0), 0),
      
      quizzesCompleted: todayActivities
        .filter((a) => a.type === "QUIZ_ATTEMPT")
        .length,

      assignmentsSubmitted: todayActivities
        .filter((a) => a.type === "ASSIGNMENT_SUBMISSION")
        .length,
      
      // Heatmap Data (ISO strings for the frontend heatmap library)
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