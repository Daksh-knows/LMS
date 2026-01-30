import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { subject, message, priority } = await req.json();
    console.log("Creating support ticket for user ID:", user.id);
    const ticket = await db.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        priority,
        status: "OPEN",
        messages: {
          create: {
            senderId: user.id,
            message: message
          }
        }
      }
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Admins see all, Students see only theirs
    const whereClause = user.role === "ADMIN" ? {} : { userId: user.id };

    const tickets = await db.supportTicket.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 });
  }
}