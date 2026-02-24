import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust path to your Prisma client
import { auth } from "@/auth"
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
  try {
    // 1. Get current user ID (Replace this with your auth logic)
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, 
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { notificationId, deleteAll } = await req.json();
    const  user  = await getCurrentUser(); 

    if (deleteAll) {
      await db.notification.deleteMany({
        where: { userId: user?.id }
      });
      return new NextResponse("All notifications deleted", { status: 200 });
    }

    await db.notification.delete({
      where: { 
        id: notificationId,
        userId : user?.id,
      }
    });

    return new NextResponse("Notification deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}