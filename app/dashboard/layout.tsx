// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth-utils"; // Import our new helper
import LayoutShell from "./layoutShell";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  
  const patternStyle = {
    backgroundColor: "#F3F1F6",
    backgroundImage: `url("data:image/svg+xml,...")`,
  }; 
  
  return (
      <body>
        <LayoutShell user={currentUser} patternStyle={patternStyle}>
          {children}
        </LayoutShell>
      </body>
  );
}




