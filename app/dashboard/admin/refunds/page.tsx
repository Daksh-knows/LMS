"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ArrowLeft, CheckCircle2, Loader2, CreditCard, Calendar, 
  Filter, ArrowUpDown, Clock, Users, 
  ChevronDown
} from "lucide-react";
import Link from "next/link";
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
    <div 
      className="max-w-6xl mx-auto p-6 md:p-12 min-h-screen transition-colors duration-500"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* Header Navigation */}
      <Link 
        href="/dashboard/admin-overview" 
        className="btn-ghost inline-flex items-center gap-2 mb-8 w-fit pl-2 pr-4"
      >
        <ArrowLeft size={16} /> 
        <span className="font-medium text-sm">Back to Overview</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 
            className="text-3xl font-black"
            style={{ color: 'var(--color-foreground)' }}
          >
            Refund Requests
          </h1>
          <span 
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red-500 with opacity
              color: '#ef4444', 
              borderColor: 'rgba(239, 68, 68, 0.2)'
            }}
          >
            {requests.length} Pending
          </span>
        </div>

        {/* --- CONTROLS BAR --- */}
        <div className="flex flex-wrap gap-3">
          {/* Batch Filter */}
          <div className="relative group w-48">
            <Filter 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            />
            <select 
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="input-field pl-9 py-2.5 text-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Batches</option>
              {uniqueBatches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Sort Order */}
          <div className="relative w-48">
            <ArrowUpDown 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="input-field pl-9 py-2.5 text-sm appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div 
            className="p-12 rounded-3xl border border-dashed text-center"
            style={{ 
              borderColor: 'var(--color-border-muted)',
              backgroundColor: 'var(--color-card-muted)'
            }}
          >
            <CheckCircle2 
              size={48} 
              className="mx-auto mb-4" 
              style={{ color: 'var(--color-foreground)', opacity: 0.2 }} 
            />
            <p style={{ color: 'var(--color-foreground)', opacity: 0.5 }}>
              No requests found matching your filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div 
              key={req.id} 
              className="card-base p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* User Info & Batch */}
                <div className="flex items-start gap-4 min-w-[250px]">
                  <div 
                    className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                    style={{ 
                      backgroundColor: 'var(--color-card-muted)',
                      color: 'var(--color-foreground)',
                      opacity: 0.8
                    }}
                  >
                    {req.user.name?.[0] || "U"}
                  </div>
                  <div>
                    <h3 
                      className="font-bold text-lg leading-tight"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      {req.user.name}
                    </h3>
                    <div 
                      className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mt-1"
                      style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
                    >
                      <CreditCard size={12} />
                      {req.user.email}
                    </div>
                    {/* Batch Badge */}
                    <div 
                      className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      style={{ 
                        backgroundColor: 'var(--color-brand-muted)',
                        color: 'var(--color-brand-blue)',
                        borderColor: 'rgba(37, 99, 235, 0.2)'
                      }}
                    >
                      <Users size={10} />
                      {req.user.batch || "Unassigned"}
                    </div>
                  </div>
                </div>

                {/* Refund Reason & Dates */}
                <div 
                  className="flex-1 p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: 'var(--color-input-bg)', // Gray-50 / Zinc-800
                    borderColor: 'var(--color-border-muted)'
                  }}
                >
                  <p 
                    className="text-sm italic mb-3"
                    style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
                  >
                    "{req.reason}"
                  </p>
                  
                  <div 
                    className="flex flex-wrap gap-4 pt-3 border-t"
                    style={{ borderColor: 'var(--color-border-muted)' }}
                  >
                    {/* Request Date */}
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                      <Calendar size={12} style={{ color: 'var(--color-foreground)', opacity: 0.4 }} />
                      <div>
                        <span className="block text-[8px]" style={{ color: 'var(--color-foreground)', opacity: 0.4 }}>
                          Requested On
                        </span>
                        <span style={{ color: 'var(--color-foreground)', opacity: 0.7 }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Date */}
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                      <Clock size={12} className="text-green-500" />
                      <div>
                        <span className="block text-[8px]" style={{ color: 'var(--color-foreground)', opacity: 0.4 }}>
                          Paid On
                        </span>
                        <span style={{ color: 'var(--color-foreground)', opacity: 0.7 }}>
                          {req.user.paymentDate 
                            ? new Date(req.user.paymentDate).toLocaleDateString() 
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end lg:self-center">
                  <button 
                    onClick={() => handleDecision(req.id, 'REJECT')}
                    disabled={!!processingId}
                    className="btn-ghost px-6 py-3 h-auto rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                  
                  <button 
                    onClick={() => handleDecision(req.id, 'APPROVE')}
                    disabled={!!processingId}
                    className="px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 min-w-[180px] justify-center shadow-lg hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--color-foreground)',
                      color: 'var(--color-background)'
                    }}
                  >
                    {processingId === req.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
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