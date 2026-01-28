import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if(!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { submissionId, grade, feedback } = await req.json();

    await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: parseFloat(grade),
        feedback,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Grading Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save grade" }, { status: 500 });
  }
}