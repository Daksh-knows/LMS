import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import ProfileClient from "./ClientComp";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      profile: true,
      // Include refund requests to check status
      refundRequests: {
        where: { status: "PENDING" }, // We only care about active pending ones
      },
    },
  });

  if (!user) redirect("/signin");

  const profileData = {
    fullName: user.profile?.fullName || user.name || "",
    email: user.email,
    domain: user.profile?.domain || "",
    collegeName: user.profile?.collegeName || "",
    collegeDegree: user.profile?.collegeDegree || "",
    collegeYear: user.profile?.collegeYear || 1,
    initials: (user.profile?.fullName || user.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    image: user.image || "",
  };

  // Check if there is ANY pending request
  const hasPendingRefund = user.refundRequests.length > 0;

  return (
    <div className="p-4 md:p-8">
      {/* Pass the status to the client */}
      <ProfileClient initialData={profileData} hasPendingRefund={hasPendingRefund} />
    </div>
  );
}