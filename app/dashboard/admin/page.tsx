// import { getMyManagedCourses } from "@/lib/admin-actions";
import AdminCourseList from "@/components/admin/AdminCourseList";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  // 1. Get the authenticated user from NextAuth session
  const user = await getCurrentUser();
  // console.log("Authenticated User:", user);
  // 2. Security: Redirect if not logged in or if the user is a student
  if (!user) {
    return redirect("/signin");
  }

  if (user.role !== "ADMIN" && user.role !== "admin") {
    return redirect("/dashboard");
  }

  try {
    // 3. Fetch courses from the database that belong to this admin
    // We pass the real user ID from the session, not a hardcoded test ID.
    const baseurl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseurl}/api/course?adminId=${user.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 2. Check if the request was successful
    if (!response.ok) {
      throw new Error("Failed to fetch managed courses");
    }
    const myCourses = await response.json();

    return (
      <div className="p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Managing courses for <span className="font-semibold">{user.name || user.email}</span>
            </p>
          </div>
        </header>

        {/* 4. Pass the real courses and admin ID to the list component */}
        <AdminCourseList 
          initialCourses={myCourses} 
          adminId={user.id} 
        />
      </div>
    );
  } catch (error) {
    console.error("Dashboard Load Error:", error);
    return (
      <div className="p-20 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block">
          <h2 className="font-bold text-lg">Failed to Load Dashboard</h2>
          <p className="text-sm">Please ensure your database connection is active.</p>
        </div>
      </div>
    );
  }
}