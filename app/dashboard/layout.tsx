// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#fcfcfc] text-slate-900">
        <div className="flex h-screen overflow-hidden">
          {/* Persistent Sidebar */}
          <Sidebar />

          <div className="flex-1 flex flex-col relative overflow-y-auto">
            {/* Common Header */}
            <Header />

            {/* Main Content Area */}
            <main className="ml-64 mt-16">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}