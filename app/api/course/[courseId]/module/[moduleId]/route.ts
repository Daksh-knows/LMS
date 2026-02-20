import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await context.params;
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    // 1. Authorization Check
    if (!adminId) {
      return new NextResponse("Unauthorized: Admin ID required", { status: 401 });
    }

    // 2. Ownership Check (Ensure the module belongs to a course owned by this admin)
    const module = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });

    if (!module || module.course.adminId !== adminId) {
      return new NextResponse("Unauthorized or Module not found", { status: 401 });
    }

    // 3. Delete the Module
    // Prisma cascading deletes will handle lectures, quizzes, etc.
    await db.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE_MODULE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete module" },
      { status: 500 }
    );
  }
}