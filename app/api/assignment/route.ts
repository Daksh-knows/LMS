import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { db } from "@/lib/db";
import { auth } from "@/auth";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    // Replace literal newlines in the private key string
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);

// export async function POST(req: NextRequest) {
//   try {
//     const session = await auth();
//     const userId = session?.user?.id;

//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const lectureId = formData.get("lectureId") as string;
//     // Ensure courseId is passed from the client to help create progress if it doesn't exist
//     const courseId = formData.get("courseId") as string; 

//     if (!file || file.type !== "application/pdf") {
//       return NextResponse.json({ error: "Only PDFs are allowed" }, { status: 400 });
//     }

//     // Define the path inside the bucket
//     const fileName = `submissions/${lectureId}/${userId}.pdf`;
//     const blob = bucket.file(fileName);

//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       contentType: "application/pdf",
//       metadata: {
//         // This is the CRITICAL metadata for opening in a new tab
//         contentDisposition: "inline", 
//       },
//     });

//     const buffer = Buffer.from(await file.arrayBuffer());

//     // Stream the file to GCS
//     await new Promise((resolve, reject) => {
//       blobStream.on("error", (err: any) => reject(err));
//       blobStream.on("finish", () => resolve(true));
//       blobStream.end(buffer);
//     });

//     // Option: Make the file public (requires the bucket to allow public access)
//     // await blob.makePublic(); 
//     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

//     // Update your database
//     await db.assignmentSubmission.upsert({
//       where: {
//         studentId_lectureId: { studentId: userId, lectureId }
//       },
//       update: { fileUrl: publicUrl, status: "SUBMITTED" },
//       create: { studentId: userId, lectureId, fileUrl: publicUrl, status: "SUBMITTED" },
//     });

//     return NextResponse.json({ success: true, url: publicUrl });

//   } catch (error: any) {
//     console.error("GCS_ERROR", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const lectureId = formData.get("lectureId") as string;
    const courseId = formData.get("courseId") as string; 

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDFs are allowed" }, { status: 400 });
    }

    const fileName = `submissions/${lectureId}/${userId}.pdf`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: "application/pdf",
      metadata: {
        contentDisposition: "inline", 
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    await new Promise((resolve, reject) => {
      blobStream.on("error", (err: any) => reject(err));
      blobStream.on("finish", () => resolve(true));
      blobStream.end(buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // --- TRANSACTION START ---
    // We update the submission and create activity in one go
    await db.$transaction([
      // 1. Upsert the Assignment Submission
      db.assignmentSubmission.upsert({
        where: {
          studentId_lectureId: { studentId: userId, lectureId }
        },
        update: { fileUrl: publicUrl, status: "SUBMITTED" },
        create: { studentId: userId, lectureId, fileUrl: publicUrl, status: "SUBMITTED" },
      }),

      // 2. Create the User Activity record
      db.userActivity.create({
        data: {
          userId: userId,
          type: "ASSIGNMENT_SUBMISSION", // Matches your ActivityType Enum
          duration: 0,
        },
      }),
    ]);
    // --- TRANSACTION END ---

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    console.error("GCS_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}