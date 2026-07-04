import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { parseM3U } from "../utils/m3uParser";
import { Globe2, Loader2, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

interface CountryGridProps {
  onSelectCountry: () => void;
}

interface RegionInfo {
  code: string;
  name: string;
  emoji: string;
  type: "country" | "language";
}

const REGIONS: RegionInfo[] = [
  // Countries
  { code: "us", name: "United States", emoji: "🇺🇸", type: "country" },
  { code: "gb", name: "United Kingdom", emoji: "🇬🇧", type: "country" },
  { code: "de", name: "Germany", emoji: "🇩🇪", type: "country" },
  { code: "in", name: "India", emoji: "🇮🇳", type: "country" },
  { code: "pl", name: "Poland", emoji: "🇵🇱", type: "country" },
  { code: "es", name: "Spain", emoji: "🇪🇸", type: "country" },
  { code: "fr", name: "France", emoji: "🇫🇷", type: "country" },
  { code: "it", name: "Italy", emoji: "🇮🇹", type: "country" },
  { code: "br", name: "Brazil", emoji: "🇧🇷", type: "country" },
  { code: "mx", name: "Mexico", emoji: "🇲🇽", type: "country" },
  { code: "jp", name: "Japan", emoji: "🇯🇵", type: "country" },
  { code: "kr", name: "South Korea", emoji: "🇰🇷", type: "country" },
  { code: "au", name: "Australia", emoji: "🇦🇺", type: "country" },
  { code: "ca", name: "Canada", emoji: "🇨🇦", type: "country" },
  { code: "tr", name: "Turkey", emoji: "🇹🇷", type: "country" },
  { code: "ru", name: "Russia", emoji: "🇷🇺", type: "country" },
  { code: "za", name: "South Africa", emoji: "🇿🇦", type: "country" },
  
  // Languages (Regional)
  { code: "hin", name: "Hindi", emoji: "🕉️", type: "language" },
  { code: "tel", name: "Telugu", emoji: "🛕", type: "language" },
  { code: "tam", name: "Tamil", emoji: "🎬", type: "language" },
  { code: "ben", name: "Bengali", emoji: "🐅", type: "language" },
  { code: "pan", name: "Punjabi", emoji: "🌾", type: "language" },
];

export const CountryGrid: React.FC<CountryGridProps> = ({
  onSelectCountry,
}) => {
  const { setChannels, setIsLoading, setError, channels } = usePlayerStore();
  const [loadingCountry, setLoadingCountry] = useState<string | null>(null);

  const fetchRegionChannels = async (region: RegionInfo) => {
    setLoadingCountry(region.code);
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = region.type === "language" 
        ? `https://iptv-org.github.io/iptv/languages/${region.code}.m3u`
        : `https://iptv-org.github.io/iptv/countries/${region.code}.m3u`;
        
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to load regional playlist");

      const text = await response.text();
      const parsedChannels = parseM3U(text);

      // Merge with existing channels to avoid losing globals, but put new ones first
      const uniqueChannelsMap = new Map();
      [...parsedChannels, ...channels].forEach((c) => {
        if (!uniqueChannelsMap.has(c.url)) {
          uniqueChannelsMap.set(c.url, c);
        }
      });

      setChannels(Array.from(uniqueChannelsMap.values()));

      // Let the Dashboard know we are done and switch back to "home"
      onSelectCountry();
    } catch (err) {
      console.error(err);
      setError("Could not load regional channels for this country.");
    } finally {
      setLoadingCountry(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-3xl md:text-5xl font-black text-white flex items-center justify-center md:justify-start gap-4 mb-4 drop-shadow-xl">
          <Globe2 className="w-10 h-10 md:w-14 md:h-14 text-blue-500" />
          Regional Explorer
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl font-medium">
          Select a country or language to instantly load local broadcast channels, news,
          and entertainment.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-24">
        {REGIONS.map((region) => (
          <button
            key={`${region.type}-${region.code}`}
            onClick={() => fetchRegionChannels(region)}
            disabled={loadingCountry !== null}
            className={cn(
              "group relative flex flex-col items-center p-6 bg-slate-900 rounded-2xl border border-slate-800 transition-all duration-300",
              "hover:bg-slate-800 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50",
              loadingCountry === region.code &&
                "animate-pulse ring-2 ring-blue-500",
            )}
          >
            <div className="text-6xl mb-4 transform transition-transform group-hover:scale-110 group-hover:-rotate-3 drop-shadow-2xl">
              {region.emoji}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">
                {region.name}
              </h3>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                {region.code.toUpperCase()} • {region.type === 'language' ? 'LANG' : 'GEO'}
              </span>
            </div> {loadingCountry === region.code ? (
              <div className="absolute top-4 right-4 bg-blue-500/20 p-2 rounded-full backdrop-blur-md">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ChevronRight className="w-5 h-5 text-blue-400" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
