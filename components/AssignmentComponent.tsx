"use client";
import React, { useEffect, useRef, useState } from "react";
import { FileText, Upload, ExternalLink, CheckCircle2, MessageSquare, Award, Clock, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // State for preview
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [status, setStatus] = useState<"NOT_SUBMITTED" | "SUBMITTED" | "GRADED">("NOT_SUBMITTED");
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/lecture/${lecture.id}/assignment-status`);
        const data = await res.json();
        if (data) {
          setStatus(data.status);
          setSubmissionData(data.submission);
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
        toast.error("Please select a PDF file");
        return;
      }
      
      // Cleanup old preview URL if exists
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setPreviewUrl(url);
      toast.success(`${selectedFile.name} selected`);
    }
  };
  
  const handleCancelSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    toast.dismiss(); 
  };

  const handleSubmit = async () => {
    if (!file) return;

    const loadingToast = toast.loading("Uploading assignment...");
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
        toast.success("Assignment submitted successfully!", { id: loadingToast });
      } else {
        throw new Error("Failed to upload");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Please try again.", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Checking submission status...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase">
          Assignment Task
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">{lecture.title}</h1>
        <p className="text-gray-600 whitespace-pre-wrap">{lecture.description}</p>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lecture?.resources?.map((res: any) => (
          <a key={res.id} href={res.url} target="_blank" className="flex items-center justify-between p-4 bg-white border rounded-xl hover:border-blue-500 transition-all group">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText size={20} className="text-blue-600" />
              <span className="text-sm font-semibold truncate">{res.title}</span>
            </div>
            <ExternalLink size={16} className="text-gray-400" />
          </a>
        ))}
      </div>

      <hr className="border-gray-100" />

      {/* Dynamic Submission Area */}
      <div className={`rounded-2xl p-6 md:p-8 border shadow-sm ${
        status === "GRADED" ? "bg-green-50 border-green-100" : 
        status === "SUBMITTED" ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
      }`}>

        {/* CASE 1: NOT SUBMITTED */}
        {status === "NOT_SUBMITTED" && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-blue-900">Submit Your Work</h3>
                  <p className="text-sm text-blue-700">Upload your PDF assignment to complete this lecture.</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <label className="cursor-pointer bg-white border-2 border-dashed border-blue-300 rounded-xl px-6 py-4 hover:bg-blue-100 transition-all flex flex-col items-center justify-center text-center">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        ref={fileInputRef} 
                      />
                      <span className="text-sm font-bold text-blue-600 block truncate max-w-full">
                        {file ? file.name : "Select PDF File"}
                      </span>
                    </label>

                    {file && (
                        <div className="flex flex-wrap items-center justify-end gap-3 mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                          
                          {/* --- PREVIEW BUTTON --- */}
                          <a
                            href={previewUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
                          >
                            <Eye size={16} />
                            Preview
                          </a>

                          {/* --- CANCEL BUTTON --- */}
                          <button
                            onClick={handleCancelSelection}
                            type="button"
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 hover:text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={16} />
                            Cancel
                          </button>

                          {/* --- SUBMIT BUTTON --- */}
                          <button
                            onClick={handleSubmit}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                          >
                            {isUploading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Submit
                              </>
                            )}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
        )}

        {/* CASE 2: SUBMITTED (PENDING GRADE) */}
        {status === "SUBMITTED" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-800">
              <Clock size={24} className="text-amber-600" />
              <div>
                <p className="font-bold">Assignment Submitted</p>
                <p className="text-sm">Your work is currently being reviewed by the instructor.</p>
              </div>
            </div>
            <a href={submissionData?.fileUrl} target="_blank" className="text-sm text-amber-700 underline flex items-center gap-1">
              <ExternalLink size={14} /> View your submission
            </a>
          </div>
        )}

        {/* CASE 3: GRADED */}
        {status === "GRADED" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-green-800">
                <Award size={32} className="text-green-600" />
                <div>
                  <p className="font-bold text-xl">Graded</p>
                  <p className="text-sm text-green-700">Well done! You have completed this assignment.</p>
                </div>
              </div>
              <div className="bg-white px-6 py-2 rounded-2xl border-2 border-green-200 text-center">
                <span className="block text-xs uppercase font-bold text-gray-400">Score</span>
                <span className="text-2xl font-black text-green-600">{submissionData?.grade}/100</span>
              </div>
            </div>

            {submissionData?.feedback && (
              <div className="bg-white/60 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2 text-green-800 font-bold text-sm">
                  <MessageSquare size={16} /> Instructor Feedback
                </div>
                <p className="text-gray-700 text-sm italic leading-relaxed">
                  "{submissionData.feedback}"
                </p>
              </div>
            )}
            
            <a href={submissionData?.fileUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors">
              <FileText size={16} /> View Final Graded Work
            </a>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssignmentComponent; 