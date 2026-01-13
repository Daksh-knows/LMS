// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import fs from "fs";
import path from "path";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {



  // 1. Get the path to your user.json
  const filePath = path.join(process.cwd(), "data", "user.json");
  
  // 2. Read and parse the file
  const fileData = fs.readFileSync(filePath, "utf8");
  const userData = JSON.parse(fileData);

  const currentUser = Array.isArray(userData) ? userData[0] : userData;
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Persistent Sidebar */}
      <Sidebar user={currentUser} />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Common Header */}
        <Header />

        {/* Main Content Area */}
        <main className="ml-64 mt-16">{children}</main>
      </div>
    </div>
  );
}
