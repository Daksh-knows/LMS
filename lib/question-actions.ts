"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function createQuestion({
  title,
  description,
  lectureId,
  courseId, // Added courseId for revalidation
  imageUrl,
}: {
  title: string;
  description: string;
  lectureId: string;
  courseId: string;
  imageUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return { success: false, error: "Unauthorized" };

    const question = await db.question.create({
      data: {
        title,
        description,
        imageUrl,
        userId: user.id,
        lectureId: lectureId,
      },
    });

    // Revalidate the specific course learning page
    revalidatePath(`/learning/${courseId}`);

    return { success: true, question };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to post question" };
  }
}

export async function getLectureQuestions(lectureId: string) {
  try {
    const questions = await db.question.findMany({
      where: {
        lectureId: lectureId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

    return { success: true, questions };
  } catch (error) {
    console.error("FETCH_QUESTIONS_ERROR:", error);
    return { success: false, questions: [] };
  }
}

export async function createReply({
  content,
  questionId,
  parentReplyId,
  courseId,
}: {
  content: string;
  questionId: string;
  parentReplyId?: string;
  courseId: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const reply = await db.reply.create({
      data: {
        content,
        questionId,
        userId: user.id,
        parentReplyId: parentReplyId || null,
      },
    });

    revalidatePath(`/learning/${courseId}`);
    return { success: true, reply };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to post reply" };
  }
}