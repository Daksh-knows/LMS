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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const lectureId = formData.get("lectureId") as string;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDFs are allowed" }, { status: 400 });
    }

    // Define the path inside the bucket
    const fileName = `submissions/${lectureId}/${userId}.pdf`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: "application/pdf",
      metadata: {
        // This is the CRITICAL metadata for opening in a new tab
        contentDisposition: "inline", 
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Stream the file to GCS
    await new Promise((resolve, reject) => {
      blobStream.on("error", (err) => reject(err));
      blobStream.on("finish", () => resolve(true));
      blobStream.end(buffer);
    });

    // Option: Make the file public (requires the bucket to allow public access)
    // await blob.makePublic(); 
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update your database
    await db.assignmentSubmission.upsert({
      where: {
        studentId_lectureId: { studentId: userId, lectureId }
      },
      update: { fileUrl: publicUrl },
      create: { studentId: userId, lectureId, fileUrl: publicUrl },
    });

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: any) {
    console.error("GCS_ERROR", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}