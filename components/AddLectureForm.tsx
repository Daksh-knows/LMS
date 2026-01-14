"use client";

import React, { useState } from "react";
import { addLecture } from "@/lib/admin-actions";
import { Loader2, Clock, Link2, Type } from "lucide-react";

export default function AddLectureForm({ courseId, sectionId, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", videoUrl: "", duration: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await addLecture(
      courseId, 
      sectionId, 
      formData.title, 
      formData.videoUrl, 
      formData.duration
    );
    
    if (result.success) {
      onSuccess();
    } else {
      alert("Error adding lecture");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lecture Title</label>
        <div className="relative">
          <input 
            required
            placeholder="e.g. 1. Intro to Closures"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pl-12"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration</label>
          <div className="relative">
            <input 
              required
              placeholder="15min"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pl-12"
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Video Link</label>
          <div className="relative">
            <input 
              required
              type="url"
              placeholder="Embed URL"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none pl-12"
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            />
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          </div>
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Save Lecture Content"}
      </button>
    </form>
  );
}