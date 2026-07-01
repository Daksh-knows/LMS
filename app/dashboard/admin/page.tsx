import AdminCourseList from "@/components/admin/AdminCourseList";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/signin");
  }

  if (user.role !== "ADMIN" && user.role !== "admin") {
    return redirect("/dashboard");
  }

  return (
      <div className="p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-(--text-color) theme-transition">Admin Dashboard</h1>
            <p className="text-(--text-color) opacity-80 text-sm theme-transition">
              Managing courses for <span className="font-semibold text-(--text-color)">{user.name || user.email}</span>
            </p>
          </div>
        </header>

        {/* 4. Pass the real courses and admin ID to the list component */}
        <AdminCourseList 
          adminId={user.id} 
        />
      </div>
    );
}