import { getCurrentUser } from '@/lib/auth-utils';
import LearningClient from './LearningClient';
import { notFound } from "next/navigation";
import { BookmarkProvider } from '@/context/BookmarkContext';
import { CourseProvider, useCourse } from '@/context/CourseContext';
import { LectureProvider } from '@/context/LectureContext';

interface PageProps {
  params: Promise<{
    courseId: string;
    lectureId: string;
  }>;
}

async function Page({ params }: PageProps) {
  const { courseId , lectureId } = await params;
  const user = await getCurrentUser();
  return (
    <CourseProvider>
      <BookmarkProvider>
            <LearningClient 
              user={user}
              courseId={courseId}
              lectureId={lectureId}
            />
      </BookmarkProvider>
    </CourseProvider>
  );
}

export default Page;