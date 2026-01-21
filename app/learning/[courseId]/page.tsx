import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import LearningClient from "./LearningClient";
import { getCurrentUser } from "@/lib/auth-utils"; // Import your session helper
import { Lock, Crown, ArrowRight } from "lucide-react";

interface PageProps {
  params: {
    courseId: string;
  };
}

export default async function LearningPage({ params }: PageProps) {
  const { courseId } = await params;

  // 1. Get the authenticated user from the cookie
  const sessionUser = await getCurrentUser();

  // 2. Fetch Course and User DB details in parallel for performance
  const [course, userDb] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lectures: {
              orderBy: { position: "asc" },
              include: {
                resources: true,
                faqs: true,
                reviews: true,
                notes: true,
                userProgress: {
                  where: {
                    userId: sessionUser?.id // Only get progress for the logged-in user
                  }
                },
              },
            },
          },
        },
      },
    }),
    sessionUser
      ? db.user.findUnique({
          where: { id: sessionUser.id },
          include: { enrollments: { where: { courseId } } },
        })
      : null,
  ]);

  // 3. Handle standard 404 (Course doesn't exist)
  if (!course) {
    return notFound();
  }


  // 6. RENDER CLIENT ENVIRONMENT (Current functionality maintained)
  return <LearningClient course={course} />;
}
