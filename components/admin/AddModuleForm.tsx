"use client";

import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";
import { showToast } from "@/utils/Toast";

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

    try{
      toast.loading("Creating module...");
      await addModulePromise();
      toast.dismiss();
      setTitle(""); // Clear the input
      refreshData();
      setLoading(false);
      showToast.success("Module added successfully! 📂");
    }catch(err: any){
      toast.dismiss();
      setLoading(false);
      showToast.error(err.message || "Failed to add module.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., 3. Introduction to Middleware"
          required
          className="input-field pr-12 placeholder:text-current placeholder:opacity-40" 
          // 'placeholder:text-current' ensures the placeholder adapts to dark mode text color automatically
        />
        
        {/* Icon: Uses opacity for perfect contrast in both themes */}
        <div 
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity group-focus-within:opacity-100"
          style={{ color: 'var(--color-foreground)', opacity: 0.3 }}
        >
          <Plus size={20} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 min-w-[160px] shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        style={{ 
          backgroundColor: 'var(--color-brand-blue)', 
          color: 'var(--color-brand-contrast)',
          boxShadow: '0 8px 20px -6px var(--color-brand-muted)' // Colored glow effect
        }}
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