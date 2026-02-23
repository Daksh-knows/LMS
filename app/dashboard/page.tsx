import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import OverviewClient from "./ClientComp";
import { redirect } from "next/navigation";

export default async function OverviewPage() {
  const user = await getCurrentUser();
  
  if (!user) return redirect("/login");

  const [stats, coursesDb] = await Promise.all([
    db.userStats.findUnique({
      where: { userId: user.id },
    }),
    db.course.findMany({
      where: {
        isPublished: true,
      },
      include: {
        category: true,
        _count: {
          select: {
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),
  ]);
  const formattedCourses = coursesDb.map((course) => ({
    id: course.id,
    title: course.title,
    modules: course._count.modules,
    // Use description as subtitle, with fallback
    subtitle: course.description || "Start your learning journey today.",
    // Use imageUrl, with fallback
    image: course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    // Generate tags: specific category + "All" so the default filter works
    tags: course.category ? [course.category.name, "All"] : ["General", "All"],
  }));

  // 5. Pass everything to the client component
  return (
    <div className="min-h-screen bg-transparent">
      <OverviewClient />
    </div>
  );
}