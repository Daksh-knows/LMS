import { NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, domain, collegeName, collegeDegree, collegeYear } = body;

    // Transaction to ensure both tables update or fail together
    await db.$transaction([
      db.studentProfile.upsert({
        where: { userId: session.user.id },
        update: {
          fullName,
          domain,
          collegeName,
          collegeDegree,
          collegeYear: parseInt(collegeYear) || 1,
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
        data: { name: fullName }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}