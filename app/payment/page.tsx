"use client";

import React, { useState } from "react";
import Script from "next/script";
import { createRazorpayOrder } from "@/lib/payment-actions";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    // 1. Trigger the Server Action
    const order = await createRazorpayOrder();

    if (!order.success) {
      alert("Error creating order. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Open Razorpay Checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Your Academy",
      description: "Security Deposit for Enrollment",
      order_id: order.id,
      handler: function (response: any) {
        // Success Logic
        console.log("Payment ID:", response.razorpay_payment_id);
        window.location.href = "/dashboard?status=success";
      },
      prefill: {
        name: "Student Name",
        email: "student@example.com",
      },
      theme: { color: "#16a34a" }, // Green theme to match your enrollment card
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setLoading(false);
  };

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