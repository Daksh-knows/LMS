"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { BookmarkPlus, Info, Save } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import { showToast } from "@/utils/Toast";

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";
import { useSession } from 'next-auth/react';

interface Props {
  videoUrl: string;
  lectureId: string;
  seekTo: string | null;
  onSeekComplete: () => void;
  onBookmarkAdded: (bookmark: any) => void;
}

const VideoPlayer: React.FC<Props> = ({ videoUrl, lectureId, seekTo, onSeekComplete, onBookmarkAdded }) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  console.log("VideoURL :" , videoUrl)
  const controllerRef = useRef<any>(null);
  const watchStartTime = useRef<number | null>(null);
  const totalSecondsWatched = useRef<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const router = useRouter();
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [bookmark, setBookmark] = useState({ label: '', type: 'BOOKMARK', time: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalControl, setOriginalControl] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const storageKey = `watch-progress-${userId}-${lectureId}`;
  
  
  const markAsComplete = async () => {
    if (hasCompleted) return;
    setIsMarkingComplete(true);
    
    const courseId = params.courseId as string;
    try {
      const response = await fetch("/api/lecture/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId, courseId }),
      });

      if (response.ok) {
        setHasCompleted(true);
        showToast.success("Progress saved! Great job on finishing this lecture.");
        router.refresh();
      }
      else showToast.error("Couldn't save progress. Please check your connection.");
    } catch (error) {
      console.error("Manual completion error:", error);
      showToast.error("Something went wrong. Please try again later.");
    } finally {
      setIsMarkingComplete(false);
    }
  };
  
  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey);
    if (savedTime) {
      totalSecondsWatched.current = parseFloat(savedTime);
    }
  }, [lectureId, userId]);

  useEffect(() => {
    const fetchCompletionStatus = async () => {
      if (!userId || !lectureId) return;
      
      setIsLoadingStatus(true);
      try {
        const response = await fetch(`/api/lecture/status?lectureId=${lectureId}`);
        if (response.ok) {
          const data = await response.json();
          setHasCompleted(data.isCompleted);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchCompletionStatus();
  }, [lectureId, userId]);



  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    // 1. Show the tooltip immediately on mount
    setShowTooltip(true);

    // 2. Hide it after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    // 3. Cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, [lectureId]);

  //function to track user activity
    const saveWatchActivity = async () => {
      if (totalSecondsWatched.current <= 0) return;
      console.log('----------------------------------------');
      console.log("Attempting to save watch activity...");
      const minutesToSave = totalSecondsWatched.current ;
      console.log("Saving watch activity:", minutesToSave, "minutes");
      console.log('----------------------------------------');
      const success = await fetch(`/api/user/activity?userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "VIDEO_WATCH",
          duration: minutesToSave,
        }),
      });

      if (success.ok) {
        totalSecondsWatched.current = 0;
        localStorage.removeItem(storageKey); 
      }
    };

    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (isPlaying) {
        timer = setInterval(() => {
          totalSecondsWatched.current += 1;
          localStorage.setItem(storageKey, totalSecondsWatched.current.toString());
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [isPlaying, storageKey]);

    useEffect(() => {
        const heartbeat = setInterval(() => {
          if (isPlaying) {
            saveWatchActivity();
          }
        }, 30000); 
        return () => {
          clearInterval(heartbeat);
          saveWatchActivity(); 
        };
    }, [isPlaying, lectureId]);





  // --- NEW PROGRESS LOGIC ---
  // Using the native timeupdate event which MediaController passes through
  const handleTimeUpdate = async (e: any) => {
    const video = e.target;
    if (!video || !video.duration || hasCompleted) return;

    const playedFraction = video.currentTime / video.duration;

    if (playedFraction >= 0.95) {
      setHasCompleted(true);
      const courseId = params.courseId as string;

      try {
        const response = await fetch("/api/lecture/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lectureId,
            courseId,
          }),
        });

        if (response.ok) {
          console.log("Lecture marked as completed automatically!");
          router.refresh();
        }
      } catch (error) {
        console.error("Auto-complete error:", error);
      }
    }
  };

  // --- SEEKING LOGIC ---
  useEffect(() => {
    if (seekTo !== null && controllerRef.current) {
      let timeToSeek: number = 0;

      if (typeof seekTo === 'string' && seekTo.includes(':')) {
        const parts = seekTo.split(':').map(Number);
        if (parts.length === 2) {
          timeToSeek = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
          timeToSeek = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      } else {
        timeToSeek = typeof seekTo === 'string' ? parseFloat(seekTo) : seekTo;
      }

      if (!isNaN(timeToSeek)) {
        // Media-chrome allows setting time via the controller
        controllerRef.current.media.currentTime = timeToSeek;
        setIsPlaying(true);
        controllerRef.current.paused = false;
      }

      onSeekComplete();
    }
  }, [seekTo, onSeekComplete]);

  const handleOpenForm = () => {
    if (controllerRef.current) {
      const wasPaused = !isPlaying;
      setOriginalControl(wasPaused);

      const mediaElement = controllerRef.current.media;
      const rawTime = mediaElement ? mediaElement.currentTime : 0;
      const safeTime = isNaN(rawTime) ? 0 : rawTime;

      controllerRef.current.paused = true;
      setIsPlaying(false);

      setBookmark(prev => ({ ...prev, time: safeTime }));
      setShowForm(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lecture/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId,
          time: bookmark.time,
          label: bookmark.label,
          type: bookmark.type,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const data = await response.json();
      onBookmarkAdded(data);

      showToast.success(`Bookmark saved at ${Math.floor(bookmark.time)}s`);

      setShowForm(false);
      setBookmark({ label: '', type: 'BOOKMARK', time: 0 });

      if (controllerRef.current) {
        const shouldResume = originalControl === false;
        controllerRef.current.paused = !shouldResume;
        setIsPlaying(shouldResume);
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast.error("Could not save bookmark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setBookmark({ label: '', type: 'BOOKMARK', time: 0 });

    if (controllerRef.current) {
      const shouldResume = originalControl === false;
      controllerRef.current.paused = !shouldResume;
      setIsPlaying(shouldResume);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    if (controllerRef.current) {
      controllerRef.current.paused = !newPlayingState;
    }
  };

  if (!isMounted) return null;
  
  if(!videoUrl || videoUrl.trim() === "") { 
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-white">No video URL provided.</p>
      </div>
    );
  }
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  if (isYouTube) {
    return (
      <div className="w-full aspect-video bg-black">
        <iframe
          width="100%" height="100%"
          src={videoUrl}
          title="Course Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>

      <div className="absolute top-4 right-4 z-20">
          <button
            onClick={markAsComplete}
            disabled={hasCompleted || isMarkingComplete}
            className={`px-4 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 ${
              hasCompleted 
                ? "bg-green-500 text-white cursor-default" 
                : "bg-white/90 hover:bg-white text-black active:scale-95"
            }`}
          >
            {hasCompleted ? (
              <>Completed ✓</>
            ) : (
              <>{isMarkingComplete ? "Processing..." : "Mark as Completed"}</>
            )}
          </button>
        </div>
      </div>
    );
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
        src={videoUrl} 
        controls={false}
        onTimeUpdate={handleTimeUpdate} 
        width="100%"
        height="100%"
        playing={isPlaying}
        playsInline
        onReady={() => setIsVideoLoading(false)}
        onWaiting={() => setIsVideoLoading(true)}
        onPlaying={() => setIsVideoLoading(false)}
      />

      {/* --- LOADER OVERLAY --- */}
        {isVideoLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20 transition-all">
            {/* You can use a Lucide Loader or a Lottie here */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#FFCC59]/20 border-t-[#FFCC59] rounded-full animate-spin"></div>
              {/* Small pulse effect for extra polish */}
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

      {/* --- BOOKMARK OVERLAY FORM --- */}
      {showForm && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 animate-in fade-in duration-200"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-sm flex flex-col gap-4 text-black"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Bookmark</h3>
              <span className="text-sm font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                at {Number.isFinite(bookmark.time)
                  ? new Date(bookmark.time * 1000).toISOString().substr(14, 5)
                  : "00:00"}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Label</label>
              <input
                autoFocus
                required
                className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                placeholder="What's happening here?"
                value={bookmark.label}
                onChange={(e) => setBookmark({ ...bookmark, label: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
              <select
                className="w-full p-2 mt-1 bg-gray-50 border rounded outline-none"
                value={bookmark.type}
                onChange={(e) => setBookmark(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="BOOKMARK">General Bookmark</option>
                <option value="IMPORTANT">🔥 Important Segment</option>
                <option value="QUESTION">❓ Question/Doubt</option>
              </select>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                disabled={isSubmitting}
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : <><Save size={18} /> Save</>}
              </button>
            </div>
          </form>
        </div>
      )}

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
        <MediaSeekBackwardButton seekOffset={10} />
        <MediaSeekForwardButton seekOffset={10} />
        
        {/* --- BOOKMARK BUTTON WITH TOOLTIP --- */}
        <div 
          className="relative group"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip Box */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-3 bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 pointer-events-none">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">Smart Bookmarks</span>
                  <p className="text-[10px] leading-relaxed text-gray-200">
                    Click to save this exact timestamp. You can add notes or mark segments as important.
                  </p>
                </div>
              </div>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900/95" />
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenForm}
            className="transition-transform hover:scale-110 active:scale-95"
            title="Add Bookmark"
          >
            <div
              className="p-3 flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--media-secondary-color, rgb(20 20 30 / .7))' }}
            >
              <BookmarkPlus size={20} className="text-white" />
            </div>
          </button>
        </div>

        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaPlaybackRateButton />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
};

export default VideoPlayer;