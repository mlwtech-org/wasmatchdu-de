import React from "react";
import { Tv, Globe, Heart, BookOpen, Film, Trophy, Map, Activity, Laugh, ShieldAlert, Rocket, TreePine } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

const GEMEINWOHL_CATEGORIES = [
  "Filme & Serien",
  "Sport & Action",
  "Doku & Wissen",
  "Nachrichten & Info",
  "Shows & Comedy",
  "Kinder & Familie",
  "Lokal & Regional",
  "Unterhaltung",
];

const POPULAR_ZONES = [
  "24/7 Sports",
  "Romantic Comedy",
  "Comedy",
  "Crime",
  "Sci-Fi",
  "Nature Documentary",
];

interface CategoryGridProps {
  onSelectCategory: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
}) => {
  const categoryConfig: Record<
    string,
    { bgClass: string; icon: React.ReactNode }
  > = {
    "Filme & Serien": {
      bgClass: "bg-gradient-to-br from-indigo-900 to-purple-900",
      icon: (
        <Film className="w-24 h-24 absolute right-8 top-8 opacity-20 text-purple-300 transform -rotate-12" />
      ),
    },
    "Sport & Action": {
      bgClass: "bg-gradient-to-br from-green-900 to-emerald-900",
      icon: (
        <Trophy className="w-24 h-24 absolute right-8 top-8 opacity-20 text-emerald-300 transform rotate-12" />
      ),
    },
    "Doku & Wissen": {
      bgClass: "bg-gradient-to-br from-blue-900 to-cyan-900",
      icon: (
        <BookOpen className="w-24 h-24 absolute right-8 top-8 opacity-20 text-cyan-300 transform -rotate-12" />
      ),
    },
    "Nachrichten & Info": {
      bgClass: "bg-gradient-to-br from-slate-800 to-slate-950",
      icon: (
        <Globe className="w-24 h-24 absolute right-8 top-8 opacity-20 text-slate-300 transform rotate-12" />
      ),
    },
    "Shows & Comedy": {
      bgClass: "bg-gradient-to-br from-pink-900 to-rose-900",
      icon: (
        <Tv className="w-24 h-24 absolute right-8 top-8 opacity-20 text-rose-300 transform -rotate-12" />
      ),
    },
    "Kinder & Familie": {
      bgClass: "bg-gradient-to-br from-yellow-900 to-orange-900",
      icon: (
        <Heart className="w-24 h-24 absolute right-8 top-8 opacity-20 text-orange-300 transform rotate-12" />
      ),
    },
    "Lokal & Regional": {
      bgClass: "bg-gradient-to-br from-teal-900 to-blue-900",
      icon: (
        <Map className="w-24 h-24 absolute right-8 top-8 opacity-20 text-blue-300 transform -rotate-12" />
      ),
    },
    Unterhaltung: {
      bgClass: "bg-gradient-to-br from-orange-900 to-red-900",
      icon: (
        <Tv className="w-24 h-24 absolute right-8 top-8 opacity-20 text-red-300 transform rotate-12" />
      ),
    },
    // POPULAR ZONES
    "24/7 Sports": {
      bgClass: "bg-gradient-to-br from-red-900 to-orange-900",
      icon: (
        <Activity className="w-24 h-24 absolute right-8 top-8 opacity-20 text-orange-300 transform -rotate-12" />
      ),
    },
    "Romantic Comedy": {
      bgClass: "bg-gradient-to-br from-pink-800 to-rose-700",
      icon: (
        <Heart className="w-24 h-24 absolute right-8 top-8 opacity-20 text-pink-300 transform rotate-12" />
      ),
    },
    "Comedy": {
      bgClass: "bg-gradient-to-br from-yellow-800 to-amber-700",
      icon: (
        <Laugh className="w-24 h-24 absolute right-8 top-8 opacity-20 text-yellow-300 transform -rotate-12" />
      ),
    },
    "Crime": {
      bgClass: "bg-gradient-to-br from-slate-900 to-zinc-900",
      icon: (
        <ShieldAlert className="w-24 h-24 absolute right-8 top-8 opacity-20 text-slate-400 transform rotate-6" />
      ),
    },
    "Sci-Fi": {
      bgClass: "bg-gradient-to-br from-cyan-900 to-blue-900",
      icon: (
        <Rocket className="w-24 h-24 absolute right-8 top-8 opacity-20 text-cyan-300 transform -rotate-45" />
      ),
    },
    "Nature Documentary": {
      bgClass: "bg-gradient-to-br from-emerald-900 to-green-800",
      icon: (
        <TreePine className="w-24 h-24 absolute right-8 top-8 opacity-20 text-green-300 transform rotate-6" />
      ),
    },
  };

  return (
    <div className="pt-24 px-6 md:px-12 pb-24 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tight">
        Categories
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {GEMEINWOHL_CATEGORIES.map((category) => {
          const config = categoryConfig[category] || {
            bgClass: "bg-slate-800",
            icon: (
              <Tv className="w-24 h-24 absolute right-8 top-8 opacity-20" />
            ),
          };

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "relative text-left aspect-video rounded-2xl overflow-hidden group transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.02]",
                config.bgClass,
              )}
            >
              {config.icon}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Title */}
              <h3 className="absolute bottom-6 left-6 right-6 text-2xl md:text-3xl font-black text-white drop-shadow-md leading-tight group-hover:text-blue-400 transition-colors">
                {category}
              </h3>
            </button>
          );
        })}
      </div>

      {/* POPULAR ZONES & GENRES SECTION */}
      <h2 className="text-3xl md:text-4xl font-black text-white mt-16 mb-8 tracking-tight flex items-center gap-3">
        <Activity className="w-8 h-8 text-pink-500" />
        Popular Zones & Genres
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {POPULAR_ZONES.map((category) => {
          const config = categoryConfig[category] || {
            bgClass: "bg-slate-800",
            icon: (
              <Tv className="w-16 h-16 absolute right-4 top-4 opacity-20" />
            ),
          };

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "relative text-left aspect-[4/3] rounded-2xl overflow-hidden group transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1",
                config.bgClass,
              )}
            >
              {config.icon}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

              {/* Title */}
              <h3 className="absolute bottom-4 left-4 right-4 text-xl md:text-2xl font-bold text-white drop-shadow-md leading-tight group-hover:text-pink-400 transition-colors">
                {category}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
};
