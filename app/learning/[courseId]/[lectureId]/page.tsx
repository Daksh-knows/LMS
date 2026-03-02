import { getCurrentUser } from '@/lib/auth-utils';
import LearningClient from './LearningClient';

interface PageProps {
  params: Promise<{
    courseId: string;
    lectureId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { courseId , lectureId } = await params;
  const user = await getCurrentUser();
  
  return (
    <LearningClient 
      user={user}
      courseId={courseId}
      lectureId={lectureId}
    />
  );
}