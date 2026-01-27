import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import  cloudinary  from "@/lib/cloudinary";

export async function GET(
  request: Request,
  // Ensure the param name matches your folder name [lectureId]
  { params }: { params: { lectureId: string } } 
) {
  try {
    const { lectureId } = await params;

    const lecture = await db.lecture.findUnique({
      where: { 
        id: lectureId 
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        videoUrl: true,
        position: true,
        moduleId: true,
        quizQuestions :{
          include:{options : true} ,
          orderBy: { position: 'asc' }
        },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("[COURSE_ITEM_GET_API]", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { lectureId: string } }
) {
  try {
    const session = await auth();
    const { lectureId } = await params;
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