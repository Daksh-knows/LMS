"use client";
import React, { useEffect, useRef, useState } from "react";
import { 
  FileText, Upload, ExternalLink, CheckCircle2, 
  MessageSquare, Award, Clock, X, Eye, File as FileIcon, ChevronDown, ChevronUp 
} from "lucide-react";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface AssignmentProps {
  lecture: {
    id: string;
    title: string;
    description: string;
    resources: Resource[];
  };
}

const AssignmentComponent: React.FC<AssignmentProps> = ({ lecture }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // New State for collapsing/expanding the submission area
  const [isExpanded, setIsExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [status, setStatus] = useState<"NOT_SUBMITTED" | "SUBMITTED" | "GRADED">("NOT_SUBMITTED");
  
  // --- Data Fetching ---
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/lecture/${lecture.id}/assignment-status`);
        const data = await res.json();
        if (data) {
          setStatus(data.status);
          setSubmissionData(data.submission);
          // Auto-expand if already submitted so they see the status immediately
          if (data.status !== "NOT_SUBMITTED") setIsExpanded(true);
        }
      } catch (err) {
        console.error("Error fetching assignment status", err);
      } finally {
        setLoading(false);
      }
    };
    if (lecture.id) fetchStatus();
  }, [lecture.id]);

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      showToast.success("PDF Selected");
    }
  };
  
  const handleCancelSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lectureId", lecture.id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assignment/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setIsSubmitted(true);
        setFile(null);
        setPreviewUrl(null);
        setStatus("SUBMITTED");
        showToast.success("Assignment submitted successfully!");
      } else {
        throw new Error("Failed to upload");
      }
    } catch (error) {
      console.error("Submission error:", error);
      showToast.error("Submission failed.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-10 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-40 bg-gray-100 rounded-xl mt-8"></div>
      </div>
    );
  }

  return (
    // Reduced padding and spacing for a tighter layout
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      
      {/* --- HEADER SECTION --- */}
      <div className="space-y-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-[11px] font-bold uppercase tracking-wider">
          Assignment
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
          {lecture.title}
        </h1>
        <div className="prose prose-sm md:prose-base text-gray-600 max-w-none break-words whitespace-pre-wrap">
          {lecture.description}
        </div>
      </div>

      {/* --- RESOURCES GRID --- */}
      {lecture.resources && lecture.resources.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference Materials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lecture.resources.map((res: any) => (
              <a 
                key={res.id} 
                href={res.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                    {res.title}
                  </span>
                </div>
                <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Removed the <hr /> to reduce visual noise and gap */}

      {/* --- COLLAPSIBLE SUBMISSION CARD --- */}
      <div className={`overflow-hidden rounded-xl border transition-all duration-300 ${
        isExpanded 
          ? "bg-white border-gray-200 shadow-lg ring-1 ring-gray-100" // Expanded style
          : "bg-gray-50 border-gray-200 hover:bg-white hover:border-blue-300 cursor-pointer" // Collapsed style
      }`}>
        
        {/* Toggle Header */}
        <div 
          onClick={() => {
             // Only toggle if not already submitted/graded (to prevent hiding status accidentally)
             if (status === "NOT_SUBMITTED") setIsExpanded(!isExpanded);
          }}
          className={`flex items-center justify-between p-4 ${isExpanded ? "border-b border-gray-100" : ""}`}
        >
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${isExpanded ? "bg-blue-100 text-blue-600" : "bg-white text-gray-500 shadow-sm"}`}>
                <Upload size={20} />
             </div>
             <div>
                <h3 className="font-bold text-gray-900 text-base">Your Work</h3>
                {!isExpanded && status === "NOT_SUBMITTED" && (
                   <p className="text-xs text-gray-500">Click to upload your submission</p>
                )}
             </div>
          </div>
          
          {/* Toggle Icon (Only show if not submitted, or allow toggling for submitted too if desired) */}
          {status === "NOT_SUBMITTED" && (
             <div className="text-gray-400">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
             </div>
          )}
        </div>

        {/* Expandable Content Area */}
        {isExpanded && (
          <div className="p-4 md:p-8 animate-in slide-in-from-top-2 fade-in duration-200">
            
            {/* STATE: NOT SUBMITTED */}
            {status === "NOT_SUBMITTED" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">Upload Assignment</h3>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                      PDF format only. Ensure all questions are answered before submitting.
                    </p>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="w-full">
                  {!file ? (
                    <label className="group relative flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all">
                      {/* Height reduced from 40 to 28 */}
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-105 transition-transform">
                          <Upload size={18} className="text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          <span className="text-blue-600 font-bold hover:underline">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PDF (MAX. 10MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        ref={fileInputRef} 
                      />
                    </label>
                  ) : (
                    <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-3 animate-in fade-in slide-in-from-bottom-1">
                      {/* Tighter padding (p-3) and rounded-lg for a smaller profile */}
                      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
                        {/* File Info */}
                        <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <FileIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate text-xs">{file.name}</p>
                            <p className="text-[10px] text-blue-600 font-medium leading-none">Ready to submit</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row w-full md:w-auto gap-2">
                          {previewUrl && (
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            >
                              <Eye size={14} /> Preview
                            </a>
                          )}
                          <button
                            onClick={handleCancelSelection}
                            disabled={isUploading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={isUploading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70"
                          >
                            {isUploading ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>Submit <CheckCircle2 size={14} /></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* STATE: SUBMITTED (PENDING) */}
            {status === "SUBMITTED" && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full shrink-0">
                  <Clock size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">Assignment Under Review</h3>
                  <p className="text-sm text-gray-500">
                    Your work has been submitted successfully.
                  </p>
                  <div className="pt-2">
                    <a href={submissionData?.fileUrl} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline">
                      View Submitted File <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* STATE: GRADED */}
            {status === "GRADED" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-green-200 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full shrink-0">
                      <Award size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Graded</h3>
                      <p className="text-sm text-green-700 font-medium">Complete</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Your Score</span>
                    <span className="text-3xl font-black text-green-600 tracking-tight">
                      {submissionData?.grade}<span className="text-lg text-gray-400 font-medium">/100</span>
                    </span>
                  </div>
                </div>

                {submissionData?.feedback && (
                  <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                      <MessageSquare size={16} className="text-green-600" /> 
                      Instructor Feedback
                    </div>
                    <blockquote className="text-gray-600 text-sm leading-relaxed border-l-4 border-green-200 pl-4 italic">
                      "{submissionData.feedback}"
                    </blockquote>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <a 
                    href={submissionData?.fileUrl} 
                    target="_blank" 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    View Final Submission <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentComponent;