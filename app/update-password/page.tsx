"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { getSession } from "next-auth/react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // You will need to create this API endpoint to update the DB
      const res = await fetch("/api/auth/update-temp-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        throw new Error("Failed to update password");
      }

      // Important: Force a session update or re-login so the flag is cleared
      router.refresh();
      router.push("/dashboard");
      
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="w-full max-w-md text-center mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }}
        >
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-foreground)' }}>
          Update Password
        </h1>
        <p className="mt-2 font-medium" style={{ color: 'var(--color-foreground)', opacity: 0.6 }}>
          For your security, please change your temporary password to continue.
        </p>
      </div>

      <div className="auth-card">
        {error && (
          <div className="auth-error">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="auth-label">New Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon" />
              <input
                name="newPassword"
                type="password"
                required
                disabled={isLoading}
                placeholder="At least 8 characters"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon" />
              <input
                name="confirmPassword"
                type="password"
                required
                disabled={isLoading}
                placeholder="Repeat new password"
                className="auth-input"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="auth-btn-primary">
            {isLoading ? (
              <><Loader2 className="animate-spin w-5 h-5" /> Updating...</>
            ) : (
              <>Save Password <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}