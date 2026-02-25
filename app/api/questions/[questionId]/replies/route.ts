import { auth } from "@/auth"; 
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest  ,
  context: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await auth();
    const { content } = await req.json();
    const { questionId } = await context.params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // 1. Create the reply
    const reply = await db.reply.create({
      data: {
        content,
        questionId: questionId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        },
        // We include the question and course hierarchy to get the original poster and teacher ID
        question: {
          include: {
            lecture: {
              include: {
                module: {
                  include: {
                    course: {
                      select: {
                        id: true,
                        adminId: true,
                        title: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // 2. Notification Logic
    const questionOwnerId = reply.question.userId;
    const course = reply.question.lecture.module.course;
    const isTeacher = session.user.id === course.adminId;

    // Only notify if the replier is NOT the original poster
    if (questionOwnerId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: questionOwnerId,
          courseId: course.id,
          type: "MENTION", // Using MENTION for direct interactions
          title: isTeacher ? "Instructor Replied" : "New Reply on Your Question",
          message: isTeacher 
            ? `The instructor replied to your question in ${course.title}`
            : `${session.user.name || "A student"} replied to your question.`,
          actionUrl: `/learning/${course.id}/${reply.question.lectureId}?tab=qa`,
        }
      });
    }

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[REPLY_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}