import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { format, subDays, isSameDay, isYesterday, isToday } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }


    const activities = await db.userActivity.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (activities.length === 0) {
      return NextResponse.json({ currentStreak: 0 });
    }

    const uniqueDates = activities.reduce((acc: Date[], curr) => {
      const lastDate = acc[acc.length - 1];
      if (!lastDate || !isSameDay(lastDate, curr.createdAt)) {
        acc.push(curr.createdAt);
      }
      return acc;
    }, []);

    // 3. Calculate the Streak
    let currentStreak = 0;
    const latestActivity = uniqueDates[0];

    // If the latest activity isn't today OR yesterday, the streak is already broken
    if (isToday(latestActivity) || isYesterday(latestActivity)) {
      currentStreak = 1;

      // Loop through dates to find consecutive days
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = uniqueDates[i];
        const previous = uniqueDates[i + 1];

        // Check if 'previous' is exactly one day before 'current'
        const expectedPrevious = subDays(current, 1);

        if (isSameDay(previous, expectedPrevious)) {
          currentStreak++;
        } else {
          // Gap found, streak ends here
          break;
        }
      }
    }

    return NextResponse.json({ currentStreak });
  } catch (error) {
    console.error("[USER_STREAK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}