import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const courseId = searchParams.get("courseId");

    // Fetch user using your utility
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    const bookmarks = await db.bookmark.findMany({
      where: {
        userId: user.id,
        // Relation traversal: Bookmark -> Lecture -> Module -> Course
        lecture: {
          module: {
            courseId: courseId,
          },
        },
        // Search by label
        label: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            position: true,
            // Include module title for the "Module X: Lecture Title" UI requirement
            module: {
              select: {
                title: true
              }
            }
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("[BOOKMARK_SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}