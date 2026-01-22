"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitReview(
  lectureId: string,
  rating: number,
  userId: string,
  comment?: string // Added comment parameter
) {
  if (!lectureId || !userId) {
    return { success: false, error: "Identification missing" };
  }

  try {
    await db.review.upsert({
      where: {
        userId_lectureId: {
          userId,
          lectureId,
        },
      },
      update: {
        rating,
        comment: comment || null,
      },
      create: {
        userId,
        lectureId,
        rating,
        comment: comment || null,
      },
    });

    // Revalidate the current course page to show updated stats
    revalidatePath("/learning/[courseId]", "page");

    return { success: true };
  } catch (error) {
    console.error("Prisma Error:", error);
    return { success: false, error: "Failed to save review" };
  }
}
