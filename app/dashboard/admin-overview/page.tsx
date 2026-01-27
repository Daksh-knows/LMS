"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ArrowRight 
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

  useEffect(() => {
    async function load() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const response = await fetch(`${baseUrl}/api/admin/assignments`);
        const result = await response.json();
        if (result.success) {
          setAssignments(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Calculate top-level stats
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 1. Admin Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-indigo-100 transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <AlertCircle size={28} strokeWidth={2.5} />
                </div>
                <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-amber-100">
                    Needs Action
                </span>
            </div>

            <div className="space-y-1">
                <h2 className="text-5xl font-black tracking-tighter text-slate-900">
                    {totalPending}
                </h2>
                <p className="text-lg font-bold text-slate-600">Pending Reviews</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
                <p className="text-xs font-medium text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Submissions waiting for your feedback
                </p>
            </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 font-medium mb-1">Total Submissions</p>
              <h2 className="text-5xl font-black text-gray-900">{totalReceived}</h2>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <FileText size={32} className="text-gray-400" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Across {assignments.length} active assignments
          </p>
        </div>
      </div>

      {/* 2. Assignment List */}
      <div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-6">Assignment Queue</h3>
        
        {assignments.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No submissions found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => {
              const hasPending = assignment.pendingReviews > 0;
              
              return (
                <div 
                  key={assignment.id} 
                  className={`group flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border transition-all ${
                    hasPending 
                      ? "bg-white border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300" 
                      : "bg-gray-50/50 border-gray-100 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                      hasPending ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"
                    }`}>
                      <FileText size={20} />
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{assignment.title}</h4>
                      <p className="text-sm text-gray-500">{assignment.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className={`block text-2xl font-bold ${hasPending ? "text-blue-600" : "text-gray-700"}`}>
                        {assignment.pendingReviews}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Pending
                      </span>
                    </div>

                    <div className="text-right border-l border-gray-100 pl-8 hidden sm:block">
                      <span className="block text-2xl font-bold text-gray-900">
                        {assignment.totalSubmissions}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Total
                      </span>
                    </div>

                    <Link 
                      href={`/dashboard/admin-overview/${assignment.id}`}
                      className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                        hasPending 
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" 
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {hasPending ? "Review Now" : "View All"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}