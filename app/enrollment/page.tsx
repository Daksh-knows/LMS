"use client";

import React, { useState } from 'react';
import Script from 'next/script'; // Import Script for Razorpay
import { createRazorpayOrder } from "@/lib/payment-actions"; // Import your action
import { CheckCircle2, Rocket, Info, FileText, Loader2 } from 'lucide-react';
import { upgradeToPremium } from '@/lib/auth-actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { get } from 'http';
import { getSession } from 'next-auth/react';

export default function EnrollmentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const benefits = [
    "Full access to 100+ Interview Prep Courses",
    "Real-world Data Structures & Algorithms (DSA) deep dives",
    "Backend & Frontend Engineering Mastery tracks",
    "Mock Interview sessions with industry experts",
    "Lifetime access to our private Discord community",
    "Resume & Portfolio review templates"
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create order via API
      const session = await getSession();
      if (!session?.user?.id) {
        toast.error("You must be logged in to proceed with payment.");
        setIsProcessing(false);
        return;
      }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const orderRes = await fetch(`${baseUrl}/api/premium/order`, { method: "POST" });
      const order = await orderRes.json();

      if (!order.success) {
        toast.error("Failed to create order. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 2. Initialize Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "LMS + Placement Portal",
        description: "Premium Membership Upgrade",
        order_id: order.id,
        handler: async function (response: any) {
          // This promise handles the backend verification and UI feedback
          const verifyPayment = async () => {
            const res = await fetch(`${baseUrl}/api/premium/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || "Verification failed");
            }
            return data;
          };

          toast.promise(verifyPayment(), {
            loading: "Verifying payment and upgrading your account...",
            success: () => {
              // Standardizing navigation: use router.push instead of window.location
              router.push("/dashboard?payment=success");
              router.refresh(); 
              return "Welcome to Premium! Your account has been upgraded. 🏆";
            },
            error: (err) => `Error: ${err.message}`,
          });
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: session?.user?.name || "User Name", // You can pass session.user.name here
          email: session?.user?.email || "user@example.com",
        },
        theme: {
          color: "#2563eb", // Matches your blue-600 buttons
        },
      };

      // 3. Open Razorpay Modal
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Something went wrong with the payment gateway.");
      setIsProcessing(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-12">
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="text-center mb-10 max-w-2xl text-slate-900">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Invest in Your <span className="text-green-600">Future Career</span>
        </h1>
        <p className="text-slate-600 text-lg">
          Join 10,000+ students who cracked top tech companies.
        </p>
      </div>

      <div className="bg-white border-2 border-green-500 rounded-[2.5rem] shadow-2xl overflow-hidden max-w-md w-full relative">
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-xl">
              <Rocket className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">All-Access Pass</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">Full Stack Pro</h2>
          
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">₹7,000</span>
              <span className="text-slate-400 line-through text-xl">₹15,000</span>
            </div>
            <div className="mt-2 flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit border border-blue-100">
              <Info size={14} />
              <span className="text-xs font-bold uppercase tracking-tighter">Security Deposit</span>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-slate-600 text-sm font-medium">{benefit}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 flex flex-col items-center justify-center disabled:opacity-70"
          >
            <div className="flex items-center gap-2 text-lg">
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Pay Deposit Now
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
            </div>
          </button>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3 text-slate-800">
              <FileText size={16} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest">Terms & Conditions</span>
            </div>
            <p className="text-[11px] text-slate-500">The ₹7,000 deposit is mandatory to secure your enrollment seat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}