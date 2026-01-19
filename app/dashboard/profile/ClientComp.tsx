"use client";

import React, { useState } from "react";
import { LogOut, Camera, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { updateProfile } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";

export default function ProfileClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Track form state
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    domain: initialData.domain,
    collegeName: initialData.collegeName,
    collegeDegree: initialData.collegeDegree,
    collegeYear: initialData.collegeYear,
  });

  const handleSave = async () => {
    setLoading(true);
    const res = await updateProfile(formData);
    if (res.success) {
      setIsEditing(false);
      router.refresh(); // Refresh to update server-side initials and data
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Banner & Avatar */}
      <div className="h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100 relative">
        <div className="absolute -bottom-10 left-10">
          <div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
            {initialData.initials}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100">
            <Camera size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="pt-14 pb-8 px-10">
        <div className="flex gap-8 border-b border-gray-100 mb-8">
          <button className="pb-3 border-b-2 border-red-500 text-sm font-bold text-gray-800">Profile Details</button>
          <button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">My Purchases</button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-gray-800">Update your account details here</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-[#e57373]/10 text-[#d32f2f] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#e57373]/20 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileInput 
            label="Full Name" 
            value={formData.fullName} 
            disabled={!isEditing} 
            onChange={(val: string) => setFormData({...formData, fullName: val})}
            subtext="This name will appear on your certificate." 
          />
          <ProfileInput 
            label="Email" 
            value={initialData.email} 
            disabled={true} 
          />
          <ProfileInput 
            label="Current Domain" 
            value={formData.domain} 
            disabled={!isEditing}
            onChange={(val: string) => setFormData({...formData, domain: val})} 
          />
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-8">Academic Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileInput 
            label="College Name" 
            value={formData.collegeName} 
            disabled={!isEditing}
            onChange={(val: string) => setFormData({...formData, collegeName: val})} 
          />
          <ProfileInput 
            label="College Degree" 
            value={formData.collegeDegree} 
            disabled={!isEditing}
            onChange={(val: string) => setFormData({...formData, collegeDegree: val})} 
          />
          <ProfileInput 
            label="Current Year" 
            type="number"
            value={formData.collegeYear} 
            disabled={!isEditing}
            onChange={(val: string) => setFormData({...formData, collegeYear: val})} 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-50">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-[#c66a6a] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b05a5a] transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
          
          {isEditing && (
            <div className="flex gap-4">
               <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData(initialData); // Reset
                }} 
                className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-[#ef4444] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 flex items-center gap-2"
               >
                 {loading && <Loader2 size={16} className="animate-spin" />}
                 Save Changes
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileInput({ label, value, subtext, type = "text", disabled = false, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-400">{label}</label>
      <input 
        type={type} 
        value={value} 
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full border-b border-gray-200 py-2 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-transparent disabled:text-gray-400" 
      />
      {subtext && <p className="text-[10px] text-gray-400">📇 {subtext}</p>}
    </div>
  );
}