import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(
  req: NextRequest,
   context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const user = await getCurrentUser();

    // 1. Authentication Check
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Create Enrollment
    await db.myEnrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // 3. Handle Duplicate Enrollment (Prisma P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: "You are already enrolled in this course." },
        { status: 400 }
      );
    }

    console.error("[COURSE_ENROLL_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to enroll. Please try again." },
      { status: 500 }
    );
  }
}