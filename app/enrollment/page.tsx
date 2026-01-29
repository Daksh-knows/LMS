"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script'; 
import { Rocket, Check, Sparkles, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {  useRouter } from 'next/navigation';
import { getSession, useSession } from 'next-auth/react';

export default function EnrollmentPage() {
    const router = useRouter();
  const { data: session, status, update } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // CONFIGURATION
  const CUTOFF_DATE = new Date("2026-01-31T23:59:59");

  /* -----------------------------------------------------
     AUTH GUARD (CLIENT-SIDE)
  ----------------------------------------------------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  /* -----------------------------------------------------
     DERIVED STATE
  ----------------------------------------------------- */
  useEffect(() => {
    if (session?.user) {
      setIsRegistered((session.user as any).hasRegistered || false);
    }

    const now = new Date();
    if (now > CUTOFF_DATE) {
      setIsExpired(true);
    }
  }, [session]);

  // Prevent UI flash while auth is loading
  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  /* -----------------------------------------------------
     PAYMENT HANDLER
  ----------------------------------------------------- */
  const handlePayment = async (
    action: "REGISTER_COHORT" | "BUY_PREMIUM"
  ) => {
    setIsProcessing(true);

    try {
      const currentSession = await getSession();
      if (!currentSession?.user?.id) {
        setIsProcessing(false);
        router.replace("/signin");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

      // 1. Create Order
      const orderRes = await fetch(`${baseUrl}/api/premium/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const order = await orderRes.json();
      if (!order.success) {
        throw new Error(order.error || "Failed to create order");
      }

      // 2. Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name:
          action === "REGISTER_COHORT"
            ? "Cohort Registration"
            : "Premium Upgrade",
        description:
          action === "REGISTER_COHORT"
            ? "Unlock ₹7,000 Price"
            : "Full Course Access",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch(
              `${baseUrl}/api/premium/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: order.amount,
                }),
              }
            );

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error("Verification failed");
            }

            // 4. Success Handling
            if (action === "REGISTER_COHORT") {
              toast.success("Discount unlocked!");
              setIsRegistered(true);
              await update({ hasRegistered: true });
            } else {
              toast.success("Welcome to Premium!");
              await update({ hasPremium: true });
              router.push("/dashboard?payment=success");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        prefill: {
          email: session?.user?.email,
          name: session?.user?.name,
        },
        theme: {
          color: action === "REGISTER_COHORT" ? "#f59e0b" : "#16a34a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Something went wrong.");
      setIsProcessing(false);
    }
  };

  // --- LOGIC: DECIDE WHICH VIEW TO SHOW ---
  
  // VIEW 1: COHORT REGISTRATION (Only if NOT registered AND NOT expired)
  if (!isRegistered && !isExpired) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-amber-100">
           {/* Header */}
           <div className="bg-amber-50 p-8 pb-6 text-center border-b border-amber-100">
              <div className="inline-flex items-center gap-2 bg-white text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm mb-4">
                 <Clock size={12} /> Limited Time Offer
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Join the Cohort</h1>
              <p className="text-slate-600 text-sm">Register before Jan 31st to unlock the discounted price.</p>
           </div>

           {/* Price Section */}
           <div className="p-8">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Pay Now</div>
                    <div className="text-4xl font-black text-slate-900">₹200</div>
                 </div>
                 <div className="text-right">
                    <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Unlock Price</div>
                    <div className="text-xl font-bold text-green-600">₹7,000</div>
                    <div className="text-xs text-slate-400 line-through">₹9,000</div>
                 </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-2xl">
                 <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="font-medium">Secure your seat in the live cohort</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="font-medium">Save <span className="text-green-600 font-bold">₹1,800</span> on final fees</span>
                 </div>
              </div>

              <button 
                  onClick={() => handlePayment('REGISTER_COHORT')}
                  disabled={isProcessing}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-100 active:scale-95 flex justify-center items-center gap-2"
              >
                  {isProcessing ? "Processing..." : "Pay ₹200 to Register"}
              </button>
           </div>
        </div>
      </div>
    );
  }

  // VIEW 2: FINAL PAYMENT (If Registered OR Expired)
  // We calculate the display price based on status
  const finalPrice = isRegistered ? 7000 : 9000;
  const savings = isRegistered ? 2000 : 0; // Display purpose

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <div className="bg-white border-2 border-green-500 rounded-[2.5rem] shadow-2xl overflow-hidden max-w-md w-full p-8 md:p-10 relative">
            
            {/* Dynamic Banner */}
            {isRegistered ? (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <Sparkles size={10} /> DISCOUNT APPLIED
                </div>
            ) : (
                 <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    STANDARD PRICE
                </div>
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-xl">
                   <Rocket className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Complete Enrollment</span>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-2">Final Step</h2>
            
            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900">₹{finalPrice.toLocaleString()}</span>
                    <span className="text-slate-400 line-through text-xl">₹15,000</span>
                </div>
                {isRegistered ? (
                    <p className="text-xs text-green-600 font-bold mt-1">Cohort discount active!</p>
                ) : (
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
                        <AlertCircle size={12} />
                        <span>Cohort registration missed. Standard pricing applies.</span>
                    </div>
                )}
            </div>

            <button 
                onClick={() => handlePayment('BUY_PREMIUM')}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
            >
                {isProcessing ? "Processing..." : `Pay ₹${finalPrice.toLocaleString()}`}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-6">
                Secure SSL Payment via Razorpay
            </p>
        </div>
    </div>
  );
}