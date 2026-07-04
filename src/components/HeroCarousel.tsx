import React, { useMemo } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { VideoPlayer } from "./VideoPlayer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FALLBACK_CHANNELS } from "../lib/constants";
import { CategoryIcon } from "./CategoryIcon";
import { Channel } from "../types";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface HeroCarouselProps {
  featuredChannels?: Channel[];
}

// Ensure we have a default list even if somehow missing
const defaultFeatured = FALLBACK_CHANNELS.slice(0, 5);

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  featuredChannels = defaultFeatured,
}) => {
  const { currentChannel, setCurrentChannel } = usePlayerStore();

  const currentIndex = useMemo(() => {
    if (!currentChannel) return -1;
    return featuredChannels.findIndex((c) => c.id === currentChannel.id);
  }, [currentChannel, featuredChannels]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex <= 0) {
      setCurrentChannel(featuredChannels[featuredChannels.length - 1]);
    } else {
      setCurrentChannel(featuredChannels[currentIndex - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex === -1 || currentIndex >= featuredChannels.length - 1) {
      setCurrentChannel(featuredChannels[0]);
    } else {
      setCurrentChannel(featuredChannels[currentIndex + 1]);
    }
  };

  const handleSelectChannel = (e: React.MouseEvent, channel: Channel) => {
    e.stopPropagation();
    setCurrentChannel(channel);
  };

  // If no channel is selected yet, we still render the carousel structure
  // but VideoPlayer will show its default state (or we select the first featured channel).
  // Dashboard usually handles selecting a channel if none is selected.

  return (
    <div className="relative w-full h-full group">
      {/* Background Video Player */}
      <VideoPlayer />

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-[40%] -translate-y-1/2 z-50 p-2 lg:p-3 bg-black/40 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-[40%] -translate-y-1/2 z-50 p-2 lg:p-3 bg-black/40 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md border border-white/10 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
      </button>

      {/* Bottom Overlay Gradient for text readability */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10" />

      {/* Bottom Channel Cards Container */}
      <div className="absolute bottom-4 inset-x-0 z-40 px-4">
        <div className="flex items-end gap-4 max-w-[1600px] mx-auto overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
          {featuredChannels.map((channel) => {
            const isActive = currentChannel?.id === channel.id;

            return (
              <button
                key={channel.id}
                onClick={(e) => handleSelectChannel(e, channel)}
                className={cn(
                  "snap-start shrink-0 w-[260px] md:w-[300px] text-left relative overflow-hidden rounded-xl transition-all duration-300",
                  "bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:bg-slate-800/80",
                  isActive
                    ? "ring-1 ring-blue-500 shadow-[0_8px_30px_rgba(59,130,246,0.2)] transform -translate-y-2 bg-slate-800/90"
                    : "opacity-75 hover:opacity-100 hover:-translate-y-1",
                )}
              >
                {/* Active Highlight Border */}
                {isActive && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
                )}

                <div className="p-4 flex flex-col h-full gap-3">
                  <div className="flex items-center gap-3">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-12 h-12 object-contain bg-slate-950/50 rounded-lg p-1.5 shadow-inner"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner">
                        <CategoryIcon
                          channel={channel}
                          className="w-6 h-6 text-slate-400"
                        />
                      </div>
                    )}

                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="font-bold text-white truncate text-base md:text-lg">
                        {channel.name}
                      </span>
                      {isActive ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span className="text-[11px] md:text-xs text-emerald-400 font-bold tracking-wider uppercase">
                            Live Now
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] md:text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">
                          Select to watch
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mock Program Info or actual if available in the future */}
                  <div className="text-sm text-slate-300 truncate font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    Live: {channel.gemeinwohlCategory || "News Desk"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
