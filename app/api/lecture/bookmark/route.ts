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