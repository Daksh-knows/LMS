import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }

) {
  try {
    const session = await auth();
    // In real app: if (session?.user?.role !== "ADMIN") return 401...

    const { lectureId } = await context.params;

    const assignment = await db.lecture.findUnique({
      where: { id : lectureId },
      select: {
        title: true,
        submissions: {
          include: {
            User: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}