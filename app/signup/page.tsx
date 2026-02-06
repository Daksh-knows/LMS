"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { 
  Mail, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  Lock, 
  Loader2, 
  User, 
  Github, 
  EyeOff,
  Eye
} from "lucide-react";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState<string | boolean>(false);
  
  const [formData, setFormData] = useState({
    email: "", 
    password: "", 
    confirmPassword: "",
    fullName: ""
  });
  const [otp, setOtp] = useState("");

  // --- HANDLERS ---

  const handleSocialSignup = (provider: "google" | "github") => {
    setLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading("email");

    // 1. Define the signup logic
    const signupPromise = async () => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Signup failed");
      }
      return data;
    };

    // 2. Execute with Toast
    // toast.promise(signupPromise(), {
    //   loading: "Creating account & sending OTP...",
    //   success: () => {
    //     setStep(2); // Move to OTP input screen
    //     setLoading(false);
    //     return "Account created! Check your inbox. 📧";
    //   },
    //   error: (err) => {
    //     setLoading(false);
    //     return err.message;
    //   },
    // });
    try{
      toast.loading("Creating account & sending OTP...");
      await signupPromise();
      toast.dismiss();
      setStep(2); // Move to OTP input screen
      setLoading(false);
      showToast.success("Account created! Check your inbox. 📧");
    }catch(err: any){
      toast.dismiss();
      setLoading(false);
      showToast.error(err.message || "Signup failed.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("verify");

    // 1. Define the verification logic
    const verifyPromise = async () => {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          otp 
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid OTP");
      }
      return data;
    };

    // 2. Execute with Toast
    // toast.promise(verifyPromise(), {
    //   loading: "Verifying code...",
    //   success: () => {
    //     setStep(3); // Move to "Success/Login" screen
    //     setLoading(false);
    //     return "Email verified successfully! ✅";
    //   },
    //   error: (err) => {
    //     setLoading(false);
    //     return err.message; // e.g., "OTP Expired" or "Invalid OTP"
    //   },
    // });
    try{
      toast.loading("Verifying code...");
      await verifyPromise();
      toast.dismiss();
      setStep(3); // Move to "Success/Login" screen
      setLoading(false);
      showToast.success("Email verified successfully! ✅");
    }catch(err: any){
      toast.dismiss();
      setLoading(false);
      showToast.error(err.message || "Failed to verify OTP.");
    }
  };

  const handleAutoLogin = async () => {
    setLoading("autologin");
    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (res?.error) {
      alert("Verification successful, but login failed. Please log in manually.");
      router.push("/signin");
    } else {
      router.push("/enrollment");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start md:justify-center p-6 relative overflow-y-auto">
      
      <div className="max-w-md w-full">
        
        {/* Header - Changes based on step */}
        <div className="text-center ">
          {step === 1 && (
             <>
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
                    <User className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-slate-500 mt-2 font-medium">Join us and start learning today</p>
             </>
          )}
          {step === 2 && (
             <>
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100">
                    <ShieldCheck className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Verify Email</h1>
                <p className="text-slate-500 mt-2 font-medium">We sent a code to <span className="text-slate-900 font-bold">{formData.email}</span></p>
             </>
          )}
          {step === 3 && (
             <>
                <div className="bg-green-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-100">
                    <CheckCircle className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome!</h1>
                <p className="text-slate-500 mt-2 font-medium">Your account has been verified.</p>
             </>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          
          {/* --- STEP 1: REGISTRATION FORM --- */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleEmailSignup} className="space-y-4">
                
                <Input 
                  label="Full Name"
                  icon={<User className="w-5 h-5" />} 
                  placeholder="John Doe" 
                  type="text" 
                  disabled={!!loading}
                  onChange={(v : any) => setFormData({...formData, fullName: v})} 
                />

                <Input 
                  label="Email Address"
                  icon={<Mail className="w-5 h-5" />} 
                  placeholder="name@example.com" 
                  type="email" 
                  disabled={!!loading}
                  onChange={(v : any) => setFormData({...formData, email: v})} 
                />
                
                <Input 
                  label="Password"
                  icon={<Lock className="w-5 h-5" />} 
                  placeholder="Create a password" 
                  type="password" 
                  disabled={!!loading}
                  onChange={(v : any) => setFormData({...formData, password: v})} 
                />
                
                <Input 
                  label="Confirm Password"
                  icon={<Lock className="w-5 h-5" />} 
                  placeholder="Repeat password" 
                  type="password" 
                  disabled={!!loading}
                  onChange={(v : any) => setFormData({...formData, confirmPassword: v})} 
                />

                <button 
                  type="submit"
                  disabled={!!loading} 
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-6"
                >
                  {loading === "email" ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span>Creating...</span>
                    </div>
                  ) : (
                    <>
                      Sign Up with Email <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400 font-bold">Or join with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialSignup("google")}
                  disabled={!!loading}
                  className="flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all font-bold text-slate-600 text-sm disabled:opacity-50"
                >
                  {loading === "google" ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignup("github")}
                  disabled={!!loading}
                  className="flex items-center justify-center gap-3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all font-bold text-slate-600 text-sm disabled:opacity-50"
                >
                  {loading === "github" ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <Github className="w-5 h-5" />
                      GitHub
                    </>
                  )}
                </button>
              </div>

              <div className="pt-8 border-t border-slate-50 text-center">
                <p className="text-slate-500 text-sm font-medium">
                  Already have an account?{' '}
                  <Link 
                    href="/signin" 
                    className="text-blue-600 font-bold hover:text-blue-700 transition-colors underline decoration-2 underline-offset-4"
                  >
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* --- STEP 2: OTP VERIFICATION --- */}
          {step === 2 && (
            <div className="animate-in fade-in zoom-in duration-300">
              <form onSubmit={handleVerify} className="text-center space-y-6">
                
                <input 
                  className="w-full text-center text-4xl tracking-[0.5em] py-5 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:bg-white outline-none font-black transition-all text-slate-900"
                  maxLength={6} 
                  autoFocus
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)} 
                />
                
                <button 
                  type="submit"
                  disabled={!!loading}
                  className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading === "verify" ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                </button>

                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-slate-400 font-bold text-xs hover:text-slate-600"
                >
                  Change Email Address
                </button>
              </form>
            </div>
          )}

          {/* --- STEP 3: SUCCESS & AUTO LOGIN --- */}
          {step === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in duration-300">
              <p className="text-slate-500 leading-relaxed font-medium">
                Your account has been successfully created and verified. You are now being redirected to your dashboard.
              </p>
              
              <button 
                onClick={handleAutoLogin} 
                disabled={!!loading}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {loading === "autologin" ? (
                  <>
                    <Loader2 className="animate-spin" /> Preparing Dashboard...
                  </>
                ) : (
                  <>
                    Go to Dashboard <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60">
          Start Your Journey
        </p>
      </div>
    </div>
  );
}

function Input({ label, icon, placeholder, type = "text", disabled, onChange }: any) {
  // Local state to handle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        
        <input 
          type={inputType} 
          placeholder={placeholder} 
          required
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
        />

        {/* Render Eye Toggle ONLY if the original type was "password" */}
        {isPassword && (
          <button
            type="button" // Prevents form submission
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none disabled:opacity-50"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}