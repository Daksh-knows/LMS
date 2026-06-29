"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { showToast } from "@/utils/Toast";
import { HelpCircle, X, Plus, Trash2, Image } from "lucide-react";
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
  onTimeUpdate
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

  // Interactive question form states
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [questionType, setQuestionType] = useState<string>("MCQ");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleOpenForm = () => {
    setIsPlaying(false);
    if (controllerRef.current) {
      controllerRef.current.paused = true;
    }
    const mediaElement = controllerRef.current?.media;
    const rawTime = mediaElement ? mediaElement.currentTime : 0;
    const safeTime = isNaN(rawTime) ? 0 : rawTime;
    setCurrentQuestionTime(safeTime);
    setShowForm(true);
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
      let uploadedImageUrl = null;

      // 1. Upload image if selected
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

      // 2. Save video question
      const saveRes = await fetch(`/api/lecture/${lectureId}/video-questions`, {
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

      if (!saveRes.ok) {
        throw new Error("Failed to save question");
      }

      showToast.success("Interactive question saved successfully!");
      
      // Reset form states
      setShowForm(false);
      setQuestionText("");
      setOptions(["", ""]);
      setCorrectAnswerIndex(0);
      setImageFile(null);
      setImagePreviewUrl(null);

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

  return (
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
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[95%] text-slate-800">
            {/* Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-blue-600 animate-pulse" size={20} />
                <span className="font-bold text-slate-800 text-sm sm:text-base">Add Timestamp Question ({new Date(currentQuestionTime * 1000).toISOString().substr(14, 5)})</span>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-left">
              {/* Question Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-medium"
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Question Text</label>
                    <textarea
                      rows={3}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="What is displayed at this timestamp?"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                    />
                  </div>

                  {/* Select Correct Answer Instruction Banner */}
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs flex flex-col gap-1">
                    <span className="font-bold">Correct Answer Selection:</span>
                    <span>Please click the circular radio button on the left of whichever option is correct, or select it from the dropdown below.</span>
                  </div>

                  {/* MCQ Options */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Options</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (options.length < 6) {
                            setOptions([...options, ""]);
                          }
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
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
                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
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
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800"
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
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explicit Correct Answer Selection Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Designate Correct Answer</label>
                    <select
                      value={correctAnswerIndex}
                      onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-semibold"
                    >
                      {options.map((opt, idx) => (
                        <option key={idx} value={idx}>
                          Option {idx + 1} {opt.trim() ? `— "${opt.trim().substring(0, 30)}${opt.trim().length > 30 ? "..." : ""}"` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image from computer */}
                  {/* <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
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
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {imagePreviewUrl && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-40 flex items-center justify-center">
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
                  </div> */}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer"
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
      )}
    </MediaController>
  );
};

export default AdminVideoPlayer;
