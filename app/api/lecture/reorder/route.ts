import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust path to your Prisma instance

export async function PUT(
  req: NextRequest,
) {
  try {
    const { lectureIds, adminId } = await req.json();

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!lectureIds || !Array.isArray(lectureIds)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    // Use a transaction to update all positions atomically
    await db.$transaction(
      lectureIds.map((id: string, index: number) => 
        db.lecture.update({
          where: { id },
          data: { position: index }, // Ensure your Lecture model has a 'position' field (Int)
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save order" }, { status: 500 });
  }
}