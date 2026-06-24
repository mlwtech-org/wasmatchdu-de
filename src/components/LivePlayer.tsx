import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Hls from "hls.js";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  Radio,
  HeartHandshake,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

export const LivePlayer: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showTipThanks, setShowTipThanks] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const IDLE_TIMEOUT_MS = 45 * 60 * 1000; // 45 minutes

  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (showIdleWarning) return; // Don't auto-reset if the warning is already showing, user must click button
    idleTimeoutRef.current = setTimeout(() => {
      setShowIdleWarning(true);
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    resetIdleTimer();
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    const handleActivity = () => {
      if (!showIdleWarning) resetIdleTimer();
    };
    events.forEach((e) => document.addEventListener(e, handleActivity));
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      events.forEach((e) => document.removeEventListener(e, handleActivity));
    };
  }, [showIdleWarning]);

  // Check for successful tip redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tip") === "success") {
      setShowTipThanks(true);
      setTimeout(() => setShowTipThanks(false), 5000);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleTipClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const pubKey = import.meta.env.VITE_STRIPE_PUB_KEY;
      if (!pubKey) throw new Error("Missing Stripe Key");

      const stripe = await loadStripe(pubKey);
      if (!stripe) throw new Error("Stripe failed to load");

      // Note: Client-only checkout requires a pre-created Price ID in the Stripe Dashboard.
      // Replace 'price_12345' with your actual Price ID for the tip amount.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: stripeError } = await (stripe as any).redirectToCheckout({
        lineItems: [{ price: "price_placeholder_for_tip", quantity: 1 }],
        mode: "payment",
        successUrl:
          window.location.origin + window.location.pathname + "?tip=success",
        cancelUrl:
          window.location.origin + window.location.pathname + "?tip=canceled",
      });

      if (stripeError) {
        console.error("Stripe Error:", stripeError);
        // Fallback to demo toast if price ID is invalid
        setShowTipThanks(true);
        setTimeout(() => setShowTipThanks(false), 3000);
      }
    } catch (err) {
      console.error("Tip error:", err);
      // Fallback to demo toast
      setShowTipThanks(true);
      setTimeout(() => setShowTipThanks(false), 3000);
    }
  };

  // Prefer the playback_url passed from GoLive via router state (Mux CDN URL).
  // Fallback: construct from streamId for direct URL navigation.
  const playbackUrl: string =
    (location.state as { playback_url?: string } | null)?.playback_url ??
    `https://stream.mux.com/${streamId}.m3u8`;

  useEffect(() => {
    if (!videoRef.current || !streamId) return;

    const video = videoRef.current;
    const hlsUrl = playbackUrl; // Mux CDN HLS URL

    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls({ maxLiveSyncPlaybackRate: 1.5 });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Auto-play was blocked by the browser, start muted
          video.muted = true;
          setIsMuted(true);
          video.play();
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError("Stream is currently offline or unavailable.");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari / iOS)
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => video.play());
      video.addEventListener("error", () =>
        setError("Stream is currently offline."),
      );
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamId, playbackUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col text-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Live Broadcast</h1>
            <div className="flex items-center gap-2 text-red-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl ring-1 ring-slate-800 group"
          >
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-slate-400 bg-slate-900/80">
                <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <Radio className="w-10 h-10 text-slate-500 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-white mb-1">
                    Waiting for broadcast...
                  </p>
                  <p className="text-sm">
                    The streamer has not started sending video data yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                />

                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}

                {/* Idle Warning Overlay */}
                {showIdleWarning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 p-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                      Are you still watching?
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-md">
                      Playback has been paused to save data. Click the button
                      below to resume the live stream.
                    </p>
                    <button
                      onClick={() => {
                        setShowIdleWarning(false);
                        resetIdleTimer();
                        if (videoRef.current) {
                          videoRef.current.play();
                          setIsPlaying(true);
                        }
                      }}
                      className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    >
                      Yes, keep watching
                    </button>
                  </div>
                )}

                {/* Tipping Toast */}
                {showTipThanks && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 animate-bounce z-50 border border-white/20">
                    <HeartHandshake className="w-5 h-5 text-yellow-300" />
                    <span>$5.00 Tipped to Broadcaster! (Demo)</span>
                  </div>
                )}

                {/* Custom Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-6 h-6" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleTipClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span className="hidden sm:inline">Support</span>
                      </button>
                      <button
                        onClick={toggleFullScreen}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Maximize className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
