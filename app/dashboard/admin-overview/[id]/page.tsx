"use client";

import React, { use, useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ExternalLink, 
  Save, 
  Loader2, 
  CheckCircle2, 
  FileText 
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  fileUrl: string;
  grade: number | null;
  feedback: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export default function AssignmentGradingPage({ params }: { params: Promise<{ id: string }> }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null); // To track which row is saving
    const resolvedParams = use(params); // 3. Unwrap here
  const id = resolvedParams.id;
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      if (!id) return; // Guard clause

      try {
        const res = await fetch(`/api/admin/assignments/${id}`);
        const result = await res.json();
        
        if (result.success) {
          setAssignmentTitle(result.data.title);
          setSubmissions(result.data.submissions);
        } else {
          toast.error(result.error || "Failed to load");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleGradeSubmit = async (submissionId: string, grade: number, feedback: string) => {
    setSavingId(submissionId);

    const gradePromise = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const res = await fetch(`${baseUrl}/api/admin/assignments/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, grade, feedback }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    };

    toast.promise(gradePromise(), {
      loading: "Saving grade...",
      success: () => {
        setSavingId(null);
        // Update local state to show "Graded" status immediately
        setSubmissions((prev) => 
          prev.map((s) => s.id === submissionId ? { ...s, grade, feedback } : s)
        );
        return "Grade saved successfully!";
      },
      error: "Failed to save grade",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin-overview" 
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{assignmentTitle}</h1>
            <p className="text-gray-500 text-sm">Grading {submissions.length} submissions</p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          {submissions.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No students have submitted this assignment yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-6">Student</th>
                    <th className="p-6">Submitted</th>
                    <th className="p-6">Work</th>
                    <th className="p-6 w-32">Grade (0-100)</th>
                    <th className="p-6 w-1/3">Feedback</th>
                    <th className="p-6 w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub) => (
                    <GradingRow 
                      key={sub.id} 
                      submission={sub} 
                      onSave={handleGradeSubmit} 
                      isSaving={savingId === sub.id} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Separate component for Row to handle local input state cleanly
function GradingRow({ 
  submission, 
  onSave, 
  isSaving 
}: { 
  submission: Submission; 
  onSave: (id: string, g: number, f: string) => void;
  isSaving: boolean;
}) {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isDirty, setIsDirty] = useState(false);

  const isGraded = submission.grade !== null;

  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">
      <td className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
             {submission.user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{submission.user.name}</p>
            <p className="text-xs text-gray-400">{submission.user.email}</p>
          </div>
        </div>
      </td>
      
      <td className="p-6 text-sm text-gray-500">
        {new Date(submission.createdAt).toLocaleDateString()}
      </td>
      
      <td className="p-6">
        <a 
          href={submission.fileUrl} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
        >
          <FileText size={14} />
            View File
          <ExternalLink size={12} />
        </a>
      </td>
      
      <td className="p-6">
        <input 
          type="number" 
          min="0" 
          max="100"
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setIsDirty(true);
          }}
          placeholder="-"
          className="w-20 p-2 text-center bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </td>
      
      <td className="p-6">
        <input 
          type="text" 
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Write feedback..."
          className="w-full p-2 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none text-sm transition-all"
        />
      </td>
      
      <td className="p-6">
        {isSaving ? (
          <Loader2 className="animate-spin text-blue-600" size={20} />
        ) : isDirty ? (
          <button 
            onClick={() => onSave(submission.id, parseFloat(grade), feedback)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Save size={18} />
          </button>
        ) : isGraded ? (
          <div className="text-green-500 flex justify-center">
            <CheckCircle2 size={24} />
          </div>
        ) : (
          <div className="w-9 h-9" /> // Spacer
        )}
      </td>
    </tr>
  );
}