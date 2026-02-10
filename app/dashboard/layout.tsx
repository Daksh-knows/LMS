import { getCurrentUser } from "@/lib/auth-utils"; // Import our new helper
import LayoutShell from "./layoutShell";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  
  // Serialize user to remove Date objects
  const serializedUser = currentUser ? JSON.parse(JSON.stringify(currentUser)) : null;

  return (
    <div>
      <LayoutShell user={serializedUser}>
        {children}
      </LayoutShell>
    </div>
  );
}




