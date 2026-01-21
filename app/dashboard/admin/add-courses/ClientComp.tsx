"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom"; 
import Link from "next/link";

interface Props {
  addCourseAction: (formData: any) => Promise<{ success: boolean; error?: string }>;
}

export default function AddCoursePageClient({ addCourseAction }: Props) {
  const router = useRouter();

  // This internal function handles the result AFTER the action is done
  async function handleFormAction(formData: FormData) {
    const courseData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
    };

    const result = await addCourseAction(courseData);
    
    if (result.success) {
      router.push("/dashboard/admin");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-gray-500 mb-8">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Use the 'action' prop instead of onSubmit */}
        <form action={handleFormAction} className="bg-white rounded-3xl border shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Course Title</label>
                <input required name="title" className="w-full p-4 bg-gray-50 border ring-1 ring-gray-200 rounded-2xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <input required name="description" className="w-full p-4 bg-gray-50 border ring-1 ring-gray-200 rounded-2xl outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Cover Image URL</label>
              <input required name="imageUrl" className="w-full p-4 bg-gray-50 border ring-1 ring-gray-200 rounded-2xl outline-none" />
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

// Separate component to use the useFormStatus hook
function SubmitButton() {
  const { pending } = useFormStatus(); // Automatically detects if the parent form is "awaiting"
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 disabled:bg-gray-300"
    >
      {pending ? "Creating..." : <><Save size={20} /> Create Course</>}
    </button>
  );
}