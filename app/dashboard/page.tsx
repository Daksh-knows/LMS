// app/overview/page.tsx
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import OverviewClient from "./ClientComp";
import { notFound } from "next/navigation";

export default async function OverviewPage() {
  // 1. Identify the user from the session cookie
  const user = await getCurrentUser();
  
  if (!user) return notFound();

  // 2. Fetch real stats from the database
  const stats = await db.userStats.findUnique({
    where: { userId: user.id },
  });

  // 3. Pass real DB data to the client component
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <OverviewClient
        data={{
          stats: stats || { videoWatchedMins: 0, questionsSolved: 0 },
          user: user,
        }}
      />
    </div>
  );
}
