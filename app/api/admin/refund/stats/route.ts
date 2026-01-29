import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const pendingCount = await db.refundRequest.count({
    where: { status: "PENDING" }
  });
  return NextResponse.json({ success: true, pendingCount });
}