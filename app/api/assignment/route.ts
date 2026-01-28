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

    if (!file || !lectureId) {
      return NextResponse.json({ error: "Missing file or lecture ID" }, { status: 400 });
    }

    // 2. Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Upload to Cloudinary
    const uploadResponse: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "student_submissions",
          // Including userId in public_id helps avoid overwrites in Cloudinary
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

    // 4. Save to Database (Upsert: Create new or update existing)
    const submission = await db.assignmentSubmission.upsert({
      where: {
        studentId_lectureId: {
          studentId: userId,
          lectureId: lectureId,
        },
      },
      update: {
        fileUrl: fileUrl,
        // Reset grade/feedback if they resubmit? (Optional)
        grade: null,
        feedback: null,
      },
      create: {
        studentId: userId,
        lectureId: lectureId,
        fileUrl: fileUrl,
      },
    });

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      url: fileUrl 
    });

  } catch (error) {
    console.error("Assignment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}