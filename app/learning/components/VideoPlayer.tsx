"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { BookmarkPlus, X, Save } from "lucide-react";

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

interface Props {
  videoUrl: string;
  lectureId: string; // Add this
}

const VideoPlayer: React.FC<Props> = ({ videoUrl , lectureId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [bookmark, setBookmark] = useState({ label: '', type: 'BOOKMARK', time: 0 });
  const [isPlaying , setIsPlaying] = useState(true);
  const controllerRef = useRef<any>(null);
  const [originalControl , setOriginalControl] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

const handleOpenForm = () => {
    if (controllerRef.current) {
      // 1. Save state
      const wasPaused = !isPlaying; 
      setOriginalControl(wasPaused);

      // 2. Capture time reliably
      // MediaController exposes the actual video element via .media
      const mediaElement = controllerRef.current.media;
      const rawTime = mediaElement ? mediaElement.currentTime : controllerRef.current.mediaCurrentTime;
      const safeTime = isNaN(rawTime) ? 0 : rawTime;

      // 3. Pause
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
        console.log("Bookmark to be saved:", bookmark.time , bookmark.label, bookmark.type); ;
        const response = await fetch("/api/lecture/bookmark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lectureId,
            time: bookmark.time,
            label: bookmark.label,
            type: bookmark.type, // Now sending the type field
          }),
        });

        if (!response.ok) throw new Error("Failed to save");

        const data = await response.json();
        console.log("Bookmark saved successfully:", data);
        
        // Reset UI
        setShowForm(false);
        setBookmark({ label: '', type: 'BOOKMARK', time: 0 });

        // Restore video playback state
        if (controllerRef.current) {
          const shouldResume = originalControl === false; 
          controllerRef.current.paused = !shouldResume;
          setIsPlaying(shouldResume);
        }
      } catch (error) {
        console.error("Save error:", error);
        // You could add a toast notification here
      } finally {
        setIsSubmitting(false);
      }
    };
  
  const handleCancel = () => {
    setShowForm(false);
    setBookmark({ label: '', type: 'BOOKMARK', time: 0 });

    // 5. RESTORE STATE on Cancel as well
    if (controllerRef.current) {
      const shouldResume = originalControl === false;
      controllerRef.current.paused = !shouldResume;
      // console.log("Should resume playback:", shouldResume);
      setIsPlaying(shouldResume);
    }
  
  }

  const togglePlay = (e?: React.MouseEvent) => {
    // Prevent event bubbling if necessary
    e?.stopPropagation();

    const newPlayingState = !isPlaying;
    
    // 1. Update React State (for ReactPlayer)
    setIsPlaying(newPlayingState);

    // 2. Update MediaController Property (for the UI and underlying engine)
    if (controllerRef.current) {
      controllerRef.current.paused = !newPlayingState;
    }
  };

  if (!isMounted) return null;

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
        width="100%"
        height="100%"
        playing={isPlaying}
      />

      <div 
        className="absolute z-10 cursor-default h-[2rem]" 
        style={{ 
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            cursor: 'default' ,
            height: 'calc(100% - 2.5rem)',
          }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Blocks the click from reaching MediaController
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
                onChange={(e) => setBookmark({...bookmark, label: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
              <select 
                className="w-full p-2 mt-1 bg-gray-50 border rounded outline-none"
                value={bookmark.type}
                // Using the functional update pattern (prev) ensures you always have the latest state
                onChange={(e) => {
                  setBookmark(prev => ({ ...prev, type: e.target.value }))
                  console.log("Selected type:", e.target.value);
                }
              }
              >
                <option value="BOOKMARK">General Bookmark</option>
                <option value="IMPORTANT">🔥 Important Segment</option>
                <option value="QUESTION">❓ Question/Doubt</option>
              </select>
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                <Save size={18} /> Save
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
        
        {/* ADD BOOKMARK BUTTON */}
        <button
          type="button"
          onClick={handleOpenForm}
          className="transition-transform hover:scale-110 active:scale-95"
          title="Add Bookmark"
        >
          <div 
            className="p-3  flex items-center justify-center transition-colors"
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