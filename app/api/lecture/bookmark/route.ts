import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
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

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");

    if (!lectureId) {
      return new NextResponse("Lecture ID missing", { status: 400 });
    }

    const bookmarks = await db.bookmark.findMany({
      where: {
        lectureId: lectureId,
        userId: userId, 
      },
      orderBy: {
        time: "asc", 
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("[BOOKMARKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
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