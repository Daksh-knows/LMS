import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = await params;
    const { sectionTitle } = await req.json();

    
    if (!sectionTitle) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    // 1. Verify Ownership (Safety Check)
    const course = await db.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return new NextResponse("Unauthorized or Course not found", { status: 401 });
    }

    // 2. Calculate next position
    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' }
    });
    
    const newPosition = (lastModule?.position || 0) + 1;

    // 3. Create the module
    const newModule = await db.module.create({
      data: {
        title: sectionTitle,
        courseId: courseId,
        position: newPosition,
        isPublished: true
      }
    });

    return NextResponse.json({ success: true, moduleId: newModule.id });
  } catch (error: any) {
    console.error("[ADD_MODULE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create module" },
      { status: 500 }
    );
  }
}
