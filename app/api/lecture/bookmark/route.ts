import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
    console.log("Testing bookmark route");
  try {
    const user = await getCurrentUser()
    const userId = user?.id;
    const { lectureId, time, label, type } = await req.json();
    console.log("Received bookmark data:", { lectureId, time, label, type });
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const bookmark = await db.bookmark.create({
      data: {
        userId,
        lectureId,
        time,
        label,
        type ,
      }
    });

    return NextResponse.json(bookmark);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");
    const courseId = searchParams.get("courseId");
    const sort = searchParams.get("sort"); // 'time' or 'recent'

    let whereClause: any = { userId };
    let orderByClause: any = {};

    // 1. Filter Logic
    if (lectureId) {
      // Specific lecture only
      whereClause.lectureId = lectureId;
    } else if (courseId) {
      // All bookmarks in the course (Bookmark -> Lecture -> Module -> Course)
      whereClause.lecture = {
        module: {
          courseId: courseId
        }
      };
    } else {
      return new NextResponse("Missing Context (lectureId or courseId)", { status: 400 });
    }

    // 2. Sort Logic
    if (sort === "recent") {
      orderByClause = { createdAt: "desc" };
    } else {
      // Default: Chronological order
      orderByClause = { time: "asc" };
    }

    const bookmarks = await db.bookmark.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            position: true
          }
        }
      }
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("[BOOKMARKS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookmarkId = searchParams.get("bookmarkId");

    if (!bookmarkId) {
      return new NextResponse("Bookmark ID missing", { status: 400 });
    }

    // Optional: Verify the bookmark belongs to the user before deleting
    const bookmark = await db.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark || bookmark.userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.bookmark.delete({
      where: { id: bookmarkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BOOKMARK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}