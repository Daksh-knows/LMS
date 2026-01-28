"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface AssignmentSummary {
  id: string;
  title: string;
  courseName: string;
  totalSubmissions: number;
  pendingReviews: number;
}

export default function AdminAssignmentsOverview() {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which course sections are expanded
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const response = await fetch(`${baseUrl}/api/admin/assignments`);
        const result = await response.json();
        
        if (result.success) {
          setAssignments(result.data || []);
          
          // Optionally: Auto-expand courses that have pending reviews
          const initialExpanded: Record<string, boolean> = {};
          const groups = result.data.reduce((acc: any, curr: AssignmentSummary) => {
            if (curr.pendingReviews > 0) initialExpanded[curr.courseName] = true;
            return acc;
          }, {});
          setExpandedCourses(initialExpanded);
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group assignments and calculate per-course pending counts
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
    setExpandedCourses(prev => ({
      ...prev,
      [courseName]: !prev[courseName]
    }));
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
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      
      {/* STATS HEADER (White UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Pending Reviews" 
          value={totalPending} 
          icon={<AlertCircle size={28} strokeWidth={2.5} />}
          showBadge={totalPending > 0}
          badgeText="Needs Action"
          footer="Submissions waiting for your feedback"
        />
        <StatCard 
          title="Total Received" 
          value={totalReceived} 
          icon={<FileText size={28} />}
          footer={`Across ${assignments.length} active assignments`}
        />
      </div>

      {/* GROUPED COLLAPSIBLE LIST */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-gray-900">Assignment Queue</h3>
        
        {Object.keys(groupedData).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedData).map(([courseName, group]) => {
              const isExpanded = expandedCourses[courseName];
              
              return (
                <div key={courseName} className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                  {/* COURSE BANNER / TOGGLE */}
                  <button 
                    onClick={() => toggleCourse(courseName)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${group.coursePending > 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 tracking-tight">{courseName}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                           Total Assignments = {group.items.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {group.coursePending > 0 && (
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-blue-600">{group.coursePending}</span>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">To Check</span>
                        </div>
                      )}
                      <div className="text-gray-300">
                        {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                      </div>
                    </div>
                  </button>

                  {/* ASSIGNMENT ITEMS (COLLAPSIBLE) */}
                  {isExpanded && (
                    <div className="p-6 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <div className="h-px bg-gray-100 mb-4" />
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

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function StatCard({ title, value, icon, showBadge, badgeText, footer }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">{icon}</div>
        {showBadge && (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-amber-100">
            {badgeText}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900">{value}</h2>
        <p className="text-lg font-bold text-slate-600">{title}</p>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-50 text-xs font-medium text-slate-400 italic">
        {footer}
      </div>
    </div>
  );
}

function AssignmentRow({ assignment }: { assignment: AssignmentSummary }) {
  const hasPending = assignment.pendingReviews > 0;
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
      hasPending ? "bg-white border-blue-50 shadow-sm" : "bg-gray-50/50 border-transparent opacity-60"
    }`}>
      <div className="flex items-center gap-4">
        <FileText size={18} className={hasPending ? "text-blue-500" : "text-gray-400"} />
        <span className="font-bold text-gray-800 text-sm">{assignment.title}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className={`font-black text-sm ${hasPending ? 'text-blue-600' : 'text-gray-400'}`}>
            {assignment.pendingReviews}
          </span>
          <p className="text-[8px] uppercase font-black text-gray-300">Pending</p>
        </div>
        <Link 
          href={`/dashboard/admin-overview/${assignment.id}`}
          className={`p-2 rounded-xl transition-all ${
            hasPending ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
          }`}
        >
          <ArrowRight size={16} />
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