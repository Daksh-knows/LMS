"use client";

import React, { useState } from "react";
import { LogOut, Camera, Loader2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Add hasPendingRefund prop
export default function ProfileClient({ initialData, hasPendingRefund }: { initialData: any, hasPendingRefund: boolean }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    domain: initialData.domain,
    collegeName: initialData.collegeName,
    collegeDegree: initialData.collegeDegree,
    collegeYear: initialData.collegeYear,
  });

  // ... (handleSave function remains the same) ...
  const handleSave = async () => {
    setLoading(true);
    const updatePromise = async () => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed");
      return result;
    };
    toast.promise(updatePromise(), {
      loading: "Saving...",
      success: () => {
        setIsEditing(false);
        setLoading(false);
        router.refresh();
        return "Updated! ✅";
      },
      error: (err) => {
        setLoading(false);
        return `Error: ${err.message}`;
      },
    });
  };

  const handleRefundSubmit = async () => {
    if(!refundReason.trim()) return toast.error("Please enter a reason");
    
    setIsSubmittingRefund(true);
    try {
      const res = await fetch("/api/premium/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason })
      });
      
      const data = await res.json();
      if(!data.success) throw new Error(data.error);
      
      toast.success("Refund request initiated successfully");
      setIsRefundModalOpen(false);
      router.refresh(); // This will update the parent and show the pending banner
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Banner & Avatar (Same as before) */}
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
        
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-gray-100 mb-8">
          <button className="pb-3 border-b-2 border-red-500 text-sm font-bold text-gray-800">Profile Details</button>
          {/* <button className="pb-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">My Purchases</button> */}
        </div>

        {/* --- REFUND STATUS BANNER --- */}
        {hasPendingRefund && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
             <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                <Loader2 size={18} className="animate-spin" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-amber-900">Refund In Progress</h3>
               <p className="text-xs text-amber-700 mt-1">
                 You have initiated a refund request. Our team will verify your eligibility within 7 days.
               </p>
             </div>
          </div>
        )}

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

        {/* Form Grid (Same as before) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileInput label="Full Name" value={formData.fullName} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, fullName: val})} subtext="This name will appear on your certificate." />
          <ProfileInput label="Email" value={initialData.email} disabled={true} />
          <ProfileInput label="Current Domain" value={formData.domain} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, domain: val})} />
        </div>

        {/* <h2 className="text-lg font-bold text-gray-800 mb-8">Academic Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileInput label="College Name" value={formData.collegeName} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, collegeName: val})} />
          <ProfileInput label="College Degree" value={formData.collegeDegree} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, collegeDegree: val})} />
          <ProfileInput label="Current Year" type="number" value={formData.collegeYear} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, collegeYear: val})} />
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-50">
          <div className="flex gap-4">
             

             {/* REFUND BUTTON - Only show if NO pending refund */}
             {!hasPendingRefund && (
               <button 
                 onClick={() => setIsRefundModalOpen(true)}
                 className="flex items-center gap-2 bg-blue-500 text-black-400 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-600 transition-all text-sm"
               >
                 <ShieldCheck size={16} /> Request Refund
               </button>
             )}
             <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 bg-[#c66a6a] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b05a5a] transition-all">
               <LogOut size={18} /> Logout
             </button>
          </div>
          
          {isEditing && (
            <div className="flex gap-4">
               <button onClick={() => { setIsEditing(false); setFormData(initialData); }} className="px-6 py-2.5 rounded-xl font-bold text-gray-400 hover:bg-gray-50">Cancel</button>
               <button onClick={handleSave} disabled={loading} className="bg-[#ef4444] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200 flex items-center gap-2">
                 {loading && <Loader2 size={16} className="animate-spin" />} Save Changes
               </button>
            </div>
          )}
        </div>
      </div>

      {/* --- REFUND MODAL --- */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-xl font-black text-gray-900">Initiate Refund</h3>
                 <button onClick={() => setIsRefundModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                 <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Refund requests are manually reviewed by our admin team. Once initiated, the process is guaranteed to start within <span className="font-bold">7 days</span>.
                 </p>
              </div>

              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Refund</label>
              <textarea 
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Briefly describe why you are requesting a refund..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[100px] mb-6 resize-none"
              />

              <div className="flex gap-3">
                 <button onClick={() => setIsRefundModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                 <button 
                   onClick={handleRefundSubmit} 
                   disabled={isSubmittingRefund}
                   className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-70 flex justify-center items-center gap-2"
                 >
                    {isSubmittingRefund && <Loader2 size={16} className="animate-spin" />}
                    Confirm Request
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

// ... ProfileInput helper remains same ...
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