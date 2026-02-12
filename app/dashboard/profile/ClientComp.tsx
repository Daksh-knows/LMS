"use client";

import React, { useRef, useState } from "react";
import { LogOut, Camera, Loader2, X, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/Toast";
import Loader from "@/utils/Loader";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileClient({ initialData, hasPendingRefund }: { initialData: any, hasPendingRefund: boolean }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session, update } = useSession();

  const [avatarPreview, setAvatarPreview] = useState(initialData.image || null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    domain: initialData.domain,
    collegeName: initialData.collegeName,
    collegeDegree: initialData.collegeDegree,
    collegeYear: initialData.collegeYear,
    image: initialData.image,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return showToast.error("Image size must be less than 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, image: avatarPreview };
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Update failed");
      
      await update({
          ...session,
          user: { ...session?.user, name: formData.fullName, image: result.imageUrl }
      });

      showToast.success("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      showToast.error(err.message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundSubmit = async () => {
    if(!refundReason.trim()) return showToast.error("Please enter a reason");
    setIsSubmittingRefund(true);
    try {
      const res = await fetch("/api/premium/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason })
      });
      const data = await res.json();
      if(!data.success) throw new Error(data.error);
      showToast.success("Refund initiated");
      setIsRefundModalOpen(false);
      router.refresh(); 
    } catch (error: any) {
      showToast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-card-muted backdrop-blur-xl rounded-[2rem] shadow-xl border border-border-muted overflow-hidden transition-colors duration-500">
      
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-background/60 backdrop-blur-sm flex items-center justify-center"
          >
            <Loader message="Syncing Profile..." size="lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner & Avatar */}
      <div className="h-32 bg-gradient-to-r from-brand-blue/20 to-amber-500/10 relative">
        <div className="absolute -bottom-10 left-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-brand-blue flex items-center justify-center text-white text-3xl font-bold border-4 border-card shadow-2xl overflow-hidden transition-colors">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initialData.initials
              )}
            </div>
            
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} disabled={!isEditing} />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-foreground text-background rounded-full shadow-md border-2 border-card hover:scale-110 transition-all"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-14 pb-8 px-6 md:px-10">
        
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-border-muted mb-8 transition-colors">
          <button className="pb-3 border-b-2 border-brand-blue text-sm font-bold text-foreground">Profile Details</button>
        </div>

        {/* Refund Status Banner */}
        {hasPendingRefund && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3"
          >
             <div className="bg-amber-500/20 p-2 rounded-full text-amber-600">
                <Loader2 size={18} className="animate-spin" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-foreground">Refund In Progress</h3>
               <p className="text-xs text-foreground/60 mt-1">Our team will verify your eligibility within 7 days.</p>
             </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-lg font-bold text-foreground transition-colors">Account Details</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-brand-blue/10 text-brand-blue px-6 py-2 rounded-xl font-bold text-sm hover:bg-brand-blue/20 transition-all active:scale-95"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8 mb-12">
          <ProfileInput label="Full Name" value={formData.fullName} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, fullName: val})} subtext="Appears on certificates" />
          <ProfileInput label="Email Address" value={initialData.email} disabled={true} />
          <ProfileInput label="Current Domain" value={formData.domain} disabled={!isEditing} onChange={(val: string) => setFormData({...formData, domain: val})} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border-muted gap-4">
          <div className="flex flex-wrap justify-center gap-4">
             {!hasPendingRefund && (
               <button 
                 onClick={() => setIsRefundModalOpen(true)}
                 className="flex items-center gap-2 bg-foreground/5 text-foreground/60 px-4 py-2.5 rounded-xl font-semibold hover:bg-foreground/10 transition-all text-sm"
               >
                 <ShieldCheck size={16} /> Request Refund
               </button>
             )}
             <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 bg-red-500/10 text-red-500 px-6 py-2.5 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95">
               <LogOut size={18} /> Logout
             </button>
          </div>
          
          {isEditing && (
            <div className="flex gap-4">
               <button onClick={() => { setIsEditing(false); setFormData(initialData); }} className="px-6 py-2.5 rounded-xl font-bold text-foreground/40 hover:bg-foreground/5 transition-colors">Cancel</button>
               <button onClick={handleSave} disabled={loading} className="bg-brand-blue text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-blue/20 flex items-center gap-2 active:scale-95">
                 {loading && <Loader2 size={16} className="animate-spin" />} Save Changes
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      <AnimatePresence>
        {isRefundModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRefundModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="bg-card border border-border-muted rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative z-10"
             >
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-xl font-black text-foreground">Initiate Refund</h3>
                   <button onClick={() => setIsRefundModalOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors"><X size={20} className="text-foreground/40" /></button>
                </div>
                
                <div className="bg-brand-blue/10 p-4 rounded-xl mb-6">
                   <p className="text-xs text-brand-blue font-medium leading-relaxed">Verified within <span className="font-bold">7 business days</span>.</p>
                </div>

                <label className="block text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Reason</label>
                <textarea 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Tell us why..."
                  className="w-full bg-background border border-border-muted rounded-xl p-4 text-sm text-foreground focus:ring-2 focus:ring-brand-blue/20 min-h-[100px] mb-6 resize-none transition-all"
                />

                <div className="flex gap-3">
                   <button onClick={() => setIsRefundModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-foreground/40 hover:bg-foreground/5 transition-colors">Cancel</button>
                   <button onClick={handleRefundSubmit} disabled={isSubmittingRefund} className="flex-1 bg-foreground text-background py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2 transition-all">
                      {isSubmittingRefund && <Loader2 size={16} className="animate-spin" />} Confirm
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileInput({ label, value, subtext, type = "text", disabled = false, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-foreground/40 uppercase tracking-tight">{label}</label>
      <input 
        type={type} 
        value={value} 
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full border-b border-border-muted py-2 text-sm font-medium focus:outline-none focus:border-brand-blue transition-colors bg-transparent text-foreground disabled:text-foreground/30" 
      />
      {subtext && <p className="text-[10px] text-foreground/30 font-medium">✨ {subtext}</p>}
    </div>
  );
}