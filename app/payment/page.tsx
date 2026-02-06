"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    try {
      const session = await getSession();
      if (!session?.user?.id) {
        toast.error("You must be logged in to proceed.");
        setLoading(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const orderRes = await fetch(`${baseUrl}/api/premium/order`, { method: "POST" });
      const order = await orderRes.json();

      if (!order.success) {
        toast.error("Failed to create order.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "LMS + Placement Portal",
        description: "Premium Membership Upgrade",
        order_id: order.id,
        handler: async function (response: any) {
          // --- INTERNAL VERIFICATION LOGIC ---
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
            if (!res.ok || !data.success) throw new Error(data.error || "Verification failed");
            
            // 1. IMPORTANT: Update the local session so the UI knows you are premium
            await update({ hasPremium: true  });
            return data;
          };

          // --- TOAST PROMISE HANDLING ---
          // toast.promise(verifyPayment(), {
          //   loading: "Finalizing your upgrade...",
          //   success: () => {
          //     // 2. Clear loading before navigating
          //     setLoading(false); 
          //     console.log("Payment and upgrade successful!");
          //     // 3. Redirect to dashboard
          //     router.push("/dashboard?payment=success");
          //     router.refresh(); 
          //     return "Welcome to Premium! 🏆";
          //   },
          //   error: (err) => {
          //     setLoading(false);
          //     return `Error: ${err.message}`;
          //   },
          // });
          try{
            toast.loading("Finalizing your upgrade...");
            await verifyPayment();
            toast.dismiss();
            setLoading(false); 
            console.log("Payment and upgrade successful!");
            router.push("/dashboard?payment=success");
            router.refresh(); 
            showToast.success("Welcome to Premium! 🏆");
          }catch(err: any){
            toast.dismiss();
            setLoading(false);
            showToast.error(err.message || "Verification failed.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        // ... (prefill and theme remains the same)
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };
  //#16a34a = green theme for enrollment card design
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="bg-white max-w-sm w-full rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
          <Lock size={30} />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-2">Checkout</h2>
        <p className="text-slate-500 text-sm mb-8">
          Securely complete your <span className="font-bold text-slate-900">₹7,000</span> deposit to unlock your courses.
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "PAY NOW"}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Razorpay Secure Payment</span>
        </div>
      </div>
    </div>
  );
}