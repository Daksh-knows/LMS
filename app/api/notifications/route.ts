import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust path to your Prisma client
import { auth } from "@/auth"

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

export async function PATCH(req: Request) {
  try {
    const userId = "YOUR_DYNAMIC_USER_ID_HERE"; // Replace with real auth
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId: userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const notification = await db.notification.update({
        where: { id: notificationId, userId: userId },
        data: { isRead: true },
      });
      return NextResponse.json(notification);
    }

    return new NextResponse("Bad Request", { status: 400 });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}