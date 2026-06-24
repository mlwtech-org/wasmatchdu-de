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

const COUNTRIES = [
  { code: "us", name: "United States", emoji: "🇺🇸" },
  { code: "gb", name: "United Kingdom", emoji: "🇬🇧" },
  { code: "de", name: "Germany", emoji: "🇩🇪" },
  { code: "in", name: "India", emoji: "🇮🇳" },
  { code: "es", name: "Spain", emoji: "🇪🇸" },
  { code: "fr", name: "France", emoji: "🇫🇷" },
  { code: "it", name: "Italy", emoji: "🇮🇹" },
  { code: "br", name: "Brazil", emoji: "🇧🇷" },
  { code: "mx", name: "Mexico", emoji: "🇲🇽" },
  { code: "jp", name: "Japan", emoji: "🇯🇵" },
  { code: "kr", name: "South Korea", emoji: "🇰🇷" },
  { code: "au", name: "Australia", emoji: "🇦🇺" },
  { code: "ca", name: "Canada", emoji: "🇨🇦" },
  { code: "tr", name: "Turkey", emoji: "🇹🇷" },
  { code: "ru", name: "Russia", emoji: "🇷🇺" },
  { code: "za", name: "South Africa", emoji: "🇿🇦" },
];

export const CountryGrid: React.FC<CountryGridProps> = ({
  onSelectCountry,
}) => {
  const { setChannels, setIsLoading, setError, channels } = usePlayerStore();
  const [loadingCountry, setLoadingCountry] = useState<string | null>(null);

  const fetchCountryChannels = async (code: string) => {
    setLoadingCountry(code);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://iptv-org.github.io/iptv/countries/${code}.m3u`,
      );
      if (!response.ok) throw new Error("Failed to load country playlist");

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
          Select a country to instantly load its local broadcast channels, news,
          and entertainment.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-24">
        {COUNTRIES.map((country) => (
          <button
            key={country.code}
            onClick={() => fetchCountryChannels(country.code)}
            disabled={loadingCountry !== null}
            className={cn(
              "group relative flex flex-col items-center p-6 bg-slate-900 rounded-2xl border border-slate-800 transition-all duration-300",
              "hover:bg-slate-800 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50",
              loadingCountry === country.code &&
                "animate-pulse ring-2 ring-blue-500",
            )}
          >
            <div className="text-6xl mb-4 transform transition-transform group-hover:scale-110 group-hover:-rotate-3 drop-shadow-2xl">
              {country.emoji}
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-1">
              {country.name}
            </h3>

            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              {country.code}
            </p>

            {loadingCountry === country.code ? (
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
