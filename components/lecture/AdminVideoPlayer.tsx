"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { showToast } from "@/utils/Toast";
import { HelpCircle, X, Plus, Trash2, Image, Clock, Edit } from "lucide-react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";

import { useSession } from 'next-auth/react';
import YoutubeVideoPlayer from '@/components/lecture/YoutubeVideoPlayer';

enum VideoQuestionType {
  MCQ = "MCQ"
}

interface Props {
  videoUrl: string;
  lectureId: string;
  seekTo: string | null;
  onSeekComplete: () => void;
  playerRef?: React.RefObject<any>;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  onTimeUpdate?: (e: any) => void;
}

const AdminVideoPlayer: React.FC<Props> = ({ 
  videoUrl, 
  lectureId, 
  playerRef, 
  isPlaying: parentIsPlaying, 
  setIsPlaying: parentSetIsPlaying,
  onTimeUpdate,
  seekTo = null,
  onSeekComplete = () => {}
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const controllerRef = useRef<any>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Fallback state if parent doesn't manage isPlaying
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  
  const isPlaying = parentIsPlaying !== undefined ? parentIsPlaying : localIsPlaying;
  const setIsPlaying = parentSetIsPlaying !== undefined ? parentSetIsPlaying : setLocalIsPlaying;

  // seek to specific time if provided via props
  useEffect(() => {
    if (seekTo !== null && controllerRef.current && controllerRef.current.media) {
      // Helper function to parse time
      const parseTimeToSeconds = (timeStr: string | null): number => {
        if (!timeStr) return 0;
        let seconds = 0;
        if (timeStr.includes(':')) {
          const parts = timeStr.split(':').map(Number);
          if (parts.length === 2) {
            seconds = parts[0] * 60 + parts[1];
          } else if (parts.length === 3) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }
        } else {
          seconds = parseFloat(timeStr);
        }
        return isNaN(seconds) ? 0 : seconds;
      };

      const timeToSeek = parseTimeToSeconds(seekTo);

      if (timeToSeek > 0) {
        try {
          const mediaElement = controllerRef.current.media;
          if (mediaElement && mediaElement.currentTime !== undefined) {
            mediaElement.currentTime = timeToSeek;
            
            setTimeout(() => {
              setIsPlaying(true);
              if (controllerRef.current) {
                controllerRef.current.paused = false;
              }
            }, 100);
          }
        } catch (error) {
          console.error("Seek error:", error);
        }
      }

      onSeekComplete();
    }
  }, [seekTo, onSeekComplete]);

  // Interactive question form states
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [questionType, setQuestionType] = useState<string>("MCQ");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!lectureId) return;
    try {
      const res = await fetch(`/api/lecture/${lectureId}/video-questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch video questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [lectureId]);

  const handleOpenForm = () => {
    setIsPlaying(false);
    if (controllerRef.current) {
      controllerRef.current.paused = true;
    }
    const mediaElement = controllerRef.current?.media;
    const rawTime = mediaElement ? mediaElement.currentTime : 0;
    const safeTime = isNaN(rawTime) ? 0 : rawTime;
    setCurrentQuestionTime(safeTime);
    setQuestionText("");
    setOptions(["", ""]);
    setCorrectAnswerIndex(0);
    setImageFile(null);
    setImagePreviewUrl(null);
    setEditingQuestionId(null);
    setShowForm(true);
  };

  const handleEditQuestion = (q: any) => {
    setIsPlaying(false);
    if (controllerRef.current) {
      controllerRef.current.paused = true;
    }
    const mediaElement = controllerRef.current?.media;
    if (mediaElement && mediaElement.currentTime !== undefined) {
      mediaElement.currentTime = q.timestamp;
    }
    setCurrentQuestionTime(q.timestamp);
    setQuestionType(q.type);
    setQuestionText(q.text);
    setOptions(q.options && q.options.length > 0 ? q.options : ["", ""]);
    
    // Find correct answer index
    const correctIdx = q.options.findIndex((opt: string) => opt.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim());
    setCorrectAnswerIndex(correctIdx >= 0 ? correctIdx : 0);
    
    setImageFile(null);
    setImagePreviewUrl(q.imageUrl || null);
    setEditingQuestionId(q.id);
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch(`/api/lecture/${lectureId}/video-questions?questionId=${questionId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error("Failed to delete question");
      }
      showToast.success("Question deleted successfully");
      setShowForm(false);
      setEditingQuestionId(null);
      fetchQuestions();
    } catch (error) {
      console.error("[DELETE_QUESTION_ERROR]", error);
      showToast.error("Failed to delete question");
    } finally {
      setIsSaving(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!questionText.trim()) {
      showToast.error("Question text is required");
      return;
    }

    const filteredOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      showToast.error("Please configure at least 2 options");
      return;
    }

    const correctText = options[correctAnswerIndex]?.trim();
    if (!correctText) {
      showToast.error("The selected correct option cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      let uploadedImageUrl = imagePreviewUrl; // Retain existing image if editing

      // 1. Upload new image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload/file", {
          method: "POST",
          body: formData
        });
        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      // 2. Save or Update video question
      let saveRes;
      if (editingQuestionId) {
        // PUT (Edit)
        saveRes = await fetch(`/api/lecture/${lectureId}/video-questions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingQuestionId,
            type: questionType,
            text: questionText.trim(),
            imageUrl: uploadedImageUrl,
            options: filteredOptions,
            correctAnswer: correctText,
          })
        });
      } else {
        // POST (Create)
        saveRes = await fetch(`/api/lecture/${lectureId}/video-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: currentQuestionTime,
            type: questionType,
            text: questionText.trim(),
            imageUrl: uploadedImageUrl,
            options: filteredOptions,
            correctAnswer: correctText,
          })
        });
      }

      if (!saveRes.ok) {
        throw new Error("Failed to save question");
      }

      showToast.success(editingQuestionId ? "Interactive question updated successfully!" : "Interactive question saved successfully!");
      
      // Reset form states
      setShowForm(false);
      setQuestionText("");
      setOptions(["", ""]);
      setCorrectAnswerIndex(0);
      setImageFile(null);
      setImagePreviewUrl(null);
      setEditingQuestionId(null);

      // Reload list dynamically
      fetchQuestions();

    } catch (error) {
      console.error("[SAVE_QUESTION_ERROR]", error);
      showToast.error("Could not save question. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // updates mounted
  useEffect(() => { setIsMounted(true); }, []);

  // handler to toggle play/pause
  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    if (controllerRef.current) {
      controllerRef.current.paused = !newPlayingState;
    }
  };

  if (!isMounted) return null;

  if (!videoUrl || videoUrl.trim() === "") { 
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-white">No video URL provided.</p>
      </div>
    );
  }

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  if (isYouTube) {
    return <YoutubeVideoPlayer videoUrl={videoUrl} markAsComplete={async () => {}} hasCompleted={false} isMarkingComplete={false} />;
  }
  console.log("Video url" , videoUrl) ;
  return (
    <div className="space-y-8 w-full">
      <MediaController
        ref={controllerRef}
        style={{
          width: "100%",
          aspectRatio: "16/9",
        }}
        noHotkeys={showForm}
      >
      <ReactPlayer
        slot="media"
        ref={playerRef}
        src={videoUrl} 
        controls={false}
        width="100%"
        height="100%"
        playing={isPlaying}
        playsInline
        onReady={() => setIsVideoLoading(false)}
        onWaiting={() => setIsVideoLoading(true)}
        onPlaying={() => setIsVideoLoading(false)}
        onTimeUpdate={onTimeUpdate}
      />



      {/* --- LOADER OVERLAY --- */}
      {isVideoLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 transition-all">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#FFCC59]/20 border-t-[#FFCC59] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-[#FFCC59] rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="mt-4 text-white font-bold text-sm tracking-widest uppercase animate-pulse">
            Preparing Lecture...
          </p>
        </div>
      )}

      <div
        className="absolute z-10 cursor-default"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          cursor: 'default',
          height: 'calc(100% - 3.5rem)',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* --- CONTROLS --- */}
      <MediaControlBar>
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 text-white hover:text-blue-400 transition-colors"
          title={isPlaying ? "Pause" : "Play"}
          style={{ backgroundColor: 'var(--media-secondary-color, rgb(20 20 30 / .7))' }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaPlaybackRateButton />
        <MediaFullscreenButton />

        <button
          type="button"
          onClick={handleOpenForm}
          className="p-2 text-white hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
          title="Add interactive question at current timestamp"
          style={{ backgroundColor: 'var(--media-secondary-color, rgb(20 20 30 / .7))' }}
        >
          <HelpCircle size={18} />
          <span className="text-xs font-bold hidden sm:inline">Add Question</span>
        </button>
      </MediaControlBar>

      {showForm && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-(--sidebar-background) rounded-2xl shadow-2xl border border-(--course-sidebar-border) w-full max-w-lg overflow-hidden flex flex-col max-h-[95%] text-(--text-color) theme-transition">
            {/* Header */}
            <div className="bg-(--sidebar-background)/50 px-5 py-4 border-b border-(--course-sidebar-border) flex justify-between items-center theme-transition">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-blue-600 animate-pulse" size={20} />
                <span className="font-bold text-(--text-color) text-sm sm:text-base theme-transition">Add Timestamp Question ({new Date(currentQuestionTime * 1000).toISOString().substr(14, 5)})</span>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-(--text-color) opacity-60 hover:opacity-100 hover:bg-(--sidebar-nav-bg-hover) p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-left">
              {/* Question Type Selection */}
              <div>
                <label className="block text-xs font-bold text-(--text-color) opacity-60 uppercase tracking-wider mb-1.5 theme-transition">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full px-3 py-2 bg-(--sidebar-background) border border-(--course-sidebar-border) rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-(--text-color) font-medium theme-transition"
                >
                  {Object.values(VideoQuestionType).map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>

              {/* MCQ Form Details */}
              {questionType === VideoQuestionType.MCQ && (
                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-xs font-bold text-(--text-color) opacity-60 uppercase tracking-wider mb-1.5 theme-transition">Question Text</label>
                    <textarea
                      rows={3}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="What is displayed at this timestamp?"
                      className="w-full px-3 py-2 bg-(--sidebar-background) border border-(--course-sidebar-border) rounded-xl text-sm text-(--text-color) focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 theme-transition"
                    />
                  </div>

                  {/* MCQ Options */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-(--text-color) opacity-60 uppercase tracking-wider theme-transition">Configure Options</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (options.length < 6) {
                            setOptions([...options, ""]);
                          }
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer theme-transition"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_answer_radio"
                            checked={correctAnswerIndex === idx}
                            onChange={() => setCorrectAnswerIndex(idx)}
                            className="w-4 h-4 text-blue-600 border-(--course-sidebar-border) focus:ring-blue-500 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...options];
                              updated[idx] = e.target.value;
                              setOptions(updated);
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 px-3 py-1.5 border border-(--course-sidebar-border) rounded-lg text-sm bg-(--sidebar-background) text-(--text-color) theme-transition"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (options.length > 2) {
                                const updated = options.filter((_, i) => i !== idx);
                                setOptions(updated);
                                if (correctAnswerIndex >= updated.length) {
                                  setCorrectAnswerIndex(updated.length - 1);
                                }
                              }
                            }}
                            className="p-1.5 text-(--text-color) opacity-60 hover:text-red-500 hover:bg-red-50/20 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image from computer */}
                  <div>
                    <label className="block text-xs font-bold text-(--text-color) opacity-60 uppercase tracking-wider mb-1.5 flex items-center gap-1 theme-transition">
                      <Image size={14} />
                      Upload Image from Computer
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImageFile(file);
                        if (file) {
                          setImagePreviewUrl(URL.createObjectURL(file));
                        } else {
                          setImagePreviewUrl(null);
                        }
                      }}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-(--sidebar-nav-bg-hover) file:text-(--text-color) hover:file:bg-(--sidebar-nav-bg-hover) cursor-pointer theme-transition"
                    />
                    {imagePreviewUrl && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-(--course-sidebar-border) bg-(--sidebar-background)/50 max-h-40 flex items-center justify-center theme-transition">
                        <img src={imagePreviewUrl} alt="Preview" className="max-h-40 object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 bg-slate-900/70 text-white hover:bg-slate-900 p-1 rounded-full transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-(--sidebar-background)/50 px-5 py-4 border-t border-(--course-sidebar-border) flex justify-between items-center gap-2 theme-transition">
              <div>
                {editingQuestionId && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleDelete(editingQuestionId)}
                    className="px-4 py-2 bg-red-50/20 hover:bg-red-100/20 text-red-500 hover:text-red-600 font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-(--sidebar-background) hover:bg-(--sidebar-nav-bg-hover) text-(--text-color) font-semibold text-sm rounded-xl border border-(--course-sidebar-border) transition-colors cursor-pointer theme-transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MediaController>

    {/* Questions list below the player */}
    <div className="bg-(--sidebar-background) p-6 rounded-3xl border border-(--course-sidebar-border) shadow-sm space-y-4 text-(--text-color) theme-transition">
      <h3 className="font-bold text-(--text-color) text-sm uppercase tracking-wider flex items-center justify-between border-b border-(--course-sidebar-border) pb-3 theme-transition">
        <span>Configured Interactive Questions ({questions.length})</span>
        <span className="text-[10px] text-(--text-color) opacity-60 font-bold uppercase tracking-wider">Click any question to seek & edit</span>
      </h3>

      {questions.length === 0 ? (
        <div className="text-center py-10 text-(--text-color) opacity-50 bg-(--sidebar-background)/50 rounded-2xl border border-dashed border-(--course-sidebar-border) theme-transition">
          <HelpCircle size={32} className="mx-auto mb-2 text-slate-300 animate-bounce" />
          <p className="text-sm font-medium">No interactive questions added yet.</p>
          <p className="text-xs mt-1">Play the video and click "Add Question" at any timestamp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => handleEditQuestion(q)}
              className="group border border-(--course-sidebar-border) hover:border-blue-200 hover:bg-blue-500/10 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-3 text-left relative theme-transition"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    <Clock size={11} />
                    {new Date(q.timestamp * 1000).toISOString().substr(14, 5)}
                  </span>
                  <span className="text-[10px] font-bold bg-(--sidebar-nav-bg-hover) text-(--text-color) opacity-80 uppercase tracking-wider px-2 py-0.5 rounded border border-(--course-sidebar-border) theme-transition">
                    {q.type}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-(--text-color) line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors theme-transition">
                  {q.text}
                </h4>
                
                {q.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-(--course-sidebar-border) max-h-24 bg-(--sidebar-background) flex items-center justify-center theme-transition">
                    <img src={q.imageUrl} alt="Thumbnail" className="max-h-24 object-contain" />
                  </div>
                )}

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt: string, oIdx: number) => {
                      const isCorrect = opt.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                      return (
                        <div
                          key={oIdx}
                          className={`px-2 py-1 text-[11px] rounded border font-semibold truncate ${isCorrect ? "bg-green-500/20 border-green-500/30 text-green-600" : "bg-(--sidebar-background) border-(--course-sidebar-border) text-(--text-color) opacity-80 theme-transition"}`}
                        >
                          {oIdx + 1}. {opt}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-1.5 border-t border-slate-50 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditQuestion(q);
                  }}
                  className="p-1 px-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit size={11} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(q.id);
                  }}
                  className="p-1 px-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
};

export default AdminVideoPlayer;