import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ questionId: string }> }

) {
  try {
    const session = await auth();
    const { content } = await req.json();
    const { questionId } = await context.params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Validate input
    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // 3. Create the reply
    const reply = await db.reply.create({
      data: {
        content,
        questionId: questionId,
        userId: session.user.id,
      },

      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[REPLY_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}