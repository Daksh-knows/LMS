"use client";

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addModule } from "@/lib/admin-actions";

export default function AddModuleForm({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    try {
      // Logic: Calls the action to update both courses.json and courseData.json
      const result = await addModule(courseId, title);

      if (result.success) {
        setTitle(""); // Clear input on success
        alert("Module added successfully!");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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