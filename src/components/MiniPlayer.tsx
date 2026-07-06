import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import Hls from "hls.js";
import { Maximize2, Play, Pause, X, Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const MiniPlayer: React.FC = () => {
  const { miniPlayerChannel, closeMiniPlayer } = usePlayerStore();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Hide if on the live player page
  const isLivePage = location.pathname.startsWith("/live/");

  useEffect(() => {
    // If we have a mini channel but we navigate to its live page, close the mini player
    if (isLivePage && miniPlayerChannel) {
      closeMiniPlayer();
    }
  }, [isLivePage, miniPlayerChannel, closeMiniPlayer]);

  useEffect(() => {
    if (!miniPlayerChannel || isLivePage || !videoRef.current) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(miniPlayerChannel.url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = miniPlayerChannel.url;
      videoRef.current
        ?.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [miniPlayerChannel, isLivePage]);

  if (!miniPlayerChannel || isLivePage) return null;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const expandToFullscreen = () => {
    closeMiniPlayer();
    navigate(`/live/${miniPlayerChannel.id}`);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] w-72 md:w-80 lg:w-96 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 cursor-pointer animate-in slide-in-from-bottom-8 fade-in duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={expandToFullscreen}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
      />

      {/* Overlay gradient for controls */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Top Header */}
      <div
        className={cn(
          "absolute top-0 inset-x-0 p-3 flex justify-between items-start transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="text-white text-xs font-bold drop-shadow-md truncate pr-4">
          {miniPlayerChannel.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeMiniPlayer();
          }}
          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Play/Pause */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-blue-500/80 text-white pointer-events-auto hover:bg-blue-500 hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 inset-x-0 p-3 flex justify-between items-center transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-slate-800 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            expandToFullscreen();
          }}
          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
