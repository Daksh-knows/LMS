import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { submissionId, grade, feedback } = await req.json();

    // 1. First, find the submission to get studentId and lectureId
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      select: { studentId: true, lectureId: true }
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    // 2. Perform both updates in a Transaction
    await db.$transaction([
      // Update the Assignment Submission with grade and feedback
      db.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade: parseFloat(grade),
          feedback,
        },
      }),

      // Update the User Progress for this specific student and lecture
      db.userProgress.update({
        where: {
          userId_lectureId: {
            userId: submission.studentId,
            lectureId: submission.lectureId,
          },
        },
        data: {
          assignmentStatus: "GRADED",
          isCompleted: true, // Mark lecture as finished now that it's graded
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save grade and update progress" },
      { status: 500 }
    );
  }
}