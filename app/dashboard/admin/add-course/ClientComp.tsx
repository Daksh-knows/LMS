"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom"; 
import Link from "next/link";

interface Props {
  user: any;
}

export default function AddCoursePageClient({  user }: Props) {
  const router = useRouter();

  async function handleFormAction(formData: FormData) {
    // 1. Prepare the data payload
    const payload = {
      title: formData.get("title") as string,
      subtitle: formData.get("description") as string, // Ensure this matches API expectation
      image: formData.get("imageUrl") as string,
      adminId: user.id,
      tags: [], // Add tags if your form has them, otherwise send empty
    };

    try {
      // 2. Call the API endpoint
      // Ensure 'adminId' is available in your component's scope (props or session)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // 3. Handle success or error
      if (response.ok && result.success) {
        router.push("/dashboard/admin");
        router.refresh();
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to create course");
    }
}
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Course</h1>
        </div>

        <form action={handleFormAction} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Course Title</label>
                <input required name="title" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Next.js Mastery" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Short Description</label>
                <input required name="description" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Briefly describe the course" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Cover Image URL</label>
              <input required name="imageUrl" className="w-full p-4 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://images.unsplash.com/..." />
            </div>
          </div>

          <div className="bg-gray-50 p-8 flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full md:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-gray-300 shadow-lg"
    >
      {pending ? "Creating..." : <><Save size={20} /> Create Course</>}
    </button>
  );
}