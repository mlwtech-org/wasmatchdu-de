import React, { useState } from "react";
import { Search, Compass, Activity } from "lucide-react";
import { Channel } from "../types";
import { ChannelRow } from "./ChannelRow";
import {
  sortChannelsByPopularity,
  sortChannelsAlphabetically,
} from "../utils/sorting";
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
  channels?: Channel[];
  onSelectCategory: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  channels = [],
  onSelectCategory,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const allCategories = [...GEMEINWOHL_CATEGORIES, ...POPULAR_ZONES];

  // Which categories to display as rows
  const displayCategories =
    activeFilter === "All" ? allCategories : [activeFilter];

  return (
    <div className="pb-32 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 relative min-h-screen">
      {/* Dynamic Header */}
      <div className="sticky top-16 md:top-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-cyan-900/30 pt-8 pb-6 px-6 md:px-12 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-tight flex items-center gap-4">
              <Compass className="w-10 h-10 text-cyan-400" />
              Discover
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-lg">
              Explore thousands of live channels across our premium catalog
            </p>
          </div>
          <button
            onClick={() => onSelectCategory("")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transform hover:-translate-y-1"
          >
            <Search className="w-5 h-5" />
            Search Catalog
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-3 mt-8 overflow-x-auto scrollbar-hide pb-2 snap-x">
          <button
            onClick={() => setActiveFilter("All")}
            className={cn(
              "whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all snap-start shadow-md border",
              activeFilter === "All"
                ? "bg-cyan-500 text-slate-950 border-cyan-400"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-600",
            )}
          >
            All Genres
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all snap-start shadow-md border",
                activeFilter === cat
                  ? "bg-cyan-500 text-slate-950 border-cyan-400"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-600",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content Shelves */}
      <div className="mt-8 space-y-2 lg:space-y-6">
        {displayCategories.map((category) => {
          let categoryChannels = channels.filter((c) => {
            const matchesCategory =
              c.gemeinwohlCategory
                ?.toLowerCase()
                .includes(category.toLowerCase()) ||
              c.group?.toLowerCase().includes(category.toLowerCase()) ||
              c.name.toLowerCase().includes(category.toLowerCase());
            return matchesCategory;
          });

          if (categoryChannels.length === 0) return null;

          // Apply best-in-class sorting
          if (POPULAR_ZONES.includes(category)) {
            categoryChannels = sortChannelsByPopularity(categoryChannels);
          } else {
            categoryChannels = sortChannelsAlphabetically(categoryChannels);
          }

          return (
            <div key={category} className="group/shelf relative">
              {/* Quick navigation to full category view via main Dashboard search */}
              <div className="absolute top-2 right-6 md:right-12 z-20 opacity-0 group-hover/shelf:opacity-100 transition-opacity">
                <button
                  onClick={() => onSelectCategory(category)}
                  className="text-sm font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-sm"
                >
                  View Full Grid
                </button>
              </div>
              <ChannelRow
                title={category}
                channels={categoryChannels.slice(0, 50)} // Limit to top 50 for performance
              />
            </div>
          );
        })}

        {displayCategories.every((cat) => {
          return (
            channels.filter((c) => {
              const matchesCategory =
                c.gemeinwohlCategory
                  ?.toLowerCase()
                  .includes(cat.toLowerCase()) ||
                c.group?.toLowerCase().includes(cat.toLowerCase()) ||
                c.name.toLowerCase().includes(cat.toLowerCase());
              return matchesCategory;
            }).length === 0
          );
        }) && (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-6">
              <Activity className="w-12 h-12 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">
              No Content Available
            </h3>
            <p className="text-slate-400 max-w-md mx-auto text-lg">
              There are currently no channels available in the selected filters
              based on your profile settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
