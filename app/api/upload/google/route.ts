import { NextRequest, NextResponse } from "next/server";
import{ storage, bucketName } from "@/lib/google-cloud";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `course-assets/${uniqueSuffix}-${file.name.replace(/\s+/g, "_")}`;

    // 3. Upload to GCS
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.type,
    });

    return new Promise<NextResponse>((resolve, reject) => {
      blobStream.on("error", (err) => {
        console.error("GCS Upload Error:", err);
        reject(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
      });

      blobStream.on("finish", () => {
        // 4. Construct the public URL
        // Make sure your bucket allows public read access or configure accordingly
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        resolve(NextResponse.json({ url: publicUrl }));
      });

      blobStream.end(buffer);
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}