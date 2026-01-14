"use client";

import React, { useState } from "react";
import { signUpUser, verifyUserOtp } from "@/lib/auth-actions";
import { User, School, GraduationCap, Calendar, Mail, ShieldCheck, CheckCircle } from "lucide-react";

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", email: "", role: "student", college: "", degree: "", year: "2024"
  });
  const [otp, setOtp] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signUpUser(formData);
    if (res.success) setStep(2);
    else alert(res.error);
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyUserOtp(formData.email, otp);
    if (res.success) setStep(3);
    else alert("Invalid OTP");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
        
        {step === 1 && (
          <form onSubmit={handleSignup} className="space-y-5">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-6">Create Account</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Input icon={<User size={18}/>} placeholder="Full Name" onChange={(v : any) => setFormData({...formData, fullName: v})} />
              <Input icon={<Mail size={18}/>} placeholder="Email" type="email" onChange={(v : any) => setFormData({...formData, email: v})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input icon={<School size={18}/>} placeholder="College Name" onChange={(v : any) => setFormData({...formData, college: v})} />
              <Input icon={<GraduationCap size={18}/>} placeholder="Degree (e.g. B.Tech)" onChange={(v: any) => setFormData({...formData, degree: v})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <select 
                className="w-full pl-5 pr-5 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 font-semibold text-gray-700"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
               >
                 <option value="student">Student</option>
                 <option value="admin">Admin</option>
               </select>
               <Input icon={<Calendar size={18}/>} placeholder="Graduation Year" type="number" onChange={(v : any) => setFormData({...formData, year: v})} />
            </div>

            <button disabled={loading} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
              {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="text-center space-y-6">
            <ShieldCheck size={50} className="mx-auto text-blue-600" />
            <h2 className="text-2xl font-black">Verify OTP</h2>
            <p className="text-gray-500">Sent to {formData.email}</p>
            <input 
              className="w-full text-center text-4xl tracking-widest py-4 bg-gray-50 rounded-2xl border-2 focus:border-blue-600 outline-none font-bold"
              maxLength={6} 
              onChange={(e) => setOtp(e.target.value)} 
            />
            <button className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-lg">VERIFY & ACTIVATE</button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-in zoom-in duration-300">
            <CheckCircle size={60} className="mx-auto text-green-500" />
            <h2 className="text-3xl font-black">Account Verified!</h2>
            <p className="text-gray-500">Welcome, {formData.fullName}. Your profile is now active.</p>
            <button onClick={() => window.location.href="/enrollment"} className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl">ENTER DASHBOARD</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Input Component
function Input({ icon, placeholder, type = "text", onChange }: any) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-5 text-gray-400">{icon}</div>
      <input 
        type={type} 
        placeholder={placeholder} 
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all font-semibold text-gray-800"
      />
    </div>
  );
}