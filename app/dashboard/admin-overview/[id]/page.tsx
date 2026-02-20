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
import { showToast } from "@/utils/Toast";

interface Submission {
  id: string;
  fileUrl: string;
  grade: number | null;
  feedback: string | null;
  createdAt: string;
  User: {
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
          showToast.error(result.error || "Failed to load");
        }
      } catch (error) {
        showToast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleGradeSubmit = async (submissionId: string, grade: number, feedback: string) => {
    setSavingId(submissionId);

    const gradePromise = async () => {
        const res = await fetch(`/api/admin/assignments/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, grade, feedback }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    };

    try{
      const result = await gradePromise();
      setSavingId(null);
      setSubmissions((prev)=>{
        return prev.map((s) => s.id === submissionId ? {...s, grade, feedback} : s);
      })
      showToast.success('Grade saved successfully!');
      return 'Grade saved successfully!';
    }catch(err :any){
      console.error(err);
      showToast.error(err.message || 'Failed to save grade');
    }finally{
      setSavingId(null);
    }
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
         <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white p-20 border border-dashed border-gray-200 rounded-3xl text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No submissions found.</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <GradingCard 
                key={sub.id} 
                submission={sub} 
                onSave={handleGradeSubmit} 
                isSaving={savingId === sub.id} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Separate component for Row to handle local input state cleanly
function GradingCard({ submission, onSave, isSaving }: any) {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isDirty, setIsDirty] = useState(false);
  const isGraded = submission.grade !== null;
  const [justSaved, setJustSaved] = useState(false);

  const handleChange = (type: 'grade' | 'feedback', value: string) => {
      if (type === 'grade') setGrade(value);
      if (type === 'feedback') setFeedback(value);
      setIsDirty(true);
      setJustSaved(false); // Hide checkmark, show save button again
    };

    const handleSave = async () => {
      const success = await onSave(submission.id, parseFloat(grade) || 0, feedback);
      if (success) {
        setIsDirty(false);
        setJustSaved(true); // This triggers the checkmark immediately
      }
    };

    const showCheckmark = (submission.grade !== null && !isDirty) || (justSaved && !isDirty);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-6">
        
        {/* Top Section: Info and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Student Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
              {submission.User?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm md:text-base truncate">{submission.User?.name}</p>
              <p className="text-xs text-gray-400 truncate">{submission.User?.email}</p>
              <p className="text-[10px] text-gray-400 mt-1 md:hidden">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Desktop-only Date */}
          <div className="hidden md:block text-sm text-gray-500">
            {new Date(submission.createdAt).toLocaleDateString()}
          </div>

          {/* Work Link */}
          <a 
            href={submission.fileUrl} 
            target="_blank" 
            rel="noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <FileText size={16} />
            View Submission
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Bottom Section: Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-t border-gray-50 pt-4">
          
          {/* Feedback Input */}
          <div className="md:col-span-8 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Feedback
            </label>
            <textarea 
              value={feedback}
              onChange={(e) => handleChange('feedback', e.target.value)}
              placeholder="Add your comments..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none h-20"
            />
          </div>

          {/* Grade and Save */}
          <div className="md:col-span-4 flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Grade (0-100)
              </label>
              <input 
                type="number" 
                value={grade}
                onChange={(e) => handleChange('grade', e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-center focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />
            </div>

            <div className="shrink-0 h-[46px] flex items-center">
              {isSaving ? (
                <Loader2 className="animate-spin text-blue-600 mx-4" size={24} />
              ) : isDirty ? (
                <button 
                  onClick={handleSave}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Save size={20} />
                  <span className="md:hidden font-bold text-sm">Save</span>
                </button>
              ) : showCheckmark ? (
                <div className="flex flex-col items-center text-green-500 px-4">
                   <CheckCircle2 size={28} />
                </div>
              ) : (
                <div className="w-10" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}