import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ChevronLeft, ChevronRight, Radio, Heart } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Channel } from "../types";
import { FALLBACK_CHANNELS } from "../lib/constants";
import Hls from "hls.js";

// ─── Curated premium channels always shown in the hero ───────────────────────
// These are hand-picked known-good channels with logos and descriptions.
const PREMIUM_FEATURED: Array<
  Channel & {
    headline: string;
    description: string;
    accentFrom: string;
    accentTo: string;
    textAccent: string;
  }
> = [
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-aljazeera")!,
    headline: "World News · Live",
    description:
      "Breaking stories from across the globe — on-the-ground reporting from 70+ bureaus worldwide, 24 hours a day.",
    accentFrom: "#1a2e4a",
    accentTo: "#0f172a",
    textAccent: "#38bdf8",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-dw")!,
    headline: "International · Live",
    description:
      "Germany's international broadcaster delivering news, culture and politics from a European perspective.",
    accentFrom: "#1a1f2e",
    accentTo: "#0f172a",
    textAccent: "#818cf8",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-redbull-tv")!,
    headline: "Sports & Action · Live",
    description:
      "Motorsport, extreme sports, music festivals and live events — experience the rush of Red Bull TV.",
    accentFrom: "#2d1010",
    accentTo: "#0f172a",
    textAccent: "#f87171",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-france24-en")!,
    headline: "Global News · Live",
    description:
      "International news in English with a French perspective — reporting from Paris to every corner of the world.",
    accentFrom: "#1a2a1a",
    accentTo: "#0f172a",
    textAccent: "#4ade80",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-nasa-tv")!,
    headline: "Science & Space · Live",
    description:
      "NASA Television — launches, spacewalks, ISS operations, and discoveries from the frontiers of human exploration.",
    accentFrom: "#0d1a2e",
    accentTo: "#0f172a",
    textAccent: "#60a5fa",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-bloomberg")!,
    headline: "Business & Markets · Live",
    description:
      "Real-time markets, finance news, and in-depth analysis of global economics and business trends.",
    accentFrom: "#1a2a20",
    accentTo: "#0f172a",
    textAccent: "#34d399",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-sky")!,
    headline: "Breaking News · Live",
    description:
      "Sky News — trusted around-the-clock news coverage from the UK and around the world.",
    accentFrom: "#1a1a2e",
    accentTo: "#0f172a",
    textAccent: "#a78bfa",
  },
  {
    ...FALLBACK_CHANNELS.find((c) => c.id === "verified-euronews-en")!,
    headline: "Europe & World · Live",
    description:
      "Europe's most watched international news channel — reporting in multiple languages across 160 countries.",
    accentFrom: "#2a1a10",
    accentTo: "#0f172a",
    textAccent: "#fb923c",
  },
].filter((c) => c.id); // Safety: filter out any undefined (if channel ID not in FALLBACK)

interface HeroBannerProps {
  featuredChannels?: Channel[];
}

const AUTO_ROTATE_MS = 10_000;

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredChannels }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { setCurrentPlaylist, favorites, toggleFavorite } = usePlayerStore();
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Use premium curated channels first; fall back to passed channels if needed
  const channels =
    PREMIUM_FEATURED.length >= 3
      ? PREMIUM_FEATURED
      : (featuredChannels ?? FALLBACK_CHANNELS.slice(0, 5));

  const goTo = useCallback(
    (idx: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentIndex(idx);
        setIsTransitioning(false);
      }, 350);
    },
    [isTransitioning],
  );

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % channels.length);
  }, [currentIndex, channels.length, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex === 0 ? channels.length - 1 : currentIndex - 1);
  }, [currentIndex, channels.length, goTo]);

  // Progress bar + auto-rotate + video playback
  useEffect(() => {
    setProgress(0);
    setIsVideoPlaying(false);

    // Auto rotate logic
    const step = 100 / (AUTO_ROTATE_MS / 100);
    progressInterval.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 100);

    rotateTimeout.current = setTimeout(() => {
      goNext();
    }, AUTO_ROTATE_MS);

    // Video Playback Logic
    const channel = channels[currentIndex];
    if (channel && videoRef.current) {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current
            ?.play()
            .then(() => setIsVideoPlaying(true))
            .catch(() => setIsVideoPlaying(false));
        });
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = channel.url;
        videoRef.current
          .play()
          .then(() => setIsVideoPlaying(true))
          .catch(() => setIsVideoPlaying(false));
      }
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (rotateTimeout.current) clearTimeout(rotateTimeout.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = channels[currentIndex] as (typeof PREMIUM_FEATURED)[number];
  if (!active) return null;

  const accentFrom = active.accentFrom ?? "#1a2e4a";
  const accentTo = active.accentTo ?? "#0f172a";
  const textAccent = active.textAccent ?? "#38bdf8";
  const headline = active.headline ?? active.gemeinwohlCategory ?? "Live Now";
  const description =
    active.description ??
    `${active.name} is streaming live 24/7. Watch breaking news, analysis, and live events as they happen.`;

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: "clamp(420px, 62vh, 780px)" }}
    >
      {/* ── Cinematic Background ─────────────────────────────────────── */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${isVideoPlaying ? "opacity-0" : "opacity-100"}`}
        style={{
          background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 60%, #020617 100%)`,
        }}
      />

      {/* Live Video Background */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000 ${isVideoPlaying ? "opacity-50" : "opacity-0"}`}
        muted
        playsInline
        autoPlay
        crossOrigin="anonymous"
      />

      {/* Noise grain overlay for cinematic texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Channel logo as giant blurred background element (Disney+ style) */}
      {active.logo && (
        <img
          key={active.id + "-bg"}
          src={active.logo}
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/2 object-contain opacity-[0.07] blur-2xl scale-125 pointer-events-none"
          style={{ filter: "blur(60px) saturate(2)", mixBlendMode: "screen" }}
        />
      )}

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-10" />
      {/* Left edge fade */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#020617]/20 to-transparent pointer-events-none z-10" />

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="relative z-20 h-full max-w-[1600px] mx-auto px-6 md:px-12 flex items-center pb-12 md:pb-20">
        <div className="flex items-center w-full gap-8 lg:gap-16">
          {/* LEFT: Text content */}
          <div
            key={active.id}
            className={`flex-1 min-w-0 transition-all duration-350 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
            style={{ transitionDuration: "350ms" }}
          >
            {/* Live badge + category */}
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/30">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
                LIVE
              </span>
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border"
                style={{
                  color: textAccent,
                  borderColor: `${textAccent}40`,
                  background: `${textAccent}15`,
                }}
              >
                <Radio className="w-3 h-3" />
                {headline}
              </span>
            </div>

            {/* Channel Logo (prominent, left side) */}
            {active.logo ? (
              <div className="mb-5">
                <img
                  src={active.logo}
                  alt={active.name}
                  className="max-h-[70px] md:max-h-[90px] max-w-[260px] md:max-w-[340px] object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = "block";
                  }}
                />
                <h1 className="hidden text-4xl md:text-6xl font-black text-white leading-tight mt-2">
                  {active.name}
                </h1>
              </div>
            ) : (
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
                {active.name}
              </h1>
            )}

            {/* Description */}
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-lg line-clamp-3">
              {description}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setCurrentPlaylist([]);
                  navigate(`/live/${active.id}`);
                }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 active:scale-95 shadow-xl"
                style={{
                  background: "white",
                  boxShadow: "0 0 30px rgba(255,255,255,0.2)",
                }}
              >
                <Play className="w-5 h-5 fill-black" />
                Watch Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(active.id);
                }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 border border-white/20 hover:border-white/40 backdrop-blur-md hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Heart
                  className={`w-5 h-5 ${favorites.includes(active.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                />
                {favorites.includes(active.id) ? "Favorited" : "My List"}
              </button>
            </div>
          </div>

          {/* RIGHT: Large channel logo (desktop only) */}
          {active.logo && (
            <div
              className={`hidden lg:flex shrink-0 items-center justify-center w-72 xl:w-96 transition-all duration-350 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
              style={{ transitionDuration: "350ms" }}
            >
              <div className="relative">
                {/* Glow ring behind logo */}
                <div
                  className="absolute inset-0 rounded-3xl blur-3xl opacity-30 scale-110"
                  style={{ background: textAccent }}
                />
                <div
                  className="relative rounded-3xl p-8 border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${accentFrom}cc, ${accentTo}cc)`,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <img
                    src={active.logo}
                    alt={active.name}
                    className="w-56 xl:w-72 max-h-44 object-contain drop-shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Controls ───────────────────────────────────────────── */}
      <div className="absolute bottom-12 md:bottom-20 left-0 right-0 z-20 max-w-[1600px] mx-auto px-6 md:px-12 flex items-end justify-between gap-4">
        {/* Slide indicators */}
        <div className="flex items-center gap-2">
          {channels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="group relative overflow-hidden rounded-full transition-all duration-500 hover:opacity-100"
              style={{
                width: idx === currentIndex ? 32 : 8,
                height: 4,
                background:
                  idx === currentIndex ? textAccent : "rgba(255,255,255,0.25)",
              }}
              aria-label={`Slide ${idx + 1}`}
            >
              {/* Progress fill for active slide */}
              {idx === currentIndex && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-none"
                  style={{
                    width: `${progress}%`,
                    background: "rgba(255,255,255,0.5)",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Arrow controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="p-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all hover:scale-110 backdrop-blur-md"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="p-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all hover:scale-110 backdrop-blur-md"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Left/Right edge click zones ───────────────────────────────── */}
      <button
        onClick={goPrev}
        className="absolute left-0 inset-y-0 w-16 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-start pl-2"
        aria-label="Previous slide"
      />
      <button
        onClick={goNext}
        className="absolute right-0 inset-y-0 w-16 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-2"
        aria-label="Next slide"
      />
    </div>
  );
};
