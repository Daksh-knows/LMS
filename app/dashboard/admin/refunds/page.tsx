"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, CreditCard, User, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AdminRefundsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/refund/list");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (requestId: string, decision: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Are you sure you want to ${decision} this refund? This action cannot be undone.`)) return;
    
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/admin/refund/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, decision }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(decision === 'APPROVE' ? "Refund Initiated via Razorpay" : "Request Rejected");
        fetchRequests(); // Reload list
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <Link href="/dashboard/admin-overview" className="inline-flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back to Overview
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900">Refund Requests</h1>
        <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
          {requests.length} Pending
        </span>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-12 bg-gray-50 rounded-3xl border border-dashed text-center text-gray-400">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No pending refund requests.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                    {req.user.name?.[0] || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{req.user.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                      <CreditCard size={12} />
                      {req.user.email}
                    </div>
                  </div>
                </div>

                {/* Refund Reason */}
                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-gray-600 text-sm italic">"{req.reason}"</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-bold uppercase">
                    <Calendar size={10} />
                    Requested: {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDecision(req.id, 'REJECT')}
                    disabled={!!processingId}
                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleDecision(req.id, 'APPROVE')}
                    disabled={!!processingId}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve & Refund
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}