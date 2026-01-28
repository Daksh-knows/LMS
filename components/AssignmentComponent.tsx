"use client";
import React, { useState } from "react";
import { FileText, Upload, ExternalLink, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast"; // Import toast

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
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      setFile(selectedFile);
      toast.success(`${selectedFile.name} selected`);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    // Start loading toast
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
        setIsSubmitted(true);
        setFile(null);
        // Update toast to success
        toast.success("Assignment submitted successfully!", { id: loadingToast });
      } else {
        throw new Error("Failed to upload");
      }
    } catch (error) {
      console.error("Submission error:", error);
      // Update toast to error
      toast.error("Submission failed. Please try again.", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
          Assignment Task
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">{lecture.title}</h1>
        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
          {lecture.description}
        </p>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Reference Materials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lecture.resources && lecture.resources.length > 0 && lecture.resources.map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 truncate">{res.title}</span>
              </div>
              <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
            </a>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Submission Area */}
      <div className="bg-blue-50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-blue-900">Submit Your Work</h3>
            <p className="text-sm text-blue-700">Upload your completed assignment in PDF format.</p>
          </div>

          {!isSubmitted ? (
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <label className="relative cursor-pointer bg-white border-2 border-dashed border-blue-300 rounded-xl px-6 py-4 hover:bg-blue-100 hover:border-blue-400 transition-all w-full md:w-64 text-center">
                <input 
                   type="file" 
                   accept=".pdf" 
                   className="hidden" 
                   onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-1">
                   <span className="text-sm font-bold text-blue-600 truncate max-w-[200px]">
                     {file ? file.name : "Select PDF File"}
                   </span>
                   {!file && <span className="text-[10px] text-gray-400">Max size 5MB</span>}
                </div>
              </label>
              
              {file && (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all"
                >
                  {isUploading ? "Uploading..." : <><Upload size={18} /> Submit Assignment</>}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-green-700 bg-green-100/50 px-6 py-4 rounded-xl border border-green-200">
              <CheckCircle2 size={24} className="text-green-600" />
              <div className="flex flex-col">
                <span className="font-bold">Assignment Submitted!</span>
                {/* <button 
                  onClick={() => setIsSubmitted(false)} 
                  className="text-xs text-green-700 underline text-left hover:text-green-900"
                >
                  Edit submission
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentComponent;