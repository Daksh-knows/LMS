import { getMyManagedCourses } from "@/lib/admin-actions";
import AdminCourseList from "@/components/AdminCourseList";
import fs from 'fs/promises';
import path from 'path';
import { log } from "console";
import { getCurrentUser } from "@/lib/auth-utils";
import { notFound, redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  
  const usersPath = path.join(process.cwd(), 'data', 'user.json');
  const user = JSON.parse(await fs.readFile(usersPath, 'utf8'));
  log("Reading users :", user);
  const token = await getCurrentUser() ;
  console.log("Current User Token:", token);
  if(token && token?.role === "student") return redirect('/dashboard');
  // Let's pick 'user_02' (Dr. Sarah) for testing
  const testAdminId = user.id; 

  try {
    const myCourses = await getMyManagedCourses(testAdminId);
    // log(myCourses);
    return (
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Currently managing as {testAdminId}</p>
        </header>

        <AdminCourseList 
          initialCourses={myCourses} 
          adminId={testAdminId} 
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-red-500 font-bold">Unauthorized</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }
}