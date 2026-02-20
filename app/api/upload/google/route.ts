import { NextRequest, NextResponse } from "next/server";
import{ storage, bucketName } from "@/lib/google-cloud";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `course-assets/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);

    // 1. Wrap the entire stream process in a Promise
    await new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        resumable: false, // Set to false for small/medium files to avoid metadata overhead
        contentType: file.type,
      });

      // 2. Attach listeners BEFORE calling .end()
      blobStream.on("error", (err) => {
        console.error("GCS Stream Error:", err);
        reject(err);
      });

      blobStream.on("finish", () => {
        resolve(true);
      });

      // 3. Write the data and close the stream in one go
      blobStream.end(buffer);
    });

    // 4. ONLY return the response after the promise resolves
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}