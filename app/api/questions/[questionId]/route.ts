import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; 

export async function DELETE(
  req: Request,
  { params }: { params: { questionId: string } }
) {
  console.log("DELETE request received for questionId:", params.questionId);
  try {
    const session = await auth();
    const { questionId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure only the author can delete
    const question = await db.question.findUnique({
      where: { id: questionId },
      select: { userId: true }
    });
    console.log("Question to delete:", question);
    if (!question) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (question.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.question.delete({
      where: { id: questionId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[QUESTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}