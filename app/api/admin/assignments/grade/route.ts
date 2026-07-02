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

    const { submissionId, grade, feedback, rubricScores } = await req.json();
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
            rubric: true,
            module: { select: { courseId: true } } // Traverse to get courseId
          } 
        }
      }
    });

    if (!submission) return new NextResponse("Not Found", { status: 404 });

    const courseId = submission.lecture.module.courseId;
    const lectureId = submission.lecture.id;
    const studentId = submission.User.id;

    let finalGrade = numericGrade;
    let validatedRubricScores = rubricScores;
    let isRubricGrading = false;

    if (rubricScores && Array.isArray(rubricScores)) {
      const rubric = submission.lecture.rubric as any;
      if (rubric && rubric.criteria && Array.isArray(rubric.criteria)) {
        isRubricGrading = true;
        let totalScore = 0;
        
        // Map criteria id to its maxPoints
        const critMap = new Map<string, number>();
        rubric.criteria.forEach((c: any) => {
          const maxPts = parseFloat(c.maxPoints) || 0;
          critMap.set(c.id, maxPts);
        });

        validatedRubricScores = rubricScores.map((s: any) => {
          const maxPts = critMap.get(s.criterionId) || 0;
          const originalPoints = parseFloat(s.points) || 0;
          // Clamp score between 0 and maxPoints
          const clampedPoints = Math.max(0, Math.min(originalPoints, maxPts));
          totalScore += clampedPoints;
          return {
            ...s,
            points: clampedPoints,
          };
        });

        finalGrade = Math.round(totalScore * 10) / 10;
      }
    }

    // 2. Database Transaction
    await db.$transaction([
      // 1. Keep this as UPDATE (because we know submissionId exists)
      db.assignmentSubmission.update({
        where: { id: submissionId },
        data: { 
          grade: finalGrade, 
          feedback, 
          status: "GRADED",
          rubricScores: validatedRubricScores || undefined
        },
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
          message: `Your assignment for "${submission.lecture.title}" has been graded. Grade: ${finalGrade}${isRubricGrading ? "" : "%"}`,
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
        finalGrade,
        feedback
      ).catch(err => console.error("Email Notify Error:", err));
    }

    return NextResponse.json({ success: true, grade: finalGrade });
  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}