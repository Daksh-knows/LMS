import { NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, domain, collegeName, collegeDegree, collegeYear, image } = body;

    let imageUrl = image;

    // 1. If 'image' is a Base64 string (starts with data:image), upload to Cloudinary
    if (image && image.startsWith("data:image")) {
      try {
        const uploadResult: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(image, {
            folder: "user_avatars",
            resource_type: "image",
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("[CLOUDINARY_UPLOAD_ERROR]", uploadError);
        return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
      }
    }

    // 2. Transaction to update StudentProfile and User model
    await db.$transaction([
      db.studentProfile.upsert({
        where: { userId: session.user.id },
        update: {
          fullName,
          domain,
          collegeName,
          collegeDegree,
          collegeYear: parseInt(collegeYear) || 1,
          // If your studentProfile model has an image field, add it here:
          // image: imageUrl 
        },
        create: {
          userId: session.user.id,
          fullName,
          domain,
          collegeName,
          collegeDegree,
          collegeYear: parseInt(collegeYear) || 1,
        },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { 
          name: fullName,
          image: imageUrl // Updates the main User avatar used by NextAuth
        }
      })
    ]);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}