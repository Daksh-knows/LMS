"use client";

import React, { useState } from "react";
import { LogOut, Camera } from "lucide-react";

export default function ProfileClient({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-5xl mx-auto  bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Banner & Avatar */}
      <div className="h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100 relative">
        <div className="absolute -bottom-10 left-10 relative">
          <div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md">
            {initialData.initials}
          </div>
          <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100">
            <Camera size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="pt-14 pb-8 px-10">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-100 mb-8">
          <button className="pb-3 border-b-2 border-red-500 text-sm font-bold text-gray-800">Profile Details</button>
          <button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">My Purchases</button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-bold text-gray-800">Update your skills account details here</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-[#e57373]/10 text-[#d32f2f] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#e57373]/20 transition-all"
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileInput label="Full Name" value={initialData.fullName} subtext="This name will appear on your certificate." />
          <ProfileSelect label="Gender" value={initialData.gender} />
          <ProfileInput label="Email" value={initialData.email} disabled />
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">Contact Number</label>
            <div className="flex items-center gap-2 border-b border-gray-200 py-2">
              <span className="text-sm font-bold text-gray-400">IN ▼ +91</span>
              <input type="text" defaultValue={initialData.contactNumber} className="bg-transparent text-sm font-medium focus:outline-none w-full" />
            </div>
          </div>

          <ProfileSelect label="State" value={initialData.state} />
          <ProfileSelect label="City" value={initialData.city} />
          <ProfileInput label="Pincode" value={initialData.pincode} />
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-8">Update your course preference here</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileSelect label="Your Background" value={initialData.background} />
          <ProfileSelect label="Course Interest" value={initialData.courseInterest} />
          <ProfileSelect label="Your Domain" value={initialData.domain} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-50">
          <button className="flex items-center gap-2 bg-[#c66a6a] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b05a5a] transition-all">
            <LogOut size={18} />
            Logout
          </button>
          
          {isEditing && (
            <div className="flex gap-4">
               <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-50">Cancel</button>
               <button className="bg-[#ef4444] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200">Save</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ProfileInput({ label, value, subtext, disabled = false }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-400">{label}</label>
      <input 
        type="text" 
        defaultValue={value} 
        disabled={disabled}
        className="w-full border-b border-gray-200 py-2 text-sm font-medium focus:outline-none focus:border-red-400 transition-colors bg-transparent" 
      />
      {subtext && <p className="text-[10px] text-gray-400">📇 {subtext}</p>}
    </div>
  );
}

function ProfileSelect({ label, value }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-400">{label}</label>
      <div className="flex justify-between items-center border-b border-gray-200 py-2 cursor-pointer hover:border-red-400 transition-colors">
        <span className="text-sm font-medium text-gray-800">{value}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </div>
    </div>
  );
}