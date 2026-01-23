import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AddCoursePageClient from "./ClientComp";

export default async function AddCoursePage() {
  const session = await auth();

  // Protect the route
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "admin")) {
    redirect("/dashboard");
  }

  return (
    <AddCoursePageClient  user={session.user} />
  );
}