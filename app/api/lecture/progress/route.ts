import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();
    
    const { 
      lectureId, 
      courseId, 
      isCompleted, 
      watchTime, 
      quizScore, 
      assignmentStatus 
    } = body;

    // Safety check: courseId and lectureId are both needed for a new record
    if (!lectureId || !courseId) {
      return NextResponse.json({ error: "Lecture ID and Course ID required" }, { status: 400 });
    }

    // Perform Upsert
    const progress = await db.userProgress.upsert({
      where: {
        userId_lectureId: {
          userId,
          lectureId,
        },
      },
      update: {
        // We explicitly update updatedAt to mark this as the "Last Viewed"
        updatedAt: new Date(),
        ...(isCompleted !== undefined && { isCompleted }),
        ...(watchTime !== undefined && { watchTime }),
        ...(quizScore !== undefined && { quizScore }),
        ...(assignmentStatus !== undefined && { assignmentStatus }),
      },
      create: {
        userId,
        lectureId,
        courseId, // <--- Required for the new schema relation
        isCompleted: isCompleted || false,
        watchTime: watchTime || 0,
        quizScore: quizScore || null,
        assignmentStatus: assignmentStatus || "NOT_SUBMITTED",
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[LECTURE_PROGRESS]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}