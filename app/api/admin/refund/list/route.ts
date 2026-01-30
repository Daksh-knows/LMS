import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("Fetching refund requests...");
    const requests = await db.refundRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            batch: true, // Fetch Batch
            payments: {
              where: { status: "SUCCESS" },
              orderBy: { createdAt: "desc" },
              take: 1, // Fetch only the latest successful payment
              select: { createdAt: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Fetched ${requests.length} refund requests.`);

    // Flatten the data structure for the frontend
    const formattedData = requests.map(req => ({
      ...req,
      user: {
        ...req.user,
        paymentDate: req.user.payments[0]?.createdAt || null // Extract date
      }
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}