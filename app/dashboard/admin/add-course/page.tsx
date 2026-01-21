import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AddCoursePageClient from "./ClientComp";
import { addCourse } from "@/lib/admin-actions";

export default async function AddCoursePage() {
  const session = await auth();

  // Protect the route
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "admin")) {
    redirect("/dashboard");
  }

  return (
    <AddCoursePageClient addCourseAction={addCourse} />
  );
}