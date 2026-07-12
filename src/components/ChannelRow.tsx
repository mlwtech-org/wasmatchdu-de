import React, { useRef, useState } from "react";
import { Channel } from "../types";
import { usePlayerStore } from "../store/usePlayerStore";
import { CategoryIcon } from "./CategoryIcon";
import { PlayCircle, Heart, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <div className="mb-8 relative z-10">
      <div className="flex items-center justify-between px-6 md:px-12 mb-4">
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-white/90 drop-shadow-md flex items-center gap-2">
          {title}
        </h3>
        {channels.length > 4 && (
          <button
            onClick={() => setIsViewAll(!isViewAll)}
            className="text-sm md:text-base font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/5 hover:bg-cyan-400/10 border border-cyan-500/20 hover:border-cyan-500/40 px-4 py-1.5 rounded-full backdrop-blur-md"
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
              <motion.div
                key={channel.id}
                data-focusable="true"
                tabIndex={0}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                  "relative aspect-video rounded-xl overflow-hidden cursor-pointer group/card glass-card hover-glow",
                  isViewAll
                    ? "w-full"
                    : "flex-none w-[75vw] sm:w-[240px] md:w-[280px] lg:w-[320px] snap-start",
                  isPlaying
                    ? "ring-2 ring-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-[1.02]"
                    : "",
                )}
              >
                {/* Stylized CSS category preview background */}
                {(() => {
                  const gradients = [
                    "from-cyan-950/40 via-[#050505] to-[#050505]",
                    "from-emerald-950/40 via-[#050505] to-[#050505]",
                    "from-rose-950/40 via-[#050505] to-[#050505]",
                    "from-indigo-950/40 via-[#050505] to-[#050505]",
                    "from-fuchsia-950/40 via-[#050505] to-[#050505]",
                  ];
                  const hash = channel.id
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const gradient = gradients[hash % gradients.length];

                  return (
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br transition-all duration-700 opacity-60 group-hover/card:opacity-100 scale-105 group-hover/card:scale-100",
                        gradient,
                      )}
                    />
                  );
                })()}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                  {channel.logo ? (
                    <>
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transform transition-transform duration-500 ease-out group-hover/card:scale-110 group-hover/card:-translate-y-2 mb-2"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextElementSibling) {
                            (
                              e.currentTarget.nextElementSibling as HTMLElement
                            ).style.display = "flex";
                          }
                        }}
                      />
                      <div
                        className="hidden items-center justify-center mb-2"
                        style={{ width: "6rem", height: "6rem" }}
                      >
                        <CategoryIcon
                          channel={channel}
                          className="w-16 h-16 text-white/30"
                        />
                      </div>
                    </>
                  ) : (
                    <CategoryIcon
                      channel={channel}
                      className="w-20 h-20 text-white/20 mb-2 transform transition-transform duration-500 group-hover/card:scale-110 group-hover/card:text-white/40"
                    />
                  )}

                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-2 group-hover/card:translate-y-0 opacity-90 group-hover/card:opacity-100 transition-all duration-300">
                    <h4 className="font-bold text-white truncate text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {channel.name}
                    </h4>
                    {channel.isRegional && (
                      <p className="text-[10px] font-black text-cyan-400 mt-1 uppercase tracking-widest drop-shadow-md">
                        Regional
                      </p>
                    )}
                    {channel.currentProgram && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-emerald-400 truncate drop-shadow-md">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block mr-1.5 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                          {channel.currentProgram}
                        </p>
                        <div className="w-full h-0.5 bg-white/10 rounded-full mt-2 overflow-hidden backdrop-blur-sm">
                          <div
                            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] rounded-full"
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                  <PlayCircle className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform scale-50 group-hover/card:scale-100 transition-all duration-500 ease-out" />
                </div>

                {/* Favorite Toggle */}
                {!kidsMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(channel.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/40 border border-white/10 backdrop-blur-md rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 hover:bg-white/10 hover:scale-110 z-30"
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isFav
                          ? "fill-red-500 text-red-500 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                          : "text-white/80",
                      )}
                    />
                  </button>
                )}

                {/* Live Indicator / Viewer Count */}
                {isPlaying ? (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 border border-red-500/40 backdrop-blur-md text-red-400 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)] z-10">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,1)]"></span>
                    Live
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 border border-white/10 backdrop-blur-md text-white/80 text-[10px] font-bold rounded flex items-center gap-1.5 shadow-lg z-10 transition-colors group-hover/card:border-red-500/30 group-hover/card:text-red-400">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse group-hover/card:bg-red-500 group-hover/card:shadow-[0_0_5px_rgba(239,68,68,0.8)] transition-colors"></span>
                    {(viewerCount / 1000).toFixed(1)}k
                  </div>
                )}

                {/* Trending Badge */}
                {isTrending && !isPlaying && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 border border-orange-500/30 backdrop-blur-md text-orange-400 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.2)] z-10">
                    <Flame className="w-3 h-3 text-orange-400" />
                    Hot
                  </div>
                )}

                {/* Provider Badge */}
                {channel.provider && (
                  <div className="absolute top-3 right-12 md:right-16 px-2.5 py-1 bg-white/5 backdrop-blur-md text-white/60 text-[9px] font-black tracking-widest uppercase rounded-full flex items-center gap-1 shadow-lg border border-white/10 transform transition-all z-10 group-hover/card:bg-white/10 group-hover/card:text-white group-hover/card:border-white/20">
                    {channel.provider}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
