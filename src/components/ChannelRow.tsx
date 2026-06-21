import React, { useRef } from "react";
import { Channel } from "../types";
import { usePlayerStore } from "../store/usePlayerStore";
import { PlayCircle, Tv, Heart } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface ChannelRowProps {
  title: string;
  channels: Channel[];
}

export const ChannelRow: React.FC<ChannelRowProps> = ({ title, channels }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    setCurrentChannel,
    setCurrentPlaylist,
    currentChannel,
    favorites,
    toggleFavorite,
    kidsMode,
  } = usePlayerStore();

  if (channels.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-4 px-6 md:px-12 flex items-center gap-2">
        {title}
      </h3>

      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-12 pb-6 snap-x snap-mandatory touch-pan-x"
        >
          {channels.map((channel) => {
            const isFav = favorites.includes(channel.id);
            const isPlaying = currentChannel?.id === channel.id;

            return (
              <div
                key={channel.id}
                onClick={() => {
                  setCurrentPlaylist(channels);
                  setCurrentChannel(channel);
                }}
                className={cn(
                  "relative flex-none w-[280px] md:w-[320px] aspect-video bg-slate-900 rounded-xl overflow-hidden cursor-pointer group/card snap-start transition-all duration-300 transform",
                  "hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-black/50 border border-slate-800 hover:border-slate-600",
                  isPlaying ? "ring-2 ring-blue-500 scale-[1.02]" : "",
                )}
              >
                {/* Fallback pattern or dynamic image */}
                <div className="absolute inset-0 opacity-20 group-hover/card:opacity-40 transition-opacity bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-20 h-20 object-contain drop-shadow-2xl transform transition-transform group-hover/card:scale-110 mb-2"
                    />
                  ) : (
                    <Tv className="w-16 h-16 text-slate-500 mb-2" />
                  )}

                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-2 group-hover/card:translate-y-0 opacity-80 group-hover/card:opacity-100 transition-all">
                    <h4 className="font-bold text-white truncate text-lg drop-shadow-md">
                      {channel.name}
                    </h4>
                    {channel.isRegional && (
                      <p className="text-xs font-semibold text-blue-400 mt-1 uppercase tracking-wider">
                        Regional
                      </p>
                    )}
                  </div>
                </div>

                {/* Overlays on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <PlayCircle className="w-14 h-14 text-white drop-shadow-2xl transform scale-75 group-hover/card:scale-100 transition-transform" />
                </div>

                {/* Favorite Toggle */}
                {!kidsMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(channel.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover/card:opacity-100 transition-all hover:bg-black/80"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5",
                        isFav ? "fill-red-500 text-red-500" : "text-white",
                      )}
                    />
                  </button>
                )}

                {/* Live Indicator */}
                {isPlaying && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1 shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Live
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
