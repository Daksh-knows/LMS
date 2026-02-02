import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { lectureId } = await params;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch both the progress status and the submission details
    const [progress, submission] = await Promise.all([
      db.userProgress.findUnique({
        where: {
          userId_lectureId: {
            userId: user.id,
            lectureId: lectureId,
          },
        },
        select: {
          assignmentStatus: true,
          isCompleted: true,
        },
      }),
      db.assignmentSubmission.findUnique({
        where: {
          studentId_lectureId: {
            studentId: user.id,
            lectureId: lectureId,
          },
        },
        select: {
          fileUrl: true,
          grade: true,
          status: true,
          feedback: true,
          createdAt: true,
        },
      }),
    ]);
    console.log("user id:", user.id, "\nlectureId:", lectureId);
    console.log("Progress:", progress, "\nSubmission:", submission);
    // If no progress exists yet, the user hasn't interacted with this assignment
    return NextResponse.json({
      status: submission?.status || "NOT_SUBMITTED",
      isCompleted: progress?.isCompleted || false,
      submission: submission || null, 
    });

  } catch (error) {
    console.error("[ASSIGNMENT_STATUS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}