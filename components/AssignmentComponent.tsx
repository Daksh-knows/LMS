"use client";
import React, { useEffect, useRef, useState } from "react";
import { 
  FileText, Upload, ExternalLink, CheckCircle2, 
  MessageSquare, Award, Clock, X, Eye, File as FileIcon, ChevronDown, ChevronUp 
} from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [status, setStatus] = useState<"NOT_SUBMITTED" | "SUBMITTED" | "GRADED" | "NOT_FOUND">("NOT_SUBMITTED");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/lecture/${lecture.id}/assignment-status`);
        const data = await res.json();
        if (data) {
          setStatus(data.status);
          setSubmissionData(data.submission);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        showToast.error("Please select a PDF file");
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
        setFile(null);
        setPreviewUrl(null);
        setStatus("SUBMITTED");
        showToast.success("Assignment submitted!");
      } else {
        throw new Error("Failed to upload");
      }
    } catch (error) {
      showToast.error("Submission failed.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-10 space-y-4 animate-pulse">
        <div className="h-8 bg-foreground/10 rounded w-1/3"></div>
        <div className="h-4 bg-foreground/10 rounded w-2/3"></div>
        <div className="h-40 bg-foreground/5 rounded-xl mt-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto  space-y-6 text-foreground">
      
      {/* --- HEADER SECTION --- */}
      <div className="space-y-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-[11px] font-black uppercase tracking-[0.2em]">
          Assignment
        </span>
        <h1 className="text-2xl md:text-4xl font-black tracking-tighter">
          {lecture.title}
        </h1>
        <div className="text-foreground/60 max-w-none break-words whitespace-pre-wrap leading-relaxed">
          {lecture.description}
        </div>
      </div>

      {/* --- RESOURCES GRID --- */}
      {lecture.resources && lecture.resources.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Reference Materials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lecture.resources.map((res: any) => (
              <a 
                key={res.id} 
                href={res.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-border-muted rounded-2xl hover:border-purple-500/50 hover:bg-foreground/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText size={18} />
                  </div>
                  <span className="text-sm font-bold truncate">
                    {res.title}
                  </span>
                </div>
                <ExternalLink size={14} className="text-foreground/20 group-hover:text-purple-500 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* --- COLLAPSIBLE SUBMISSION CARD --- */}
      <div className={`overflow-hidden rounded-[2rem] border transition-all duration-500 ${
        isExpanded 
          ? "bg-white dark:bg-background border-border-muted shadow-2xl shadow-black/5" 
          : "bg-foreground/[0.02] border-border-muted hover:bg-foreground/[0.04] cursor-pointer"
      }`}>
        
        {/* Toggle Header */}
        <div 
          onClick={() => { if (status === "NOT_SUBMITTED") setIsExpanded(!isExpanded); }}
          className={`flex items-center justify-between p-6 ${isExpanded ? "border-b border-border-muted" : ""}`}
        >
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl transition-colors ${isExpanded ? "bg-purple-600 text-white" : "bg-white dark:bg-foreground/10 text-foreground/40 shadow-sm"}`}>
                <Upload size={20} strokeWidth={2.5} />
             </div>
             <div>
                <h3 className="font-black text-lg tracking-tight">Your Work</h3>
                {!isExpanded && status === "NOT_SUBMITTED" && (
                   <p className="text-xs text-foreground/40 font-medium">Click to expand and upload</p>
                )}
             </div>
          </div>
          
          {status === "NOT_SUBMITTED" && (
             <div className="text-foreground/20">
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
             </div>
          )}
        </div>

        {/* Expandable Content Area */}
        {isExpanded && (
          <div className="p-6 md:p-10 animate-in slide-in-from-top-4 duration-500 ease-out">
            
            {status === "NOT_SUBMITTED" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Upload Submission</h3>
                  <p className="text-sm text-foreground/40 mt-1 font-medium">
                    Please upload your assignment in PDF format. (Max 10MB)
                  </p>
                </div>

                <div className="w-full">
                  {!file ? (
                    <label className="group relative flex flex-col items-center justify-center w-full h-32 rounded-[1.5rem] border-2 border-dashed border-border-muted bg-foreground/[0.01] hover:bg-purple-500/[0.02] hover:border-purple-500/40 cursor-pointer transition-all">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-3 bg-white dark:bg-foreground/5 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <Upload size={20} className="text-foreground/20 group-hover:text-purple-600" />
                        </div>
                        <p className="text-sm text-foreground/60 font-bold">
                          <span className="text-purple-600">Click to upload</span> or drag and drop
                        </p>
                      </div>
                      <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                    </label>
                  ) : (
                    <div className="bg-purple-500/5 rounded-2xl border border-purple-500/20 p-4">
                      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                            <FileIcon size={24} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black truncate text-sm">{file.name}</p>
                            <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Ready to submit</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                          {previewUrl && (
                            <a href={previewUrl} target="_blank" className="flex-1 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-500/10 rounded-xl hover:bg-purple-500/20 transition-all text-center">
                              Preview
                            </a>
                          )}
                          <button onClick={handleCancelSelection} className="p-2.5 text-foreground/40 hover:text-red-500 transition-colors">
                            <X size={20} />
                          </button>
                          <button onClick={handleSubmit} disabled={isUploading} className="flex-1 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50">
                            {isUploading ? "Uploading..." : "Submit Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {status === "SUBMITTED" && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                <div className="p-4 bg-amber-500 text-white rounded-2xl shrink-0">
                  <Clock size={28} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-amber-600 dark:text-amber-400">Under Review</h3>
                  <p className="text-sm text-foreground/50 font-medium leading-relaxed">
                    Your instructor is currently reviewing your submission. You will be notified once it is graded.
                  </p>
                  <a href={submissionData?.fileUrl} target="_blank" className="inline-flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:underline">
                    View Submission <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            {status === "GRADED" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border-muted pb-8">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shrink-0">
                      <Award size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter">Evaluation Complete</h3>
                      <p className="text-sm text-emerald-600 font-black uppercase tracking-widest">Graded</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest mb-1">Total Score</span>
                    <span className="text-5xl font-black text-emerald-500 tracking-tighter">
                      {submissionData?.grade}<span className="text-xl text-foreground/20 font-bold">/100</span>
                    </span>
                  </div>
                </div>

                {submissionData?.feedback && (
                  <div className="bg-foreground/[0.02] p-6 rounded-2xl border border-border-muted">
                    <div className="flex items-center gap-2 mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40">
                      <MessageSquare size={16} className="text-emerald-500" /> 
                      Instructor Feedback
                    </div>
                    <blockquote className="text-foreground/70 text-base leading-relaxed border-l-4 border-emerald-500/30 pl-6 italic">
                      "{submissionData.feedback}"
                    </blockquote>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <a href={submissionData?.fileUrl} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all">
                    View Final PDF <ExternalLink size={14} />
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