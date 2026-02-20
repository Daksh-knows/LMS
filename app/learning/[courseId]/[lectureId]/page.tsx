import { getCurrentUser } from '@/lib/auth-utils';
import LearningClient from './LearningClient';
import { notFound } from "next/navigation";
import { BookmarkProvider } from '@/context/BookmarkContext';

interface PageProps {
  params: Promise<{
    courseId: string;
    lectureId: string;
  }>;
}

async function Page({ params }: PageProps) {
  const { courseId, lectureId } = await params;
  const user = await getCurrentUser();

  return (
    <div>
      <BookmarkProvider>
        <LearningClient 
          lectureId={lectureId} 
          user={user}
          courseId={courseId}
        />
      </BookmarkProvider>
    </div>
  );
}

export default Page;