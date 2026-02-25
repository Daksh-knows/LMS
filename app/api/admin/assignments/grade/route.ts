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

    // 1. Fetch data including Student details, Lecture details, and the Course ID
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        User: { select: { email: true, name: true, id: true } },
        lecture: { 
          select: { 
            title: true, 
            id: true,
            module: { select: { courseId: true } } // Traverse to get courseId
          } 
        }
      }
    });

    if (!submission) return new NextResponse("Not Found", { status: 404 });

    const courseId = submission.lecture.module.courseId;
    const lectureId = submission.lecture.id;
    const studentId = submission.User.id;

    // 2. Database Transaction
    await db.$transaction([
      // 1. Keep this as UPDATE (because we know submissionId exists)
      db.assignmentSubmission.update({
        where: { id: submissionId },
        data: { grade: numericGrade, feedback, status: "GRADED" },
      }),
      
      // 2. This is the one that needs UPSERT logic
      // Note: UPSERT does not use "data", it uses "update" and "create"
      db.userProgress.upsert({
        where: {
          userId_lectureId: {
            userId: studentId,
            lectureId: lectureId,
          },
        },
        update: {
          assignmentStatus: "GRADED",
          isCompleted: true,
        },
        create: {
          userId: studentId,
          lectureId: lectureId,
          courseId: courseId,
          assignmentStatus: "GRADED",
          isCompleted: true,
        },
      }),

      // 3. Keep this as CREATE (uses "data")
      db.notification.create({
        data: {
          userId: studentId,
          courseId: courseId,
          type: "ASSIGNMENT",
          title: "Assignment Graded",
          message: `Your assignment for "${submission.lecture.title}" has been graded. Grade: ${numericGrade}%`,
          actionUrl: `/learning/${courseId}/${lectureId}`,
        },
      }),
    ]);

    // 4. Send Email
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