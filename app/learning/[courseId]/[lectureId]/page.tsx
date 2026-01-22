import LearningClient from './LearningClient';
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    courseId: string;
    lectureId: string;
  }>;
}

async function Page({ params }: PageProps) {
  const { courseId, lectureId } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let course = null;

  try {
    const response = await fetch(`${baseUrl}/api/course/${courseId}`, {
      cache: 'no-store', 
    });

    if (!response.ok) {
      if (response.status === 404) return notFound();
      throw new Error("Failed to fetch course");
    }

    course = await response.json();
  } catch (error) {
    console.error("Error fetching course in Server Component:", error);
  }

  if (!course) {
    return <div>Error loading course details.</div>;
  }

  return (
    <div>
      {/* 4. Pass the fetched data to your Client Component */}
      <LearningClient 
        course={course} 
        lectureId={lectureId} 
      />
    </div>
  );
}

export default Page;