import React, { useRef, useState } from "react";
import { Channel } from "../types";
import { usePlayerStore } from "../store/usePlayerStore";
import { PlayCircle, Tv, Heart, Flame, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface ChannelRowProps {
  title: string;
  channels: Channel[];
  isTrending?: boolean;
}

export const ChannelRow: React.FC<ChannelRowProps> = ({
  title,
  channels,
  isTrending,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    setCurrentPlaylist,
    currentChannel,
    favorites,
    toggleFavorite,
    kidsMode,
  } = usePlayerStore();

  const navigate = useNavigate();
  const [isViewAll, setIsViewAll] = useState(false);

  if (channels.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-6 md:px-12 mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          {title}
        </h3>
        {channels.length > 4 && (
          <button
            onClick={() => setIsViewAll(!isViewAll)}
            className="text-sm md:text-base font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-full"
          >
            {isViewAll ? "Show Less" : "View All"}
          </button>
        )}
      </div>

      <div className="relative group">
        <div
          ref={scrollRef}
          className={cn(
            "gap-4 px-6 md:px-12 pb-6",
            isViewAll
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 auto-rows-max"
              : "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x",
          )}
        >
          {channels.map((channel) => {
            const isFav = favorites.includes(channel.id);
            const isPlaying = currentChannel?.id === channel.id;

            // Pseudo-random viewer count for demo purposes
            let hash = 0;
            for (let i = 0; i < channel.id.length; i++)
              hash = channel.id.charCodeAt(i) + ((hash << 5) - hash);
            const viewerCount = (Math.abs(hash) % 49000) + 1200;

            return (
              <div
                key={channel.id}
                data-focusable="true"
                tabIndex={0}
                onClick={() => {
                  setCurrentPlaylist(channels);
                  navigate(`/live/${channel.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPlaylist(channels);
                    navigate(`/live/${channel.id}`);
                  }
                }}
                className={cn(
                  "relative aspect-video bg-[#0f172a] rounded-md overflow-hidden cursor-pointer group/card transition-all duration-300 transform",
                  isViewAll
                    ? "w-full"
                    : "flex-none w-[75vw] sm:w-[240px] md:w-[280px] lg:w-[320px] snap-start",
                  "hover:scale-110 hover:z-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-transparent",
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
                    {channel.currentProgram && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-emerald-400 truncate">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block mr-1.5 animate-pulse"></span>
                          {channel.currentProgram}
                        </p>
                        <div className="w-full h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.floor(Math.random() * 60) + 20}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Overlays on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm z-20">
                  <PlayCircle className="w-16 h-16 text-white drop-shadow-2xl transform scale-50 group-hover/card:scale-100 transition-all duration-300" />
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

                {/* Trending Badge */}
                {isTrending && !isPlaying && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-orange-600/90 backdrop-blur-sm text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg border border-orange-500/50">
                    <Flame className="w-3 h-3 text-yellow-300" />
                    Trending
                  </div>
                )}

                {/* Viewer Count overlay for trending items */}
                {isTrending && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-lg border border-white/10">
                    <Users className="w-3 h-3 text-slate-300" />
                    {(viewerCount / 1000).toFixed(1)}k
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
