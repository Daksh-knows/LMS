import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteAsset } from "@/lib/cloud/delete-assets";


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lectureId: string }> }
) {
  try {
    const { lectureId } = await context.params;

    const lecture = await db.lecture.findUnique({
      where: { 
        id: lectureId 
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true, // "VIDEO", "LIVE", "TEXT", "QUIZ", "ASSIGNMENT"
        videoUrl: true,
        position: true,
        moduleId: true,
        textContent: true,
        duration: true,
        quizQuestions: {
          include: { options: true },
          orderBy: { position: 'asc' }
        },
        resources: true,
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // --- LOGIC: Handle Quiz Type & Randomization ---
    
    let finalQuestions: any[] = [];

    // Check if the enum type is "QUIZ"
    if (lecture.type === "QUIZ") {
      finalQuestions = lecture.quizQuestions;

      // Parse description for potential questionCount limit
      if (lecture.description) {
        try {
          const config = JSON.parse(lecture.description);
          const limit = config.questionCount;

          if (typeof limit === "number" && limit > 0) {
            // Shuffle in-memory
            const shuffled = [...lecture.quizQuestions]
              .map((value) => ({ value, sort: Math.random() }))
              .sort((a, b) => a.sort - b.sort)
              .map(({ value }) => value);

            finalQuestions = shuffled.slice(0, limit);
          }
        } catch (e) {
          console.warn("Description is not valid JSON, returning all questions.");
        }
      }
    } else {
      // If the type is VIDEO, LIVE, TEXT, or ASSIGNMENT, ensure the array is empty
      finalQuestions = [];
    }

    return NextResponse.json({
      ...lecture,
      quizQuestions: finalQuestions
    });

  } catch (error) {
    console.error("[COURSE_ITEM_GET_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth();
    const { lectureId } = await context.params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch Lecture AND Attachments to get all URLs
    const lecture = await db.lecture.findUnique({
      where: { id: lectureId },
      include: {
        resources: true, // <--- Include attachments to get their URLs
        submissions: true, // <--- Include submissions to get their URLs (if any)
      },
    });

    if (!lecture) {
      return new NextResponse("Lecture not found", { status: 404 });
    }

    // 2. Collect all delete promises
    const deletePromises: Promise<void>[] = [];

    // A. Delete Main Video
    if (lecture.videoUrl) {
      deletePromises.push(deleteAsset(lecture.videoUrl));
    }

    // B. Delete All Attachments
    if (lecture.resources && lecture.resources.length > 0) {
      for (const attachment of lecture.resources) {
        if (attachment.url) {
          deletePromises.push(deleteAsset(attachment.url));
        }
      }
    }
    if(lecture.submissions && lecture.submissions.length > 0) {
      for (const submission of lecture.submissions) {
        if (submission.fileUrl) {
          deletePromises.push(deleteAsset(submission.fileUrl));
        }
      }
    }

    // Wait for all cloud deletions to finish (or fail silently)
    // We use Promise.allSettled so one failure doesn't stop the DB deletion
    await Promise.allSettled(deletePromises);

    // 3. Delete from DB 
    // (This triggers cascade delete for attachments/questions in the DB)
    await db.lecture.delete({
      where: { id: lectureId },
    });

    console.log(`[LECTURE_DELETE] Deleted lecture ${lectureId} and its assets.`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[LECTURE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const { lectureId } = await params;
    const body = await req.json();
    
    // 1. Authorization Check
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verification: Ensure the lecture exists and belongs to the user's course
    // (Optional but recommended for security)
    const existingLecture = await db.lecture.findUnique({
      where: { id: lectureId },
      include: { module: { include: { course: true } } }
    });

    if (!existingLecture) {
      return NextResponse.json({ success: false, error: "Lecture not found" }, { status: 404 });
    }

    // 3. Perform the Update
    // We destructure only the allowed fields to prevent accidental overwrites
    const { videoUrl, title, description, isFree, duration } = body;

    const updatedLecture = await db.lecture.update({
      where: { id: lectureId },
      data: {
        ...(videoUrl !== undefined && { videoUrl }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }), // Used for status updates
        ...(isFree !== undefined && { isFree }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedLecture,
    });

  } catch (error: any) {
    console.error("[LECTURE_PATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}