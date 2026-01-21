// app/overview/page.tsx
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import OverviewClient from "./ClientComp";
import { redirect } from "next/navigation";

export default async function OverviewPage() {
  // 1. Identify the user from the session
  const user = await getCurrentUser();
  
  if (!user) return redirect("/login");

  // 2. Fetch real stats from the database
  const stats = await db.userStats.findUnique({
    where: { userId: user.id },
  });

  // 3. Fetch real courses from the database
  // We include 'category' to dynamically generate the 'tags' used in your UI
  const coursesDb = await db.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      category: true, // Assumes you have a Category relation
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6, // Limit to 6 recent courses
  });

  // 4. Transform DB data to match the UI component's expected shape
  const formattedCourses = coursesDb.map((course) => ({
    id: course.id,
    title: course.title,
    // Use description as subtitle, with fallback
    subtitle: course.description || "Start your learning journey today.",
    // Use imageUrl, with fallback
    image: course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    // Generate tags: specific category + "All" so the default filter works
    tags: course.category ? [course.category.name, "All"] : ["General", "All"],
  }));

  // 5. Pass everything to the client component
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <OverviewClient
        data={{
          stats: stats || { videoWatchedMins: 0, questionsSolved: 0 },
          user: user,
          courses: formattedCourses, // New real data
        }}
      />
    </div>
  );
}