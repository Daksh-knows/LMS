import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; 

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, lectureId } = body; 
     
    if (!title || !description || !lectureId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const question = await db.question.create({
      data: {
        title,
        description,
        lectureId,
        userId: session.user.id, 
      },
      include: {
        user: { 
          select: { name: true, image: true } 
        }
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("[QUESTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lectureId = searchParams.get("lectureId"); 
    const courseId = searchParams.get("courseId");

    const whereClause: any = {};

    if (lectureId) {
      whereClause.lectureId = lectureId;
    } else if (courseId) {
      whereClause.lecture = {
        module: {
          courseId: courseId,
        },
      };
    } else {
      return NextResponse.json(
        { error: "Either lectureId or courseId is required" },
        { status: 400 }
      );
    }

    // FIXED: Corrected the 'user' include block syntax
    const questions = await db.question.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, image: true },
        },
        replies: {
          include: {
            user: { 
              select: { name: true, image: true } 
            },
          },
          orderBy: {
            createdAt: "asc", 
          },
        },
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("[QUESTIONS_GET_API]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}


