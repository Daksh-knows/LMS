import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import  cloudinary  from "@/lib/cloudinary";


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
    // console.log(lectureId)
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch the lecture to get the video metadata before deletion 
    const lecture = await db.lecture.findUnique({
      where: { id: lectureId },
      select: { type: true, videoUrl: true }
    });

    if (!lecture) {
      return new NextResponse("Lecture not found", { status: 404 });
    }

    // 2. If it's a video, attempt to delete from Cloudinary
    if (lecture.type === "VIDEO" && lecture.videoUrl?.includes("cloudinary.com")) {
      try {
        // Extract publicId from URL (e.g., .../upload/v1234/folder/video_name.mp4)
        const parts = lecture.videoUrl.split("/");
        const fileName = parts[parts.length - 1]; // "video_name.mp4"
        const publicId = fileName.split(".")[0]; // "video_name"
        console.log("Deleting video with publicId:", publicId);
        // If your videos are in folders, you'll need the full path:
        // const publicId = lecture.videoUrl.split('/upload/')[1].split('/')[1].split('.')[0];

        await cloudinary.uploader.destroy(publicId, {
          resource_type: "video",
        });
      } catch (cloudErr) {
        console.error("Cloudinary Delete Error:", cloudErr);
      }
    }

    // 3. Delete from DB (Triggers cascade for quizQuestions and answerOptions) 
    await db.lecture.delete({
      where: { id: lectureId },
    });

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