"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";
import { useSession } from "next-auth/react";

interface CheckoutButtonProps {
  itemId: string;
  itemType: "COURSE" | "BUNDLE";
  price: number;
  className?: string;
}

export const CheckoutButton = ({ itemId, itemType, price, className }: CheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleCheckout = async () => {
    if (!session?.user) {
      showToast.error("Please login to purchase");
      router.push("/signin");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order
      const orderRes = await fetch(`/api/ecommerce/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType })
      });
      const order = await orderRes.json();

      if (!order.success) {
        showToast.error(order.error || "Failed to create order.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "LMS E-Commerce",
        description: `Purchase ${itemType.toLowerCase()}`,
        order_id: order.id,
        handler: async function (response: any) {
          toast.loading("Verifying payment...");
          try {
            const verifyRes = await fetch(`/api/ecommerce/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const data = await verifyRes.json();
            toast.dismiss();

            if (!verifyRes.ok || !data.success) {
              throw new Error(data.error || "Payment verification failed");
            }

            showToast.success("Purchase successful! Enrolled in course(s).");
            router.push("/dashboard");
            router.refresh();
          } catch (err: any) {
            toast.dismiss();
            showToast.error(err.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        prefill: {
          email: session.user.email,
        },
        theme: {
          color: "#2563EB",
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      showToast.error("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`bg-(--colored-text) hover:opacity-90 text-[#000000] font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${className}`}
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Buy Now (₹{price})
          </>
        )}
      </button>
    </>
  );
};
