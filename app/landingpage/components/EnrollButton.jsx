"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function EnrollButton({user}) {
  const router = useRouter();
 
  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      {/* The Animated Border Container */}
      <div className="relative p-[2px] overflow-hidden rounded-full transition-transform hover:scale-105 active:scale-95 shadow-2xl">
        
        {/* The Moving Border (Only visible on hover) */}
        <div className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#22c55e_50%,#fff_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* The Actual Button */}
        {user ?
          helperBtn({text: "Go to Dashboard", route: "dashboard", router})
          :
          helperBtn({text: "Enroll Now", route: "signup", router})
        }
      </div>

      {/* Tailwind handles the rotation via the animate-[spin_3s_linear_infinite] utility class */}
    </div>
  );
}

const helperBtn = ({text, route , router}) =>{
  return (
    <button
          onClick={() => router.push(`/${route}`)}
          className="relative flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-bold transition-colors"
        >
          {text}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
  )
}

