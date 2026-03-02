import { getCurrentUser } from '@/lib/auth-utils';
import { BookmarkProvider } from '@/context/BookmarkContext';
import { CourseProvider } from '@/context/CourseContext';
import CourseLayoutClient from './CourseLayoutClient';

export default async function Layout({ 
  children, 
  params 
}: { 
  children: React.ReactNode, 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  return (
    <CourseProvider>
      <BookmarkProvider>
        <CourseLayoutClient courseId={courseId} user={user}>
          {children}
        </CourseLayoutClient>
      </BookmarkProvider>
    </CourseProvider>
  );
}