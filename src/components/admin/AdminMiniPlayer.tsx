import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Channel } from "../../types";

interface AdminMiniPlayerProps {
  channel: Channel;
  onClose: () => void;
}

export const AdminMiniPlayer: React.FC<AdminMiniPlayerProps> = ({
  channel,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel?.url) return;

    setError(null);
    setIsBuffering(true);

    const streamUrl = channel.url;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        enableWorker: true,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch((e) => {
          console.error("Auto-play prevented", e);
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
              setError(
                "Fatal stream error. The channel may be offline or geo-locked.",
              );
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsBuffering(false);
        video.play().catch(console.error);
      });
      video.addEventListener("error", () => {
        setError("Failed to load stream natively.");
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel]);

  return (
    <div className="fixed bottom-6 right-6 w-[400px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="text-sm font-bold text-white truncate max-w-[250px]">
            {channel.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-white/10 p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Video Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/80">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-sm text-rose-400 font-medium">{error}</p>
          </div>
        ) : isBuffering ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : null}

        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          playsInline
          autoPlay
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <span className="font-mono">TEST MODE</span>
        <span>{channel.group || "Global"}</span>
      </div>
    </div>
  );
};
