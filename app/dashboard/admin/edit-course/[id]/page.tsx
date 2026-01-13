import { getMyManagedCourses } from "@/lib/admin-actions";
import EditCourseForm from "@/components/EditCourseForm";
import { notFound } from "next/navigation";
import fs from 'fs/promises';
import path from 'path';

// Update the type definition to show params is a Promise
export default async function EditPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Await the params object to extract the id
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  // 2. Fetch the single user from user.json
  const usersPath = path.join(process.cwd(), 'data', 'user.json');
  const userData = await fs.readFile(usersPath, 'utf8');
  const parsedData = JSON.parse(userData);
  
  const user = Array.isArray(parsedData) ? parsedData[0] : parsedData;

  // Security check
  if (!user || user.role !== 'admin') {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-500">No admin account found in the system configuration.</p>
      </div>
    );
  }

  const adminId = user.id;

  // 3. Fetch courses for this user
  const courses = await getMyManagedCourses(adminId);
  
  // Debugging logs
  console.log("Admin ID:", adminId);
  console.log("Looking for Course ID:", courseId);

  // 4. Find the specific course by the AWAITED ID
  const courseToEdit = courses.find((c: any) => c.id === courseId);

  if (!courseToEdit) {
    console.log("Course not found in the list.");
    notFound(); 
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <EditCourseForm course={courseToEdit} adminId={adminId} />
      </div>
    </div>
  );
}