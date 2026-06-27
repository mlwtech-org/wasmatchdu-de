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
  Tv,
  SkipForward,
  RotateCcw,
  RotateCw,
  Share2,
  Subtitles,
  Settings,
  PictureInPicture,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";

export const LivePlayer: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { channels, removeChannel } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showTipThanks, setShowTipThanks] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"NOW" | "THEREAFTER">("NOW");
  const [regionFilter, setRegionFilter] = useState<
    "ALL" | "REGIONAL" | "GLOBAL"
  >("ALL");
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

  // Function temporarily removed because it is unused
  // and blocking the TS build.

  // Get current channel object from store
  const { showUnstableChannels } = usePlayerStore();
  const currentChannelObj = channels.find((c) => c.id === streamId);

  // Get other channels for the sidebar
  const otherChannels = channels
    .filter((c) => c.id !== streamId)
    .filter((c) => {
      if (!showUnstableChannels && c.isUnstable) return false;
      if (regionFilter === "ALL") return true;
      if (regionFilter === "REGIONAL") return c.isRegional;
      if (regionFilter === "GLOBAL") return !c.isRegional;
      return true;
    })
    .slice(0, 50); // limit to 50 for performance

  // Prefer the playback_url passed from GoLive via router state (Mux CDN URL).
  // Fallback 1: Use the actual IPTV channel URL from the M3U playlist.
  // Fallback 2: Construct from streamId for direct URL navigation.
  const playbackUrl: string =
    (location.state as { playback_url?: string } | null)?.playback_url ??
    currentChannelObj?.url ??
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
          setIsBuffering(false);
          hls.destroy();

          let errorMsg = "Stream is currently offline or unavailable.";
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              errorMsg = "Stream offline or blocked by CORS.";
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              errorMsg = "Stream format is incompatible or broken.";
              break;
          }

          if (otherChannels.length > 0) {
            // Silently remove the broken channel and instantly skip to the next
            removeChannel(streamId!);
            setTimeout(() => {
              navigate(`/live/${otherChannels[0].id}`, { replace: true });
            }, 100);
          } else {
            setError(`${errorMsg} You may need a VPN or the channel is dead.`);
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari / iOS)
      video.src = hlsUrl;
      video.addEventListener("loadedmetadata", () => video.play());
      video.addEventListener("error", () => {
        setIsBuffering(false);
        if (otherChannels.length > 0) {
          // Silently remove the broken channel and instantly skip to the next
          removeChannel(streamId!);
          setTimeout(() => {
            navigate(`/live/${otherChannels[0].id}`, { replace: true });
          }, 100);
        } else {
          setError(
            "Stream offline or blocked by CORS. You may need a VPN or the channel is dead.",
          );
        }
      });
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

  const handleChannelChange = (channelId: string) => {
    navigate(`/live/${channelId}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col text-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6 shrink-0 bg-slate-950 sticky top-0 z-40">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content Area - 2 Columns */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        {/* Left Column: Video Player (70%) */}
        <div className="flex-1 p-4 lg:p-8 lg:border-r border-slate-800 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {currentChannelObj?.logo ? (
                <img
                  src={currentChannelObj.logo}
                  alt="Logo"
                  className="w-8 h-8 object-contain bg-slate-800 rounded p-1"
                />
              ) : (
                <Tv className="w-6 h-6 text-slate-400" />
              )}
              {currentChannelObj?.name || "Live Broadcast"}
            </h1>
            <div className="flex items-center gap-2 text-red-500 font-bold bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 text-sm tracking-wide">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl ring-1 ring-slate-800 group"
          >
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-slate-400 bg-slate-900/80 px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <Radio className="w-10 h-10 text-red-500/80 animate-pulse" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white mb-2">
                    Stream Unavailable
                  </p>
                  <p className="text-sm max-w-md mx-auto text-red-300 bg-red-500/10 p-3 rounded border border-red-500/20">
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
                  >
                    Try Again
                  </button>
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

                {/* Top Right Overlays */}
                <div className="absolute top-4 right-4 flex items-center gap-4 z-10 transition-opacity duration-300">
                  {isMuted && (
                    <div
                      className="bg-black/50 p-2 rounded-full backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                    >
                      <VolumeX className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors">
                    <PictureInPicture className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Custom Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end pointer-events-auto pb-2">
                  {/* Timeline / Progress Bar */}
                  <div className="px-6 w-full flex items-center gap-4 mb-2 group/timeline cursor-pointer">
                    <div className="text-red-500 font-bold text-sm tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </div>

                    <div className="flex-1 relative h-1.5 bg-white/20 rounded-full overflow-hidden group-hover/timeline:h-2 transition-all">
                      <div className="absolute inset-y-0 left-0 w-full bg-red-500" />
                      {/* Fake Chapter Markers */}
                      <div className="absolute inset-0 flex justify-between items-center px-[20%]">
                        <div className="w-3 h-3 bg-white rounded-sm shadow border border-slate-300 z-10 hover:scale-150 transition-transform" />
                        <div className="w-3 h-3 bg-white rounded-sm shadow border border-slate-300 z-10 hover:scale-150 transition-transform" />
                        <div className="w-3 h-3 bg-white rounded-sm shadow border border-slate-300 z-10 hover:scale-150 transition-transform" />
                      </div>
                    </div>

                    <div className="text-white font-medium text-sm font-mono">
                      -00:07
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="px-4 flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white fill-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-white" />
                        )}
                      </button>

                      <button className="relative flex items-center justify-center p-2 hover:bg-white/10 rounded-full transition-colors group/btn">
                        <RotateCcw className="w-6 h-6 text-white" />
                        <span className="absolute text-[9px] font-bold mt-1 text-white">
                          10
                        </span>
                      </button>

                      <button className="relative flex items-center justify-center p-2 hover:bg-white/10 rounded-full transition-colors group/btn">
                        <RotateCw className="w-6 h-6 text-white" />
                        <span className="absolute text-[9px] font-bold mt-1 text-white">
                          10
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (otherChannels.length > 0)
                            handleChannelChange(otherChannels[0].id);
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Next Channel"
                      >
                        <SkipForward className="w-6 h-6 text-white fill-white" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors ml-1 sm:ml-2"
                      >
                        {isMuted ? (
                          <VolumeX className="w-6 h-6 text-white" />
                        ) : (
                          <Volume2 className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Share2 className="w-5 h-5 text-white" />
                      </button>

                      <button className="p-2 hover:bg-white/10 rounded-full transition-colors border-b-2 border-red-500 rounded-b-none">
                        <Subtitles className="w-5 h-5 text-white" />
                      </button>

                      <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Settings className="w-6 h-6 text-white" />
                        <div className="absolute top-0 right-0 bg-red-600 text-[8px] font-bold px-1 rounded-sm text-white">
                          HD
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullScreen();
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors ml-1 sm:ml-2"
                      >
                        <Maximize className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Info Section (Matching ARD Screenshot) */}
          <div className="mt-4 flex gap-6 items-start bg-slate-900/40 p-6 rounded-xl border border-slate-800/50">
            <div className="w-20 h-20 shrink-0 bg-[#0f172a] rounded-lg flex items-center justify-center p-3 border border-slate-700">
              {currentChannelObj?.logo ? (
                <img
                  src={currentChannelObj.logo}
                  alt=""
                  className="w-full h-full object-contain"
                />
              ) : (
                <Tv className="w-8 h-8 text-slate-500" />
              )}
            </div>
            <div className="flex-1">
              {currentChannelObj?.currentProgram ? (
                <>
                  <p className="text-sm text-slate-300 font-bold mb-1">
                    {currentChannelObj.currentProgramTime}
                  </p>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {currentChannelObj.currentProgram}
                  </h2>
                  {currentChannelObj.nextProgram && (
                    <p className="text-slate-400 mt-3 text-sm">
                      <span className="font-semibold text-slate-500">
                        NEXT:
                      </span>{" "}
                      {currentChannelObj.nextProgram}
                    </p>
                  )}
                </>
              ) : (
                <h2 className="text-xl font-bold text-white">
                  {currentChannelObj?.name || "Live Channel"}
                </h2>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: More Live Streams Sidebar (30%) */}
        <div className="w-full lg:w-[420px] shrink-0 bg-[#0b0f19] lg:border-l border-slate-800 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 bg-[#0b0f19]">
            <h2 className="text-xl font-bold text-white">More live streams</h2>
            <div className="flex bg-slate-800/60 rounded p-1">
              <button
                onClick={() => setSidebarTab("NOW")}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  sidebarTab === "NOW"
                    ? "bg-slate-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                NOW
              </button>
              <button
                onClick={() => setSidebarTab("THEREAFTER")}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  sidebarTab === "THEREAFTER"
                    ? "bg-slate-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                THEREAFTER
              </button>
            </div>
          </div>

          {/* Sub-filter for Regional/Global */}
          <div className="px-6 pb-4 border-b border-slate-800 flex items-center gap-2 bg-[#0b0f19]">
            <button
              onClick={() => setRegionFilter("ALL")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                regionFilter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRegionFilter("REGIONAL")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                regionFilter === "REGIONAL"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Regional
            </button>
            <button
              onClick={() => setRegionFilter("GLOBAL")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                regionFilter === "GLOBAL"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Global
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {otherChannels.map((channel) => {
              const isActive = channel.id === streamId;

              // Simulate progress bar based on time or random
              const progressWidth = Math.floor(Math.random() * 60) + 20;

              return (
                <button
                  key={channel.id}
                  onClick={() => handleChannelChange(channel.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-start gap-4 ${
                    isActive
                      ? "bg-[#0b2853] border-[#1e4b8a]"
                      : "bg-transparent hover:bg-slate-900 border-transparent hover:border-slate-800"
                  } border`}
                >
                  <div
                    className={`w-14 h-14 shrink-0 rounded flex items-center justify-center p-2 ${
                      isActive ? "bg-[#091e40]" : "bg-slate-800"
                    }`}
                  >
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt=""
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Tv
                        className={`w-6 h-6 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-14">
                    {sidebarTab === "NOW" && channel.currentProgram ? (
                      <>
                        <p className="text-xs text-slate-300 font-semibold mb-0.5">
                          {channel.currentProgramTime}
                        </p>
                        <p
                          className={`text-sm font-bold line-clamp-2 leading-tight ${isActive ? "text-white" : "text-slate-200"}`}
                        >
                          {channel.currentProgram}
                        </p>
                        <div className="w-full h-0.5 bg-slate-700 mt-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${progressWidth}%` }}
                          />
                        </div>
                      </>
                    ) : sidebarTab === "THEREAFTER" && channel.nextProgram ? (
                      <>
                        <p
                          className={`text-sm font-bold line-clamp-2 leading-tight ${isActive ? "text-white" : "text-slate-200"}`}
                        >
                          {channel.nextProgram}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3
                          className={`font-bold line-clamp-1 ${isActive ? "text-white" : "text-slate-200"}`}
                        >
                          {channel.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {channel.group}
                        </p>
                      </>
                    )}
                  </div>
                </button>
              );
            })}

            {otherChannels.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Radio className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No other channels available in this playlist.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
