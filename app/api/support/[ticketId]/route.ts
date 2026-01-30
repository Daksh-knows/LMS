import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

// GET: Fetch Messages for a specific ticket
export async function GET(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const ticket = await db.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      messages: {
        include: { sender: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      },
      user: { select: { name: true, email: true } }
    }
  });

  return NextResponse.json({ success: true, data: ticket });
}

// POST: Add a reply (and optionally update status)
export async function POST(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  
  const { ticketId } = await params;
  const { message, newStatus } = await req.json(); // Accept newStatus

  // 1. Create the Message
  const newMessage = await db.supportMessage.create({
    data: {
      ticketId,
      senderId: user.id,
      message
    }
  });

  // 2. Determine Status Update
  // If 'newStatus' is sent (e.g. 'CLOSED'), use it.
  // Otherwise, if Admin replies, default to 'IN_PROGRESS'.
  let statusToUpdate = newStatus;
  
  if (!statusToUpdate && user.role === "ADMIN") {
    // Check current status first to avoid re-opening closed tickets accidentally
    const currentTicket = await db.supportTicket.findUnique({ 
        where: { id: ticketId }, select: { status: true } 
    });
    if (currentTicket?.status !== 'CLOSED') {
        statusToUpdate = 'IN_PROGRESS';
    }
  }

  // 3. Update Ticket Status if needed
  if (statusToUpdate) {
    await db.supportTicket.update({
      where: { id: ticketId },
      data: { status: statusToUpdate }
    });
  }

  return NextResponse.json({ success: true, data: newMessage });
}

// PATCH: Close/Reopen Ticket (Admin Only or Owner)
export async function PATCH(req: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const { status } = await req.json();

  await db.supportTicket.update({
    where: { id: ticketId },
    data: { status }
  });

  return NextResponse.json({ success: true });
}