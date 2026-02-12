"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, AlertCircle, Loader2, FileText, ArrowRight, BookOpen, 
  ChevronDown, ChevronRight, ShieldAlert, CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ... [Keep your existing AssignmentSummary interface] ...
interface AssignmentSummary {
  id: string;
  title: string;
  courseName: string;
  totalSubmissions: number;
  pendingReviews: number;
}

export default function AdminAssignmentsOverview() {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [refundCount, setRefundCount] = useState(0); // NEW STATE
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        
        // Parallel Fetch: Assignments + Refund Stats
        const [assignRes, refundRes] = await Promise.all([
          fetch(`${baseUrl}/api/admin/assignments`),
          fetch(`${baseUrl}/api/admin/refund/stats`) // New Endpoint
        ]);

        const assignResult = await assignRes.json();
        const refundResult = await refundRes.json();
        
        if (assignResult.success) {
          setAssignments(assignResult.data || []);
          // Auto-expand logic (kept same)
          const initialExpanded: Record<string, boolean> = {};
          const groups = assignResult.data.reduce((acc: any, curr: AssignmentSummary) => {
            if (curr.pendingReviews > 0) initialExpanded[curr.courseName] = true;
            return acc;
          }, {});
          setExpandedCourses(initialExpanded);
        }

        if (refundResult.success) {
          setRefundCount(refundResult.pendingCount || 0);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ... [Keep your groupedData useMemo and toggleCourse function exactly as is] ...
  const groupedData = useMemo(() => {
    const groups: Record<string, { items: AssignmentSummary[]; coursePending: number }> = {};
    assignments.forEach((item) => {
      if (!groups[item.courseName]) {
        groups[item.courseName] = { items: [], coursePending: 0 };
      }
      groups[item.courseName].items.push(item);
      groups[item.courseName].coursePending += item.pendingReviews;
    });
    return groups;
  }, [assignments]);

  const toggleCourse = (courseName: string) => {
    setExpandedCourses(prev => ({ ...prev, [courseName]: !prev[courseName] }));
  };

  const totalPending = assignments.reduce((acc, curr) => acc + curr.pendingReviews, 0);
  const totalReceived = assignments.reduce((acc, curr) => acc + curr.totalSubmissions, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
<div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
      
      {/* STATS HEADER - Fully Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          title="Pending Reviews" 
          value={totalPending} 
          icon={<AlertCircle size={24} />}
          showBadge={totalPending > 0}
          badgeText="Needs Action"
          statusType="warning"
          footer="Submissions waiting for feedback"
        />
        
        <Link href="/dashboard/admin/refunds" className="block h-full">
          <StatCard 
            title="Refund Requests" 
            value={refundCount} 
            icon={<CreditCard size={24} />}
            showBadge={refundCount > 0}
            badgeText="Urgent"
            statusType="urgent"
            footer="Requests for money back"
            isInteractive={true}
          />
        </Link>

        <StatCard 
          title="Total Received" 
          value={totalReceived} 
          icon={<FileText size={24} />}
          footer={`Across ${assignments.length} assignments`}
        />
      </div>

      {/* ASSIGNMENT QUEUE */}
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-black text-foreground">Assignment Queue</h3>
        
        {Object.keys(groupedData).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedData).map(([courseName, group]) => {
              const isExpanded = expandedCourses[courseName];
              return (
                <div key={courseName} className="admin-card rounded-2xl md:rounded-[2rem] overflow-hidden">
                  <button 
                    onClick={() => toggleCourse(courseName)}
                    className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-card-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`p-2 rounded-xl ${group.coursePending > 0 ? 'bg-brand-blue text-white' : 'bg-card-muted text-foreground/40'}`}>
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm md:text-base leading-tight">{courseName}</h4>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                           {group.items.length} Assignments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {group.coursePending > 0 && (
                        <div className="text-right">
                          <span className="text-lg font-black text-brand-blue">{group.coursePending}</span>
                        </div>
                      )}
                      <div className="text-foreground/20">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 md:p-6 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="h-px bg-border mb-4" />
                      {group.items.map((assignment) => (
                        <AssignmentRow key={assignment.id} assignment={assignment} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Updated StatCard to handle different colors and interactivity
function StatCard({ title, value, icon, showBadge, badgeText, statusType = "neutral", footer, isInteractive }: any) {
  // Logic to pick colors based on theme variables
  const colorStyles = {
    urgent: "text-urgent bg-urgent-muted border-urgent/20",
    warning: "text-warning bg-warning-muted border-warning/20",
    neutral: "text-brand-blue bg-brand-muted border-border"
  }[statusType as 'urgent' | 'warning' | 'neutral'];

  return (
    <div className={`admin-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col justify-between h-full ${isInteractive ? 'admin-card-interactive' : ''}`}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className={`p-2.5 rounded-xl ${colorStyles.split(' ').slice(0,2).join(' ')}`}>{icon}</div>
          {showBadge && (
            <span className={`${colorStyles} text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border`}>
              {badgeText}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{value}</h2>
          <p className="text-sm md:text-base font-bold text-foreground/60">{title}</p>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border text-[10px] font-medium text-foreground/40 italic">
        {footer}
      </div>
    </div>
  );
}

// ... [Keep AssignmentRow and EmptyState exactly as they were] ...
function AssignmentRow({ assignment }: { assignment: AssignmentSummary }) {
  const hasPending = assignment.pendingReviews > 0;
  return (
    <div className={`flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${
      hasPending ? "bg-card border-brand-blue/20" : "bg-card-muted/50 border-transparent opacity-50"
    }`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText size={16} className={hasPending ? "text-brand-blue" : "text-foreground/30"} />
        <span className="font-bold text-foreground text-xs md:text-sm truncate">{assignment.title}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className={`font-black text-xs md:text-sm ${hasPending ? 'text-brand-blue' : 'text-foreground/30'}`}>
          {assignment.pendingReviews}
        </span>
        <Link 
          href={`/dashboard/admin-overview/${assignment.id}`}
          className={`p-1.5 rounded-lg transition-all ${
            hasPending ? "bg-brand-blue text-white" : "bg-foreground/10 text-foreground/40"
          }`}
        >
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">No active assignments found.</p>
    </div>
  );
}