import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { 
  getCourseAnalyticsOverview, 
  getCourseEnrollmentHistory, 
  getLecturePerformance 
} from "@/actions/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const [overview, enrollmentHistory, lecturePerformance] = await Promise.all([
      getCourseAnalyticsOverview(courseId),
      getCourseEnrollmentHistory(courseId),
      getLecturePerformance(courseId)
    ]);

    return NextResponse.json({
      overview,
      enrollmentHistory,
      lecturePerformance
    });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
