"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { showToast } from "@/utils/Toast";
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
      </MediaControlBar>
    </MediaController>
  );
};

export default AdminVideoPlayer;
