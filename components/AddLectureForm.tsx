"use client";

import React, { useState, useEffect } from "react";
import { addCourseItem, updateCourseItem } from "@/lib/admin-actions"; // Updated import names
import { 
  Loader2, Clock, Link2, Type, Plus, Trash2, 
  FileText, X, AlignLeft, CheckCircle, FileQuestion, UploadCloud 
} from "lucide-react";

// --- Types ---
type ItemType = "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

interface Props {
  courseId: string;
  sectionId: string;
  initialData?: any; // relaxed type to handle the polymorphic data
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddLectureForm({ courseId, sectionId, initialData, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  
  // --- Common State ---
  const [type, setType] = useState<ItemType>("VIDEO");
  const [title, setTitle] = useState("");
  const [isFree, setIsFree] = useState(false);

  // --- Video State ---
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [attachments, setAttachments] = useState<Resource[]>([]);

  // --- Text State ---
  const [htmlContent, setHtmlContent] = useState("");

  // --- Quiz State ---
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // --- Assignment State ---
  const [description, setDescription] = useState(""); // Instructions

  // --- Load Initial Data ---
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || "VIDEO");
      setTitle(initialData.title);
      setIsFree(initialData.isFree);
      
      // Populate specific fields based on type
      if (initialData.type === "VIDEO") {
        setVideoUrl(initialData.videoUrl || "");
        setDuration(initialData.duration?.toString() || "");
        setAttachments(initialData.attachments || []);
      } else if (initialData.type === "TEXT") {
        setHtmlContent(initialData.htmlContent || "");
      } else if (initialData.type === "ASSIGNMENT") {
        setDescription(initialData.description || "");
        setAttachments(initialData.attachments || []);
      } else if (initialData.type === "QUIZ") {
        // Map backend questions to frontend state
        if (initialData.questions) {
          const mappedQuestions = initialData.questions.map((q: any) => ({
            text: q.text,
            options: q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect }))
          }));
          setQuizQuestions(mappedQuestions);
        }
      }
    }
  }, [initialData]);

  // --- Helpers for Attachments ---
  const addAttachmentRow = () => {
    setAttachments([...attachments, { title: "", url: "", type: "FILE" }]);
  };
  const removeAttachmentRow = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  const updateAttachment = (index: number, field: keyof Resource, value: string) => {
    const newAttachments = [...attachments];
    newAttachments[index] = { ...newAttachments[index], [field]: value };
    setAttachments(newAttachments);
  };

  // --- Helpers for Quiz ---
  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
  };
  const updateQuestionText = (qIdx: number, text: string) => {
    const newQ = [...quizQuestions];
    newQ[qIdx].text = text;
    setQuizQuestions(newQ);
  };
  const addOption = (qIdx: number) => {
    const newQ = [...quizQuestions];
    newQ[qIdx].options.push({ text: "", isCorrect: false });
    setQuizQuestions(newQ);
  };
  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    const newQ = [...quizQuestions];
    newQ[qIdx].options[oIdx].text = text;
    setQuizQuestions(newQ);
  };
  const setCorrectOption = (qIdx: number, oIdx: number) => {
    const newQ = [...quizQuestions];
    // Reset all to false, set selected to true
    newQ[qIdx].options.forEach(o => o.isCorrect = false);
    newQ[qIdx].options[oIdx].isCorrect = true;
    setQuizQuestions(newQ);
  };
  const removeQuestion = (qIdx: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx));
  };
  const removeOption = (qIdx: number, oIdx: number) => {
    const newQ = [...quizQuestions];
    newQ[qIdx].options = newQ[qIdx].options.filter((_, i) => i !== oIdx);
    setQuizQuestions(newQ);
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Prepare payload
    const payload: any = {
      courseId,
      moduleId: sectionId,
      title,
      type,
      isFree,
    };

    // Add type-specific data
    if (type === "VIDEO") {
      payload.videoUrl = videoUrl;
      payload.duration = duration;
      payload.attachments = attachments.filter(a => a.title && a.url);
    } else if (type === "TEXT") {
      payload.htmlContent = htmlContent;
    } else if (type === "ASSIGNMENT") {
      payload.description = description;
      payload.attachments = attachments.filter(a => a.title && a.url);
    } else if (type === "QUIZ") {
      payload.quizQuestions = quizQuestions;
    }

    let result;
    if (initialData) {
      result = await updateCourseItem(initialData.id, payload);
    } else {
      result = await addCourseItem(payload);
    }
    
    if (result.success) {
      onSuccess();
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* --- Header & Type Selector --- */}
      <div className="border-b border-gray-100 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData ? "Edit Content" : "Add New Content"}
          </h3>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Type Switcher */}
        {!initialData && (
          <div className="grid grid-cols-4 gap-2 p-1 bg-gray-100 rounded-xl">
            {(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"] as ItemType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === t 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- Common Inputs --- */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Title</label>
          <div className="relative group">
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction / Quiz 1"
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input 
            type="checkbox" 
            checked={isFree} 
            onChange={(e) => setIsFree(e.target.checked)} 
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
          />
          <span className="text-sm font-medium text-gray-700">Allow Free Preview?</span>
        </label> */}
      </div>

      {/* --- VIDEO FORM --- */}
      {type === "VIDEO" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration (min)</label>
              <div className="relative group">
                <input 
                  required
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="10"
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Video Embed URL</label>
              <div className="relative group">
                <input 
                  required
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
          
          <AttachmentsSection 
            attachments={attachments} 
            onAdd={addAttachmentRow} 
            onRemove={removeAttachmentRow} 
            onUpdate={updateAttachment} 
            label="Video Resources"
          />
        </div>
      )}

      {/* --- TEXT FORM --- */}
      {type === "TEXT" && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Text Content (HTML)</label>
          <div className="relative">
             <textarea 
               required
               value={htmlContent}
               onChange={(e) => setHtmlContent(e.target.value)}
               placeholder="<h1>Write your content here...</h1>"
               className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
             />
             <AlignLeft className="absolute right-4 top-4 text-gray-400" size={18} />
          </div>
          <p className="text-[10px] text-gray-400 pl-1">Supports HTML tags for formatting.</p>
        </div>
      )}

      {/* --- ASSIGNMENT FORM --- */}
      {type === "ASSIGNMENT" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
           <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Instructions</label>
            <textarea 
               required
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="Describe the task..."
               className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>
          
          <AttachmentsSection 
            attachments={attachments} 
            onAdd={addAttachmentRow} 
            onRemove={removeAttachmentRow} 
            onUpdate={updateAttachment} 
            label="Supporting Documents"
          />
        </div>
      )}

      {/* --- QUIZ FORM --- */}
      {type === "QUIZ" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileQuestion size={14} /> Quiz Questions
             </label>
             <button type="button" onClick={addQuestion} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
               <Plus size={14} /> Add Question
             </button>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 relative group">
                <button 
                  type="button" 
                  onClick={() => removeQuestion(qIdx)}
                  className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
                
                <div className="mb-3">
                  <span className="text-xs font-bold text-gray-400 mb-1 block">Question {qIdx + 1}</span>
                  <input 
                    required
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none font-medium"
                  />
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectOption(qIdx, oIdx)}
                        className={`p-1 rounded-full ${opt.isCorrect ? "text-green-500 bg-green-50" : "text-gray-300 hover:text-gray-400"}`}
                        title="Mark as correct"
                      >
                        <CheckCircle size={20} fill={opt.isCorrect ? "currentColor" : "none"} />
                      </button>
                      <input 
                        required
                        value={opt.text}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className={`flex-1 p-2 border rounded-lg outline-none text-sm ${opt.isCorrect ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"}`}
                      />
                      <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-gray-300 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qIdx)} className="text-[10px] font-bold text-blue-500 hover:underline mt-2 ml-8">
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
             {quizQuestions.length === 0 && (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                  No questions added yet.
                </div>
             )}
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div className="pt-4 flex gap-3 border-t border-gray-100 mt-6">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-200 text-gray-600 p-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="flex-[2] bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : (initialData ? "Save Changes" : "Create Content")}
        </button>
      </div>
    </form>
  );
}

// --- Sub-Component for Attachments ---
function AttachmentsSection({ attachments, onAdd, onRemove, onUpdate, label }: any) {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
           <UploadCloud size={14} /> {label}
        </label>
        <button 
          type="button"
          onClick={onAdd}
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-3">
        {attachments.map((att: any, index: number) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <div className="relative sm:w-28 shrink-0">
               <select
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none"
                value={att.type}
                onChange={(e) => onUpdate(index, "type", e.target.value)}
              >
                <option value="FILE">File</option>
                <option value="CODE">Code</option>
                <option value="LINK">Link</option>
              </select>
            </div>
            <input 
              placeholder="Title"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
              value={att.title}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
            />
            <input 
              placeholder="URL"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
              value={att.url}
              onChange={(e) => onUpdate(index, "url", e.target.value)}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {attachments.length === 0 && (
            <p className="text-center text-xs text-gray-300 italic py-2">No documents attached.</p>
        )}
      </div>
    </div>
  );
}