import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import EditCourseForm from "@/components/EditCourseForm";
import { notFound, redirect } from "next/navigation";

export default async function EditPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. Await params (Next.js 15 requirement)
  const { id } = await params;

  // 2. Get authenticated user from session cookie
  const user = await getCurrentUser();

  // 3. Security Check: Only Admins allowed
  if (!user || (user.role !== "ADMIN" && user.role !== "admin")) {
    redirect("/dashboard");
  }

  // 4. Fetch the specific course from Database
  // We include 'category' to map it to 'tags', and '_count' for modules
  const course = await db.course.findUnique({
    where: { id },
    include: {
      category: true,
      _count: {
        select: { modules: true }
      }
    }
  });

  // 5. Handle Not Found
  if (!course) {
    return notFound();
  }

  // 6. Ownership Check: Ensure this admin owns the course
  if (course.adminId !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to edit this course.</p>
        </div>
      </div>
    );
  }

  // 7. Transform DB data to match Client Component props
  // Mapping: description -> subtitle, imageUrl -> image, category -> tags
  const formattedCourse = {
    id: course.id,
    title: course.title,
    subtitle: course.description || "", 
    image: course.imageUrl || "",
    // If a category exists, put it in the tags array, otherwise empty
    tags: course.category ? [course.category.name] : [],
    totalModules: course._count.modules
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <EditCourseForm course={formattedCourse} adminId={user.id} />
      </div>
    </div>
  );
}