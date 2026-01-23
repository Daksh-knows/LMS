import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic ensures we get the latest courses, not a cached build-time version
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courses = await db.course.findMany({
      orderBy: {
        title: 'asc'
      },
      // Optional: If you want to include category names or student counts
      include: {
        category: true,
        _count: {
          select: { students: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: courses 
    });

  } catch (error) {
    console.error("[GET_ALL_COURSES_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load courses from database." },
      { status: 500 }
    );
  }
}