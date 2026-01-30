import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const data = await db.refundRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ success: true, data });
}