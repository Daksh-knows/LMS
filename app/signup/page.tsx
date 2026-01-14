"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUpUser, verifyUserOtp } from "@/lib/auth-actions";
import { Mail, ShieldCheck, CheckCircle, ArrowRight, Lock } from "lucide-react";

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "", 
    password: "", 
    confirmPassword: ""
  });
  const [otp, setOtp] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    // Passing the simplified formData to your action
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
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-gray-100">
        
        {step === 1 && (
          <div className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-5">
              <h2 className="text-3xl font-black text-gray-900 text-center mb-6 tracking-tight">Create Account</h2>
              
              <div className="space-y-4">
                <Input 
                  icon={<Mail size={18}/>} 
                  placeholder="Email Address" 
                  type="email" 
                  onChange={(v : any) => setFormData({...formData, email: v})} 
                />
                
                <Input 
                  icon={<Lock size={18}/>} 
                  placeholder="Password" 
                  type="password" 
                  onChange={(v : any) => setFormData({...formData, password: v})} 
                />
                
                <Input 
                  icon={<Lock size={18}/>} 
                  placeholder="Confirm Password" 
                  type="password" 
                  onChange={(v : any) => setFormData({...formData, confirmPassword: v})} 
                />
              </div>

              <button 
                disabled={loading} 
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "CREATING ACCOUNT..." : (
                  <>
                    SIGN UP <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-50 text-center">
              <p className="text-gray-500 font-medium text-sm">
                Already have an account?{" "}
                <Link 
                  href="/signin" 
                  className="text-blue-600 font-black hover:text-blue-700 underline underline-offset-4 decoration-2"
                >
                  SIGN IN
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="text-center space-y-6">
            <ShieldCheck size={50} className="mx-auto text-blue-600" />
            <h2 className="text-2xl font-black text-gray-900">Verify OTP</h2>
            <p className="text-gray-500 text-sm">Sent to <span className="text-gray-900 font-bold">{formData.email}</span></p>
            <input 
              className="w-full text-center text-4xl tracking-widest py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-blue-600 outline-none font-bold transition-all text-gray-900"
              maxLength={6} 
              autoFocus
              onChange={(e) => setOtp(e.target.value)} 
            />
            <button className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-lg hover:bg-green-700 transition-all active:scale-95">VERIFY & ACTIVATE</button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-in zoom-in duration-300">
            <CheckCircle size={60} className="mx-auto text-green-500" />
            <h2 className="text-3xl font-black text-gray-900">Success!</h2>
            <p className="text-gray-500">Your account is now active.</p>
            <button 
              onClick={() => window.location.href="/enrollment"} 
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl"
            >
              PROCEED TO ENROLLMENT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({ icon, placeholder, type = "text", onChange }: any) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-5 text-gray-400">{icon}</div>
      <input 
        type={type} 
        placeholder={placeholder} 
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-600 transition-all font-semibold text-gray-800 placeholder:text-gray-400"
      />
    </div>
  );
}