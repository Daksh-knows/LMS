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
                    <th className="p-6">Submitted At</th>
                    <th className="p-6">Work</th>
                    <th className="p-6 w-32">Grade (0-100)</th>
                    <th className="p-6 w-24 text-right">Action</th>
                  </tr>
                </thead>
                {/* No single <tbody> here, GradingRow will provide its own grouped <tbody> */}
                {submissions.map((sub) => (
                  <GradingRow 
                    key={sub.id} 
                    submission={sub} 
                    onSave={handleGradeSubmit} 
                    isSaving={savingId === sub.id} 
                  />
                ))}
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
  console.log(submission);
  const isGraded = submission.grade !== null;

  return (
    // Use <tbody> to group the two rows together for one student
    <tbody className="group border-b border-gray-100 last:border-0">
      <tr className="hover:bg-blue-50/10 transition-colors">
        <td className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
               {submission.User?.name.charAt(0)||'John Doe'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{submission.User?.name}</p>
              <p className="text-xs text-gray-400">{submission.User?.email}</p>
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
              let value = parseInt(e.target.value);
              if (isNaN(value)) {
                setGrade("");
                return;
              }
              if (value > 100) value = 100;
              if (value < 0) value = 0;

              setGrade(value.toString());
              setIsDirty(true);
            }}
            placeholder="-"
            className="w-20 p-2 text-center bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </td>
        
        {/* Action button moved here to be on the primary row */}
        <td className="p-6 text-right">
          {isSaving ? (
            <Loader2 className="animate-spin text-blue-600 ml-auto" size={20} />
          ) : isDirty ? (
            <button 
              onClick={() => {
                onSave(submission.id, parseFloat(grade) || 0, feedback);
                setIsDirty(false); // Reset dirty state after save trigger
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 ml-auto block"
            >
              <Save size={18} />
            </button>
          ) : isGraded ? (
            <div className="text-green-500 flex justify-end">
              <CheckCircle2 size={24} />
            </div>
          ) : (
            <div className="w-9 h-9 ml-auto" /> 
          )}
        </td>
      </tr>

      {/* New Row for Feedback spanning all columns except the last */}
      <tr>
        <td colSpan={5} className="px-6 pb-6 pt-0">
          {/* Added 'max-w-md' to limit width, and 'mx-auto' if you want it centered */}
          <div className="max-w-md bg-gray-50 rounded-xl p-3 border border-gray-100 focus-within:border-blue-200 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 px-1">
              Feedback
            </p>
            <textarea 
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Provide guidance or corrections..."
              className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none min-h-[40px] px-1"
              rows={2}
            />
          </div>
        </td>
      </tr>
    </tbody>
  );
}