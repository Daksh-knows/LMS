"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveNote(
  lectureId: string,
  userId: string,
  content: string
) {
  if (!lectureId || !userId) {
    return { success: false, error: "Identification missing" };
  }

  try {

    const existingNote = await db.note.findFirst({
      where: { userId, lectureId },
    });

    if (existingNote) {
      await db.note.update({
        where: { id: existingNote.id },
        data: { content },
      });
    } else {
      await db.note.create({
        data: {
          content,
          userId,
          lectureId,
        },
      });
    }

    revalidatePath("/learning/[courseId]", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to save note:", error);
    return { success: false, error: "Database error" };
  }
}
