export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { storage, bucketName } from "@/lib/google-cloud";

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // Sanitize filename
    const safeName = fileName.replace(/\s+/g, "_");

    // Unique object path
    const objectPath = `course-videos/${Date.now()}-${safeName}`;

    const file = storage
      .bucket(bucketName)
      .file(objectPath);

    // Generate V4 signed URL (WRITE)
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    return NextResponse.json({
      uploadUrl, // temporary PUT URL
      publicUrl: `https://storage.googleapis.com/${bucketName}/${objectPath}`, // save this in DB
    });

  } catch (error) {
    console.error("Signed URL Error:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}