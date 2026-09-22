import React, { useMemo, useEffect, useRef } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { getViewerCount } from "../utils/sorting";
import { Radio, ChevronUp, ChevronDown, Activity, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export const RadioTuner: React.FC = () => {
  const { channels, globalChannels } = usePlayerStore();
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combine and sort channels by popularity (Viewer Count)
  const tunedChannels = useMemo(() => {
    const allChannels = [...channels, ...globalChannels];
    const unique = Array.from(
      new Map(allChannels.map((c) => [c.id, c])).values(),
    );
    return unique.sort((a, b) => getViewerCount(b.id) - getViewerCount(a.id));
  }, [channels, globalChannels]);

  const currentIndex = tunedChannels.findIndex((c) => c.id === streamId);

  // Scroll active channel into view on mount or change
  useEffect(() => {
    if (scrollRef.current) {
      // Small timeout allows DOM to finish rendering the channels list before scrolling
      setTimeout(() => {
        const activeEl = scrollRef.current?.querySelector(
          '[data-active="true"]',
        );
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
    }
  }, [streamId, tunedChannels]);

  const tuneTo = (index: number) => {
    if (index >= 0 && index < tunedChannels.length) {
      navigate(`/live/${tunedChannels[index].id}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050914] relative overflow-hidden">
      {/* Tuner Dashboard Header */}
      <div className="p-6 bg-slate-950/80 border-b border-blue-900/30 shadow-2xl relative z-10 flex flex-col items-center justify-center">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="text-blue-500 font-mono text-xs tracking-[0.2em] flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            DIGITAL TUNER
          </div>
          <div className="text-emerald-500 font-mono text-xs flex items-center gap-1">
            <Activity className="w-3 h-3" /> LIVE
          </div>
        </div>

        {/* Active Frequency Display */}
        <div className="bg-black border border-slate-800 rounded-xl p-4 w-full flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => tuneTo(currentIndex - 1)}
            disabled={currentIndex <= 0}
            className="p-3 bg-slate-900 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          <div className="text-center flex-1 px-4">
            <div className="font-mono text-3xl font-black text-white tracking-wider glow-text drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] truncate">
              {currentIndex !== -1
                ? (
                    getViewerCount(tunedChannels[currentIndex].id) / 1000
                  ).toFixed(1)
                : "---"}
              <span className="text-lg text-blue-500 ml-1">MHz</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">
              FREQUENCY
            </div>
          </div>

          <button
            onClick={() => tuneTo(currentIndex + 1)}
            disabled={currentIndex >= tunedChannels.length - 1}
            className="p-3 bg-slate-900 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Tuner Dial (List) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 relative"
      >
        {/* Center line indicator */}
        <div className="absolute left-0 top-1/2 w-full h-[2px] bg-blue-500/20 pointer-events-none z-0"></div>

        {tunedChannels.map((channel, idx) => {
          const isActive = channel.id === streamId;
          const distance = Math.abs(currentIndex - idx);
          const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.15);
          const scale = isActive ? 1.05 : 0.95;

          return (
            <div
              key={channel.id}
              data-active={isActive}
              onClick={() => tuneTo(idx)}
              style={{ opacity, transform: `scale(${scale})` }}
              className={`relative z-10 w-full p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                isActive
                  ? "bg-blue-900/20 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "bg-transparent border border-transparent hover:bg-slate-900/50"
              }`}
            >
              {/* Dial tick mark */}
              <div
                className={`w-2 h-1 rounded-full ${isActive ? "bg-blue-500" : "bg-slate-700"}`}
              ></div>

              <div className="flex-1 min-w-0">
                <div
                  className={`font-bold truncate transition-colors ${isActive ? "text-white text-lg" : "text-slate-400"}`}
                >
                  {channel.name}
                </div>
                <div className="text-xs font-mono mt-1 flex items-center gap-2">
                  <span
                    className={isActive ? "text-blue-400" : "text-slate-600"}
                  >
                    FM {(getViewerCount(channel.id) / 1000).toFixed(1)}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-400 ml-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
