import { NextRequest, NextResponse } from "next/server";
import { storage, bucketName } from "@/lib/google-cloud";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const filename = `course-assets/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);

    // 🔑 Web Stream → Node Stream (TS-safe)
    const webStream = file.stream() as ReadableStream;
    const nodeStream = Readable.fromWeb(webStream);

    await new Promise<void>((resolve, reject) => {
      const gcsStream = blob.createWriteStream({
        resumable: false,
        contentType: file.type,
      });

      nodeStream
        .on("error", reject)
        .pipe(gcsStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    return NextResponse.json({ url: publicUrl });

  } catch (err: any) {
    console.error("Upload API Error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}