import React, { useEffect, useRef, useState, useMemo } from "react";
import Hls from "hls.js";
import mux from "mux-embed";
import { usePlayerStore } from "../store/usePlayerStore";
import {
  AlertCircle,
  Loader2,
  Maximize,
  PictureInPicture,
  RefreshCw,
  Cast,
  Subtitles,
  ListVideo,
  X,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useLiveTranslation } from "../hooks/useLiveTranslation";
// import { SubscribeOverlay } from './SubscribeOverlay';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let chrome: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let cast: any;

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cast?: any;
  }
}

const SUPPORTED_LANGUAGES = [
  { code: "de-DE", label: "German" },
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese" },
  { code: "nl-NL", label: "Dutch" },
  { code: "tr-TR", label: "Turkish" },
  { code: "ru-RU", label: "Russian" },
  { code: "ar-SA", label: "Arabic" },
];

export const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const {
    currentChannel,
    channels,
    groups,
    selectedGroup,
    isTheaterMode,
    useProxy,
    toggleTheaterMode,
    playNextChannel,
    playPreviousChannel,
    setCurrentChannel,
    setCurrentPlaylist,
  } = usePlayerStore();
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [autoSkipCountdown, setAutoSkipCountdown] = useState<number | null>(
    null,
  );
  const [isCastAvailable, setIsCastAvailable] = useState(false);

  // Track Selection State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(-1);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1);
  const [showCCMenu, setShowCCMenu] = useState(false);
  const [isAITranslateEnabled, setIsAITranslateEnabled] = useState(false);
  const [sourceLang, setSourceLang] = useState("de-DE");
  const [targetLang, setTargetLang] = useState("en-US");
  const [showQuickSurf, setShowQuickSurf] = useState(false);
  const [quickSurfCategory, setQuickSurfCategory] = useState(
    selectedGroup || "All",
  );

  const quickSurfChannels = useMemo(() => {
    if (quickSurfCategory === "All") return channels;
    return channels.filter((c) => c.group === quickSurfCategory);
  }, [channels, quickSurfCategory]);

  const liveTranslationText = useLiveTranslation(
    isAITranslateEnabled,
    sourceLang,
    targetLang,
  );

  const retryCount = useRef(0);
  const skipTimerRef = useRef<number | null>(null);

  // Keyboard controls for channel surfing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        playPreviousChannel();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        playNextChannel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playNextChannel, playPreviousChannel]);

  // Clear countdown when channel changes manually
  useEffect(() => {
    setAutoSkipCountdown(null);
    if (skipTimerRef.current) {
      window.clearInterval(skipTimerRef.current);
    }
  }, [currentChannel?.id]);

  const startAutoSkip = () => {
    setAutoSkipCountdown(3);
    if (skipTimerRef.current) window.clearInterval(skipTimerRef.current);
    skipTimerRef.current = window.setInterval(() => {
      setAutoSkipCountdown((prev) => {
        if (prev === null || prev <= 1) {
          window.clearInterval(skipTimerRef.current!);
          playNextChannel();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAutoSkip = () => {
    setAutoSkipCountdown(null);
    if (skipTimerRef.current) {
      window.clearInterval(skipTimerRef.current);
    }
  };

  // Buffering Timeout. If stuck buffering for 8s, auto-skip to find a working channel quickly.
  useEffect(() => {
    let timeout: number;
    // Don't cancel timeout just because we have an informational error message
    // Only cancel if we've already started the auto-skip countdown
    if (isBuffering && !autoSkipCountdown) {
      timeout = window.setTimeout(() => {
        setError("Stream taking too long to load. Skipping...");
        setIsBuffering(false);
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        startAutoSkip();
      }, 8000); // 8 seconds for aggressive surfing
    }
    return () => window.clearTimeout(timeout);
  }, [isBuffering, autoSkipCountdown, startAutoSkip]);

  const handleSubtitleChange = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = id;
      setCurrentSubtitleTrack(id);
    }
  };

  const handleAudioChange = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = id;
      setCurrentAudioTrack(id);
    }
  };

  const handleResync = () => {
    if (hlsRef.current) {
      setError(null);
      setIsBuffering(true);
      hlsRef.current.recoverMediaError();
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      // For native HTML5 players (Safari)
      videoRef.current.load();
      videoRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) {
        setIsCastAvailable(true);
        try {
          cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId:
              chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
        } catch (err) {
          console.error("Cast initialization failed", err);
        }
      }
    };

    // Check if it's already loaded (sometimes it loads before React mounts)
    if (window.cast && window.cast.framework) {
      setIsCastAvailable(true);
    }
  }, []);

  const handleCast = () => {
    if (!currentChannel) return;
    try {
      const context = cast.framework.CastContext.getInstance();
      context
        .requestSession()
        .then(() => {
          const session = context.getCurrentSession();
          if (!session) return;
          const mediaInfo = new chrome.cast.media.MediaInfo(
            currentChannel.url,
            "application/x-mpegURL",
          );
          const request = new chrome.cast.media.LoadRequest(mediaInfo);
          session.loadMedia(request).then(
            () => console.log("Cast load succeeded"),
            (err: unknown) => console.error("Cast load failed", err),
          );
        })
        .catch((err: unknown) => {
          console.error("Cast session request failed", err);
        });
    } catch (err) {
      console.error("Cast error", err);
    }
  };

  // Initialize Mux Analytics
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const envKey = import.meta.env.VITE_MUX_ENV_KEY;
    if (envKey) {
      try {
        mux.monitor(video, {
          debug: false,
          data: {
            env_key: envKey,
            player_name: "WasMatchDu Player",
            player_init_time: Date.now(),
          },
        });
      } catch (err) {
        console.error("Mux init failed", err);
      }
    }
    return () => {
      try {
        video.dispatchEvent(new Event("destroy"));
      } catch {
        // ignore errors on unmount
      }
    };
  }, []);

  // Update Mux Analytics on Channel Change
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentChannel) return;
    const envKey = import.meta.env.VITE_MUX_ENV_KEY;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (envKey && (video as any).mux) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (video as any).mux.emit("videochange", {
        video_title: currentChannel.name,
        video_id: currentChannel.id,
        video_stream_type: "live",
      });
    }
  }, [currentChannel]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentChannel) return;

    const initPlayer = () => {
      setError(null);
      setIsBuffering(true);
      retryCount.current = 0;

      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();

        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10,
          maxLiveSyncPlaybackRate: 1.5,
        });
        hlsRef.current = hls;

        const streamUrl = useProxy
          ? `https://corsproxy.io/?${encodeURIComponent(currentChannel.url)}`
          : currentChannel.url;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          setAudioTracks(hls.audioTracks || []);
          setSubtitleTracks(hls.subtitleTracks || []);
          setCurrentAudioTrack(hls.audioTrack);
          setCurrentSubtitleTrack(hls.subtitleTrack);
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.AUDIO_TRACK_LOADED, () => {
          setAudioTracks(hls.audioTracks || []);
          setCurrentAudioTrack(hls.audioTrack);
        });

        hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
          setSubtitleTracks(hls.subtitleTracks || []);
        });

        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
          setCurrentAudioTrack(data.id);
        });

        hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_, data) => {
          setCurrentSubtitleTrack(data.id);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setIsBuffering(false);
            hls.destroy();

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError(
                  "Stream offline or blocked. Finding a working channel...",
                );
                startAutoSkip();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Stream incompatible. Finding a working channel...");
                startAutoSkip();
                break;
              default:
                setError("Playback failed. Finding a working channel...");
                startAutoSkip();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        const streamUrl = useProxy
          ? `https://corsproxy.io/?${encodeURIComponent(currentChannel.url)}`
          : currentChannel.url;

        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => {
          setIsBuffering(false);
          video.play().catch(console.error);
        });
        video.addEventListener("error", () => {
          setError("Playback failed. Finding a working channel...");
          setIsBuffering(false);
          startAutoSkip();
        });
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel, useProxy]);

  const handlePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP failed", err);
    }
  };

  if (!currentChannel) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-black group transition-all duration-500 ease-in-out",
        isTheaterMode ? "fixed inset-0 z-[100]" : "",
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isBuffering && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-8 text-center animate-in fade-in duration-300">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6 drop-shadow-lg" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Stream Unavailable
          </h3>
          <p className="text-slate-300 max-w-md text-lg leading-relaxed mb-8">
            {error}
          </p>

          {autoSkipCountdown !== null ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-xl font-bold text-blue-400">
                Skipping to next channel in {autoSkipCountdown}...
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    cancelAutoSkip();
                    playNextChannel();
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-colors"
                >
                  Skip Now
                </button>
                <button
                  onClick={cancelAutoSkip}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={playNextChannel}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Play Next Channel
            </button>
          )}
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        autoPlay
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      {/* AI Live Translation Text Overlay */}
      {isAITranslateEnabled && liveTranslationText && (
        <div className="absolute bottom-24 inset-x-0 flex justify-center pointer-events-none px-4 z-40">
          <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl max-w-3xl border border-white/10 shadow-2xl">
            <p className="text-white text-xl md:text-2xl font-medium text-center drop-shadow-md leading-relaxed">
              {liveTranslationText}
            </p>
          </div>
        </div>
      )}

      {/* Custom Overlays & Controls */}
      <div
        className={cn(
          "absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 flex justify-between items-start pointer-events-none",
          isHovering ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="px-3 py-1 text-xs font-mono font-medium text-white bg-red-600 rounded-md">
          LIVE
        </div>
        <div className="flex gap-2 pointer-events-auto">
          {isCastAvailable && (
            <button
              onClick={handleCast}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-md transition-colors"
              title="Cast to TV"
            >
              <Cast className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowCCMenu(!showCCMenu)}
              className={cn(
                "p-2 rounded-md backdrop-blur-md transition-colors flex items-center gap-2",
                showCCMenu || isAITranslateEnabled
                  ? "bg-blue-600 text-white"
                  : "bg-black/60 hover:bg-black/80 text-white",
              )}
              title="Subtitles & Audio"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {showCCMenu && (
              <div className="absolute top-12 right-0 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 min-w-[280px] shadow-2xl z-50">
                {/* AI Live Translation Section */}
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Foreign Language Translator
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Uses your microphone to listen and translate the TV in
                    real-time.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                        Listen In (Spoken)
                      </label>
                      <select
                        className="bg-slate-800 text-slate-300 text-sm rounded-lg px-2 py-1.5 border border-slate-700 outline-none focus:border-blue-500"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                        Translate To
                      </label>
                      <select
                        className="bg-slate-800 text-slate-300 text-sm rounded-lg px-2 py-1.5 border border-slate-700 outline-none focus:border-blue-500"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setIsAITranslateEnabled(!isAITranslateEnabled)
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors font-medium flex justify-between items-center mt-2",
                      isAITranslateEnabled
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700",
                    )}
                  >
                    <span>
                      {isAITranslateEnabled
                        ? "Translation Active"
                        : "Start Translating"}
                    </span>
                    <span
                      className={cn(
                        "w-8 h-4 rounded-full flex items-center transition-all duration-300",
                        isAITranslateEnabled ? "bg-blue-500" : "bg-slate-600",
                      )}
                    >
                      <span
                        className={cn(
                          "w-3 h-3 bg-white rounded-full transition-all duration-300 transform",
                          isAITranslateEnabled
                            ? "translate-x-4"
                            : "translate-x-1",
                        )}
                      ></span>
                    </span>
                  </button>
                </div>

                {subtitleTracks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Native Subtitles
                    </h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleSubtitleChange(-1)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                          currentSubtitleTrack === -1
                            ? "bg-blue-600/20 text-blue-400 font-medium"
                            : "text-slate-300 hover:bg-slate-800",
                        )}
                      >
                        Off
                      </button>
                      {subtitleTracks.map((track, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubtitleChange(i)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                            currentSubtitleTrack === i
                              ? "bg-blue-600/20 text-blue-400 font-medium"
                              : "text-slate-300 hover:bg-slate-800",
                          )}
                        >
                          {track.name || `Track ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {audioTracks.length > 1 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Native Audio
                    </h4>
                    <div className="space-y-1">
                      {audioTracks.map((track, i) => (
                        <button
                          key={i}
                          onClick={() => handleAudioChange(i)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                            currentAudioTrack === i
                              ? "bg-blue-600/20 text-blue-400 font-medium"
                              : "text-slate-300 hover:bg-slate-800",
                          )}
                        >
                          {track.name || `Audio ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleResync}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-md transition-colors"
            title="Fix Lag / Resync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {document.pictureInPictureEnabled && (
            <button
              onClick={handlePiP}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-md transition-colors"
              title="Picture in Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toggleTheaterMode()}
            className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-md backdrop-blur-md transition-colors"
            title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}
          >
            <Maximize className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowQuickSurf(!showQuickSurf)}
              className={cn(
                "p-2 rounded-md backdrop-blur-md transition-colors",
                showQuickSurf
                  ? "bg-blue-600 text-white"
                  : "bg-black/60 hover:bg-black/80 text-white",
              )}
              title="Quick Surf Channels"
            >
              <ListVideo className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Surf Sidebar */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col transition-transform duration-300 ease-out z-40",
          showQuickSurf ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ListVideo className="w-4 h-4 text-blue-400" />
            Quick Surf
          </h3>
          <button
            onClick={() => setShowQuickSurf(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 border-b border-white/5 bg-black/20">
          <select
            value={quickSurfCategory}
            onChange={(e) => setQuickSurfCategory(e.target.value)}
            className="w-full bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 px-2 py-1.5 outline-none focus:border-blue-500"
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {quickSurfChannels.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCurrentPlaylist(quickSurfChannels);
                setCurrentChannel(c);
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3",
                currentChannel?.id === c.id
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              {c.logo ? (
                <img
                  src={c.logo}
                  alt={c.name}
                  className="w-6 h-6 object-contain rounded bg-white/5"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="truncate flex-1">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/10 text-xs text-center text-slate-500 bg-black/20">
          Tip: Use{" "}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] ml-1">
            ↑
          </kbd>{" "}
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd>{" "}
          to zap
        </div>
      </div>

      {/* TEMPORARILY DISABLED FOR DEVELOPMENT
      {!user?.isPremium && currentChannel && import.meta.env.PROD && (
        <SubscribeOverlay />
      )}
      */}
    </div>
  );
};
