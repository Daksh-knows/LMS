import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, price, isPublished, courseIds } = await req.json();

    if (!title || price === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const bundle = await db.courseBundle.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        isPublished: isPublished || false,
        adminId: session.user.id,
        courses: {
          connect: courseIds?.map((id: string) => ({ id })) || []
        }
      },
    });

    return NextResponse.json({ success: true, bundle });
  } catch (error: any) {
    console.error("[BUNDLE_CREATE_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create bundle" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bundles = await db.courseBundle.findMany({
      include: {
        courses: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const courses = await db.course.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, bundles, courses });
  } catch (error: any) {
    console.error("[BUNDLE_GET_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch bundles" }, { status: 500 });
  }
}
