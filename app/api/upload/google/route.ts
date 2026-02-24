export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { storage, bucketName } from "@/lib/google-cloud";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    const safeName = filename.replace(/\s+/g, "_");
    const finalPath = `course-assets/${Date.now()}-${safeName}`;

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(finalPath);

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${finalPath}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
    });
  } catch (err: any) {
    console.error("Signed URL Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}