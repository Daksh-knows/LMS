"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Enrolls a user in a course using the Enrollment model.
 *
 */
export async function enrollInCourse(courseId: string) {
  try {
    const user = await getCurrentUser(); //

    if (!user || !user.id) {
      return { success: false, error: "You must be logged in to enroll." };
    }

    // Create the enrollment record
    await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        // currentLectureId is optional, so it stays null initially
      },
    });

    revalidatePath("/dashboard"); 
    return { success: true };
  } catch (error: any) {
    // Handle Prisma P2002 (Unique constraint failed)
    if (error.code === 'P2002') {
      return { success: false, error: "You are already enrolled in this course." };
    }
    
    console.error("Enrollment error:", error);
    return { success: false, error: "Failed to enroll. Please try again." };
  }
}