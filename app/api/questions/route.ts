import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; 

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, lectureId , imageUrls } = await request.json(); 
    
    if (!title || !description || !lectureId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

      const question = await db.question.create({
        data: {
          title,
          description,
          lectureId,
          userId: session.user.id,
          images: {
            create: imageUrls.map((url: string) => ({
              url: url
            }))
          }
        },
        include: {
          images: true, 
          user: true,
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
      // If we are looking at a specific lecture
      whereClause.lectureId = lectureId;
    } else if (courseId) {
      // FIX: Drill down through the Module relation to find the courseId
      whereClause.lecture = {
        module: {
          courseId: courseId
        }
      };
    }

    const questions = await db.question.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, image: true },
        },
        images: true, // This requires the migration we discussed earlier
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
