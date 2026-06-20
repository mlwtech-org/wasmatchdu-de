import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { usePlayerStore } from "../store/usePlayerStore";
import { AlertCircle, Loader2, Maximize, PictureInPicture } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
// import { SubscribeOverlay } from './SubscribeOverlay';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { currentChannel, isTheaterMode, useProxy, toggleTheaterMode } =
    usePlayerStore();
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const retryCount = useRef(0);

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
        });
        hlsRef.current = hls;

        const streamUrl = useProxy
          ? `http://localhost:3001/proxy?url=${encodeURIComponent(currentChannel.url)}`
          : currentChannel.url;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (retryCount.current < 2) {
                  retryCount.current += 1;
                  setError(
                    "Network connection interrupted. Trying to recover...",
                  );
                  hls.startLoad();
                } else {
                  setError(
                    "This stream is currently offline, geo-blocked, or requires a proxy. Please try another channel.",
                  );
                  setIsBuffering(false);
                  hls.destroy();
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (retryCount.current < 2) {
                  retryCount.current += 1;
                  setError("Media error encountered. Trying to recover...");
                  hls.recoverMediaError();
                } else {
                  setError(
                    "Stream formatting is incompatible. Please try another channel.",
                  );
                  setIsBuffering(false);
                  hls.destroy();
                }
                break;
              default:
                setError(
                  "Playback failed. The broadcaster might be blocking the connection.",
                );
                setIsBuffering(false);
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        const streamUrl = useProxy
          ? `http://localhost:3001/proxy?url=${encodeURIComponent(currentChannel.url)}`
          : currentChannel.url;

        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => {
          setIsBuffering(false);
          video.play().catch(console.error);
        });
        video.addEventListener("error", () => {
          setError(
            "Playback failed. This stream is currently offline or geo-blocked by the broadcaster. Please try another channel.",
          );
          setIsBuffering(false);
        });
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
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
          <p className="text-slate-300 max-w-md text-lg leading-relaxed">
            {error}
          </p>
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
