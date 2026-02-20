import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";


export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lectureId, fileUrl } = await req.json();

    if (!fileUrl || !lectureId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // --- TRANSACTION ---
    await db.$transaction([
      db.assignmentSubmission.upsert({
        where: {
          studentId_lectureId: { studentId: userId, lectureId },
        },
        update: {
          fileUrl,
          status: "SUBMITTED",
        },
        create: {
          studentId: userId,
          lectureId,
          fileUrl,
          status: "SUBMITTED",
        },
      }),
      db.userActivity.create({
        data: {
          userId,
          type: "ASSIGNMENT_SUBMISSION",
          duration: 0,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ASSIGNMENT_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}