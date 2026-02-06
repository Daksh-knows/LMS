import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { sendGradingNotification } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { submissionId, grade, feedback } = await req.json();
    const numericGrade = parseFloat(grade);

    // 1. Fetch data including Student Email and Lecture Title
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        User: { select: { email: true, name: true } },
        lecture: { select: { title: true } }
      }
    });

    if (!submission) return new NextResponse("Not Found", { status: 404 });

    // 2. Database Transaction
    await db.$transaction([
      db.assignmentSubmission.update({
        where: { id: submissionId },
        data: { grade: numericGrade, feedback, status : "GRADED" },
      }),
      db.userProgress.update({
        where: {
          userId_lectureId: {
            userId: submission.studentId,
            lectureId: submission.lectureId,
          },
        },
        data: {
          assignmentStatus: "GRADED",
          isCompleted: true,
        },
      }),
    ]);

    // 3. Send Email (Background task - don't await if you want faster API response)
    if (submission.User.email) {
      sendGradingNotification(
        submission.User.email,
        submission.User.name || "Student",
        submission.lecture.title,
        numericGrade,
        feedback
      ).catch(err => console.error("Email Notify Error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}