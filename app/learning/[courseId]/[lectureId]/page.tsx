import { getCurrentUser } from '@/lib/auth-utils';
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
  const user = await getCurrentUser();
  let course = null;
  // console.log("User in Page component:", user);
  try {
    const response = await fetch(`${baseUrl}/api/course/${courseId}?userId=${user?.id}`, {
      cache: 'no-store', 
    });
    // console.log("Fetch response status:", response);
    if (!response.ok) {
      if (response.status === 404) return notFound();
      throw new Error("Failed to fetch course");
    }

    course = await response.json();
    console.log("Fetched course data:", course);
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
        user={user}
      />
    </div>
  );
}

export default Page;