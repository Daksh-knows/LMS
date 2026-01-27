"use client";

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";

export default function AddModuleForm({ courseId, refreshData}: { courseId: string, refreshData: () => void}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
  
    e.preventDefault();
    console.log("Section Title to submit:", title);
    if (!title.trim()) return;
    console.log("Submitting new module with title:", title);
    
    setLoading(true);
    
    const addModulePromise = async () => {
      const user = await getSession();
      const adminId = user?.user?.id;
      if (!adminId) {
        throw new Error("Unauthorized: Admin ID required");
      }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      const response = await fetch(`${baseUrl}/api/course/${courseId}/module?adminId=${adminId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionTitle: title }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create module");
      }

      return result;
    };

    toast.promise(addModulePromise(), {
      loading: "Creating module...",
      success: () => {
        setTitle(""); // Clear the input
        refreshData();       // Refresh the curriculum list in the parent page
        setLoading(false);
        return "Module added successfully! 📂";
      },
      error: (err) => {
        setLoading(false);
        return `Error: ${err.message}`;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., 3. Introduction to Middleware"
          required
          className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
          <Plus size={20} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 min-w-[160px]"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          "Add Module"
        )}
      </button>
    </form>
  );
}