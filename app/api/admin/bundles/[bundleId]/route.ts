import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ bundleId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { bundleId } = await params;
    const { title, description, price, isPublished, courseIds } = await req.json();

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (isPublished !== undefined) dataToUpdate.isPublished = isPublished;

    if (courseIds !== undefined) {
      dataToUpdate.courses = {
        set: courseIds.map((id: string) => ({ id }))
      };
    }

    const bundle = await db.courseBundle.update({
      where: { id: bundleId },
      data: dataToUpdate,
      include: { courses: true }
    });

    return NextResponse.json({ success: true, bundle });
  } catch (error: any) {
    console.error("[BUNDLE_UPDATE_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update bundle" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ bundleId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { bundleId } = await params;

    await db.courseBundle.delete({
      where: { id: bundleId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[BUNDLE_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete bundle" }, { status: 500 });
  }
}
