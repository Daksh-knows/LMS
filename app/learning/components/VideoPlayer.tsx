"use client";
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player'

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
}

const VideoPlayer: React.FC<Props> = ({ videoUrl }) => {
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  if(isYouTube) {
      return (
        <div className="w-full aspect-video bg-black">
          <iframe
            width="100%"
            height="100%"
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);


  if (!isMounted) return null;

  return (
       <MediaController
      style={{
        width: "100%",
        aspectRatio: "16/9",
      }}
    >
      <ReactPlayer
        slot="media"
        src={videoUrl}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          // "--controls": "none",
        }}
      ></ReactPlayer>
      <MediaControlBar >
        <MediaPlayButton />
        <MediaSeekBackwardButton seekOffset={10} />
        <MediaSeekForwardButton seekOffset={10} />
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