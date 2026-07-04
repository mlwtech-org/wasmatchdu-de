import React, { useEffect, useRef, useCallback } from "react";
import { Radio, Play, Pause, Volume2, X } from "lucide-react";
import { useRadioStore } from "../store/useRadioStore";
import { usePlayerStore } from "../store/usePlayerStore";
import Hls from "hls.js";

export const GlobalRadioPlayer: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    volume,
    setCurrentStation,
    setIsPlaying,
    setVolume,
  } = useRadioStore();
  const { currentChannel } = usePlayerStore(); // To detect if TV is playing
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Pause radio automatically if TV starts playing
  useEffect(() => {
    if (currentChannel && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentChannel]);

  useEffect(() => {
    if (audioRef.current && currentStation) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const playCurrent = () => {
        // If TV is playing, don't auto-play radio
        if (usePlayerStore.getState().currentChannel) {
           setIsPlaying(false);
           return;
        }
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      };

      if (currentStation.url.includes(".m3u8")) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(currentStation.url);
          hls.attachMedia(audioRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            playCurrent();
          });
          hlsRef.current = hls;
        } else if (
          audioRef.current.canPlayType("application/vnd.apple.mpegurl")
        ) {
          audioRef.current.src = currentStation.url;
          playCurrent();
        }
      } else {
        audioRef.current.src = currentStation.url;
        playCurrent();
      }
    }
  }, [currentStation, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  const togglePlay = useCallback(
    () => {
      // If turning ON radio, stop TV
      if (!isPlaying) {
        usePlayerStore.getState().setCurrentChannel(null);
      }
      setIsPlaying(!isPlaying);
    },
    [isPlaying, setIsPlaying]
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentStation) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-4 bg-slate-900/95 backdrop-blur-xl border border-pink-500/30 p-3 pr-6 rounded-full shadow-[0_10px_40px_rgba(236,72,153,0.3)] animate-in slide-in-from-bottom-10 fade-in duration-500">
      {/* Cover / Icon */}
      <div className={`w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-2 border-slate-800 shadow-inner ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}>
        {currentStation.logo ? (
          <img
            src={currentStation.logo}
            alt=""
            className="w-10 h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStation.name)}&background=1e293b&color=ec4899&size=100&font-size=0.33`;
              (e.target as HTMLImageElement).onerror = null;
            }}
          />
        ) : (
          <Radio className="w-6 h-6 text-pink-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center max-w-[150px] min-w-[100px]">
        <h4 className="text-white font-bold text-sm truncate">{currentStation.name}</h4>
        <p className="text-pink-400 text-xs font-medium truncate flex items-center gap-1.5">
          {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>}
          {currentStation.group || "Live Radio"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 ml-2 border-l border-slate-700/50 pl-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="hidden md:flex items-center gap-2 w-24">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-pink-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <button
          onClick={() => {
            setIsPlaying(false);
            setCurrentStation(null);
          }}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors ml-2"
          title="Close Radio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <audio ref={audioRef} />
    </div>
  );
};
