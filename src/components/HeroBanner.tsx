import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { VERIFIED_RELIABLE_CHANNELS } from "../lib/constants";
import { Channel } from "../types";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import Hls from "hls.js";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface HeroBannerProps {
  featuredChannels?: Channel[];
}

const defaultFeatured = VERIFIED_RELIABLE_CHANNELS.slice(0, 5);

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredChannels = defaultFeatured,
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hlsRef = React.useRef<Hls | null>(null);

  // Auto-rotate the banner
  useEffect(() => {
    if (featuredChannels.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredChannels.length);
    }, 12000); // Increased time to allow video to play longer
    return () => clearInterval(interval);
  }, [featuredChannels.length]);

  const activeChannel = featuredChannels[currentIndex];

  useEffect(() => {
    if (!activeChannel || !videoRef.current) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hlsRef.current = hls;
      hls.loadSource(activeChannel.url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current
          ?.play()
          .catch((e) => console.log("Hero playback blocked", e));
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = activeChannel.url;
      videoRef.current
        .play()
        .catch((e) => console.log("Hero playback blocked", e));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? featuredChannels.length - 1 : prev - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredChannels.length);
  };

  if (!activeChannel) return null;

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] min-h-[500px] max-h-[850px] group bg-black overflow-hidden select-none">
      {/* Background Video / Image Fallback */}
      <div className="absolute inset-0 w-full h-full">
        {/* The background video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-60"
          muted
          playsInline
          loop
          autoPlay
          crossOrigin="anonymous"
        />
        {/* Image Fallback while video loads or if it fails */}
        {activeChannel.logo ? (
          <img
            key={activeChannel.logo} // force re-render for animation
            src={activeChannel.logo}
            alt={activeChannel.name}
            className="w-full h-full object-cover opacity-30 md:opacity-20 scale-105 transform transition-transform duration-[15000ms] ease-out group-hover:scale-110 blur-2xl absolute inset-0 -z-10"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 absolute inset-0 -z-10" />
        )}
        {/* Gradients to blend into the dashboard background */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        {/* A subtle bottom gradient that precisely matches the dashboard background */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-10" />
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center z-20">
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 pt-20">
          <div
            key={activeChannel.id}
            className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            {/* Category / Badge */}
            <span className="inline-block px-4 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-full text-blue-400 text-sm font-bold tracking-wider uppercase mb-6 border border-blue-500/30 shadow-lg">
              {activeChannel.gemeinwohlCategory || "Trending Now"}
            </span>

            {/* Logo or Title */}
            {activeChannel.logo ? (
              <img
                src={activeChannel.logo}
                alt={activeChannel.name}
                className="max-w-[280px] md:max-w-[360px] max-h-[140px] object-contain mb-6 drop-shadow-2xl"
              />
            ) : (
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight tracking-tight">
                {activeChannel.name}
              </h1>
            )}

            <p className="text-lg md:text-xl text-slate-300 mb-8 line-clamp-3 leading-relaxed drop-shadow-md max-w-xl">
              {activeChannel.name} is streaming live now. Join the broadcast and
              experience top-tier entertainment, news, and sports in real-time.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/live/${activeChannel.id}`)}
                className="flex items-center justify-center gap-3 bg-white text-black px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                <Play className="w-6 h-6 fill-black" />
                Play
              </button>
              <button
                onClick={() => navigate(`/live/${activeChannel.id}`)}
                className="flex items-center justify-center gap-3 bg-slate-500/40 text-white px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-slate-500/60 backdrop-blur-md transition-all border border-white/10 hover:border-white/30 hover:scale-105"
              >
                <Info className="w-6 h-6" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/20 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 hover:scale-110"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/20 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 hover:scale-110"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 right-12 z-50 flex gap-2">
        {featuredChannels.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              idx === currentIndex
                ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                : "w-2 bg-white/30 hover:bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
};
