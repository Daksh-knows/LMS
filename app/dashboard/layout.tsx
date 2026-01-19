// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth-utils"; // Import our new helper

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the real user from the cookie
  const currentUser = await getCurrentUser();

  const patternStyle = {
    backgroundColor: "#F3F1F6",
    backgroundImage: `url("data:image/svg+xml,...")`,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 2. Sidebar now receives user data from the cookie session */}
      <Sidebar user={currentUser} />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <Header user={currentUser}/>
        <main
          className="ml-64 mt-16 min-h-[calc(100vh-64px)] p-8"
          style={patternStyle}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
