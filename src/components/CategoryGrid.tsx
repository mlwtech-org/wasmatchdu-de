import React from "react";
import { Tv, Globe, Heart, BookOpen, Film, Trophy, Map } from "lucide-react";
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
    </div>
  );
};
