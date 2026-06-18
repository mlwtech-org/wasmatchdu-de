import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '../store/usePlayerStore';
import { AlertCircle, Loader2, Maximize, PictureInPicture } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { currentChannel, isTheaterMode, toggleTheaterMode } = usePlayerStore();
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentChannel) return;

    const initPlayer = () => {
      setError(null);
      setIsBuffering(true);

      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();

        const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 600 });
        hlsRef.current = hls;

        hls.loadSource(currentChannel.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Network error: Stream temporarily unavailable. Trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError('Media error encountered. Trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                setError('Playback failed. Please try another channel or regional mirror.');
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentChannel.url;
        video.addEventListener('loadedmetadata', () => {
          setIsBuffering(false);
          video.play().catch(console.error);
        });
        video.addEventListener('error', () => {
          setError('Playback failed. Please try another channel or regional mirror.');
        });
      }
    };

    initPlayer();

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [currentChannel]);

  const handlePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP failed', err);
    }
  };

  if (!currentChannel) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center w-full bg-black/90 text-white rounded-xl border border-border transition-all duration-500 ease-in-out",
        isTheaterMode ? "h-[80vh]" : "aspect-video"
      )}>
        <div className="text-xl font-semibold opacity-70">Select a channel to start watching</div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden bg-black rounded-xl group border border-border shadow-2xl transition-all duration-500 ease-in-out",
        isTheaterMode ? "h-[80vh] rounded-none lg:rounded-xl" : "aspect-video"
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
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Stream Error</h3>
          <p className="text-gray-300 max-w-md">{error}</p>
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
      <div className={cn(
        "absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 flex justify-between items-start pointer-events-none",
        isHovering ? "opacity-100" : "opacity-0"
      )}>
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
    </div>
  );
};
