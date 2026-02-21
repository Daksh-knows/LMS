import { NextResponse } from "next/server";
import { storage, bucketName, parsePrivateKey } from "@/lib/google-cloud";

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();

    // Create a unique filename for the bucket
    const uniqueFilename = `course-videos/${Date.now()}-${fileName.replace(/\s/g, "_")}`;

    // Generate a Signed URL that expires in 15 minutes
    // This URL allows a specific "PUT" operation for this specific file
    const [url] = await storage
      .bucket(bucketName)
      .file(uniqueFilename)
      .getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000,
        contentType: contentType,
      });

    return NextResponse.json({
      url: url,
      publicUrl: `https://storage.googleapis.com/${bucketName}/${uniqueFilename}` // The permanent URL to save in DB
    });

  } catch (error) {
    console.error("Signed URL Error:", error);
    return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
  }
}