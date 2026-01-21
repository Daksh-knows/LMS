// app/dashboard/profile/page.tsx
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import ProfileClient from "./ClientComp";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/login");
  }

  // Fetch the user and their associated profile
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      profile: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  // Format data for the client component
  const profileData = {
    fullName: user.profile?.fullName || user.name || "",
    email: user.email,
    domain: user.profile?.domain || "",
    collegeName: user.profile?.collegeName || "",
    collegeDegree: user.profile?.collegeDegree || "",
    collegeYear: user.profile?.collegeYear || 1,
    initials: (user.profile?.fullName || user.name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };

  return (
    <div className="p-4 md:p-8">
      <ProfileClient initialData={profileData} />
    </div>
  );
}