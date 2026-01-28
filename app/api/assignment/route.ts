import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db"; 
import { getCurrentUser } from "@/lib/auth-utils";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const lectureId = formData.get("lectureId") as string;
    // Ensure courseId is passed from the client to help create progress if it doesn't exist
    const courseId = formData.get("courseId") as string; 

    if (!file || !lectureId) {
      return NextResponse.json({ error: "Missing file or lecture ID" }, { status: 400 });
    }

    // 1. Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Upload to Cloudinary
    const uploadResponse: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "student_submissions",
          public_id: `submission_${lectureId}_${userId}`, 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const fileUrl = uploadResponse.secure_url;

    // 3. Database Transaction: Update Submission AND Progress
    const [submission, progress] = await db.$transaction([
      // Upsert the Assignment Submission
      db.assignmentSubmission.upsert({
        where: {
          studentId_lectureId: {
            studentId: userId,
            lectureId: lectureId,
          },
        },
        update: {
          fileUrl: fileUrl,
          grade: null,
          feedback: null,
        },
        create: {
          studentId: userId,
          lectureId: lectureId,
          fileUrl: fileUrl,
        },
      }),

      // Upsert the User Progress to "SUBMITTED"
      db.userProgress.upsert({
        where: {
          userId_lectureId: {
            userId: userId,
            lectureId: lectureId,
          },
        },
        update: {
          assignmentStatus: "SUBMITTED",
          // You might want to mark it as completed here, or wait for grading
          // isCompleted: true, 
        },
        create: {
          userId: userId,
          lectureId: lectureId,
          courseId: courseId || "", // Defaulting to empty if not provided
          assignmentStatus: "SUBMITTED",
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      progressStatus: progress.assignmentStatus,
      url: fileUrl 
    });

  } catch (error) {
    console.error("Assignment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}