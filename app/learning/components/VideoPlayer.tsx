"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { BookmarkPlus, Save } from "lucide-react";
import { useParams, useRouter } from 'next/navigation';

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

  const storageKey = `watch-progress-${userId}-${lectureId}`;

  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey);
    if (savedTime) {
      totalSecondsWatched.current = parseFloat(savedTime);
    }
  }, [lectureId, userId]);


  const router = useRouter();
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [bookmark, setBookmark] = useState({ label: '', type: 'BOOKMARK', time: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalControl, setOriginalControl] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  //function to track user activity
    const saveWatchActivity = async () => {
      if (totalSecondsWatched.current <= 0) return;

      const minutesToSave = totalSecondsWatched.current / 60;
      
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

      setShowForm(false);
      setBookmark({ label: '', type: 'BOOKMARK', time: 0 });

      if (controllerRef.current) {
        const shouldResume = originalControl === false;
        controllerRef.current.paused = !shouldResume;
        setIsPlaying(shouldResume);
      }
    } catch (error) {
      console.error("Save error:", error);
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
      />

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