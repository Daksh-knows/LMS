import { db } from "@/lib/db"; // Ensure this path matches where you created db.ts
import { notFound } from "next/navigation";
import LearningClient from "./LearningClient";

interface PageProps {
  params: {
    courseId: string;
  };
}

export default async function LearningPage({ params }: PageProps) {
  const { courseId } = await params;
  console.log("Fetching course with ID:", courseId);
  // 1. FETCH DATA directly from DB
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      // Include Modules (Sections)
      modules: {
        orderBy: {
          position: "asc", // Sort modules by position (1, 2, 3...)
        },
        include: {
          // Include Lectures inside Modules
          lectures: {
            orderBy: {
              position: "asc", // Sort lectures by position
            },
            include: {
              resources: true,
              faqs: true,
              reviews: true,
            },
          },
        },
      },
    },
  });

  // 2. HANDLE 404
  if (!course) {
    return notFound();
  }

  // 3. Render the Client Component with the fetched data
  return <LearningClient course={course} />;
}
