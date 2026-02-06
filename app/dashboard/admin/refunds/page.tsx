"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ArrowLeft, CheckCircle2, Loader2, CreditCard, Calendar, 
  Filter, ArrowUpDown, Clock, Users 
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { showToast } from "@/utils/Toast";

// Interface for type safety
interface RefundRequest {
  id: string;
  reason: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    batch: string | null;
    paymentDate: string | null;
  };
}

export default function AdminRefundsPage() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- FILTER STATES ---
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/refund/list");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      showToast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --- DERIVED STATE: Get Unique Batches ---
  const uniqueBatches = useMemo(() => {
    const batches = new Set(requests.map(r => r.user.batch || "Unassigned"));
    return Array.from(batches);
  }, [requests]);

  // --- FILTERING & SORTING LOGIC ---
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        if (selectedBatch === 'ALL') return true;
        const batchName = req.user.batch || "Unassigned";
        return batchName === selectedBatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [requests, selectedBatch, sortOrder]);

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
        showToast.success(decision === 'APPROVE' ? "Refund Initiated via Razorpay" : "Request Rejected");
        fetchRequests(); 
      } else {
        showToast.error(data.error || "Action failed");
      }
    } catch (error) {
      showToast.error("Server error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      {/* Header Navigation */}
      <Link href="/dashboard/admin-overview" className="inline-flex items-center gap-2 text-gray-500 mb-8 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back to Overview
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-gray-900">Refund Requests</h1>
          <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-red-100">
            {requests.length} Pending
          </span>
        </div>

        {/* --- CONTROLS BAR --- */}
        <div className="flex flex-wrap gap-3">
          {/* Batch Filter */}
          <div className="relative group">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-gray-100 appearance-none cursor-pointer hover:border-gray-300 transition-all"
            >
              <option value="ALL">All Batches</option>
              {uniqueBatches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="relative">
            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-gray-100 appearance-none cursor-pointer hover:border-gray-300 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 bg-gray-50 rounded-3xl border border-dashed text-center text-gray-400">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No requests found matching your filters.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* User Info & Batch */}
                <div className="flex items-start gap-4 min-w-[250px]">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg shrink-0">
                    {req.user.name?.[0] || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{req.user.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                      <CreditCard size={12} />
                      {req.user.email}
                    </div>
                    {/* Batch Badge */}
                    <div className="inline-flex items-center gap-1 mt-2 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-100">
                       <Users size={10} />
                       {req.user.batch || "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Refund Reason & Dates */}
                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-gray-600 text-sm italic mb-3">"{req.reason}"</p>
                  
                  <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200/50">
                    {/* Request Date */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                      <Calendar size={12} className="text-gray-400" />
                      <div>
                        <span className="block text-gray-300 text-[8px]">Requested On</span>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Payment Date */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                      <Clock size={12} className="text-green-500" />
                      <div>
                        <span className="block text-gray-300 text-[8px]">Paid On</span>
                        {req.user.paymentDate 
                          ? new Date(req.user.paymentDate).toLocaleDateString() 
                          : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end lg:self-center">
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
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 min-w-[180px] justify-center"
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