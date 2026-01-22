import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  req: Request,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await auth();
    const { questionId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch the question with its images
    const question = await db.question.findUnique({
      where: { id: questionId },
      include: { images: true }
    });

    if (!question) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 2. Authorization: ONLY the author can delete
    if (question.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 3. Delete files from Cloudinary storage
    if (question.images && question.images.length > 0) {
      const deletePromises = question.images.map((image) => {
        // Extracts publicId from URL: "https://.../v12345/abc_id.jpg" -> "abc_id"
        const parts = image.url.split("/");
        const filename = parts[parts.length - 1]; 
        const publicId = filename.split(".")[0];
        
        return cloudinary.uploader.destroy(publicId);
      });

      await Promise.all(deletePromises);
    }

    // 4. Delete from Database
    await db.question.delete({
      where: { id: questionId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[QUESTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}