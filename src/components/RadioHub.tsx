import React, { useEffect, useState } from "react";
import { Radio, Play, Pause, Search, Loader2 } from "lucide-react";
import { Channel } from "../types";
import { parseM3U } from "../utils/m3uParser";
import { useRadioStore } from "../store/useRadioStore";
import { usePlayerStore } from "../store/usePlayerStore";
import { FALLBACK_RADIO_M3U } from "../lib/radioFallback";

const POPULAR_RADIO_ZONES = [
  "Pop",
  "Rock",
  "News",
  "Classical",
  "Electronic",
  "Jazz",
  "Local",
  "Hindi",
  "Telugu",
  "Tamil",
  "Bengali",
  "Punjabi",
];

export const RadioHub: React.FC = () => {
  const [stations, setStations] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const { activeProfileId, profiles } = usePlayerStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const regionLock = activeProfile?.regionLock || "none";
  const kidsMode = activeProfile?.isKidsMode || false;

  const {
    currentStation,
    isPlaying,
    recentlyPlayed,
    setCurrentStation,
    setIsPlaying,
  } = useRadioStore();

  useEffect(() => {
    const fetchRadio = async () => {
      try {
        const verifiedPlaylist = `https://raw.githubusercontent.com/mlwtech-org/wasmatchdu-de/validated-streams/verified_radio.m3u`;
        const fallbackPlaylist = `https://iptv-org.github.io/iptv/categories/radio.m3u`;

        let res = await fetch(verifiedPlaylist).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(fallbackPlaylist).catch(() => null);
        }

        let text = "";
        if (!res || !res.ok) {
          text = FALLBACK_RADIO_M3U;
        } else {
          text = await res.text();
        }

        let parsed = parseM3U(text);
        if (parsed.length === 0) {
          parsed = parseM3U(FALLBACK_RADIO_M3U);
        }

        // Apply strict viewer policy constraints to radio stations
        let filteredRadio = parsed;

        if (regionLock !== "none") {
          const regionMap: Record<string, string[]> = {
            tel: ["telugu"],
            tam: ["tamil"],
            hin: ["hindi"],
            ben: ["bengali"],
            pan: ["punjabi"],
            pl: ["poland", "polska"],
            de: ["deutsch", "germany"],
            us: ["usa", "america", "united states"],
          };
          const keywords = regionMap[regionLock] || [];
          filteredRadio = filteredRadio.filter((station) => {
            const nameLower = station.name.toLowerCase();
            const groupLower = (station.group || "").toLowerCase();
            return keywords.some(
              (keyword) =>
                nameLower.includes(keyword) || groupLower.includes(keyword),
            );
          });
        }

        if (kidsMode) {
          // Strictly filter for kids radio content
          filteredRadio = filteredRadio.filter((station) => {
            const nameLower = station.name.toLowerCase();
            return (
              nameLower.includes("kids") ||
              nameLower.includes("child") ||
              nameLower.includes("disney") ||
              nameLower.includes("cartoon")
            );
          });
        }

        setStations(filteredRadio);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to fetch radio");
      } finally {
        setLoading(false);
      }
    };
    fetchRadio();
  }, [regionLock, kidsMode]);

  const filteredStations = stations.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone
      ? s.group?.toLowerCase().includes(selectedZone.toLowerCase()) ||
        s.name.toLowerCase().includes(selectedZone.toLowerCase())
      : true;
    return matchesSearch && matchesZone;
  });

  return (
    <div className="flex-1 bg-slate-950 min-h-screen p-4 lg:p-8 ml-0 lg:ml-64 transition-all overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-16 md:mt-0">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <Radio className="w-10 h-10 text-pink-500" />
              Radio Hub
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Live internet radio from around the world
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>
        </div>

        {/* POPULAR ZONES */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedZone(null)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedZone === null
                ? "bg-pink-500 text-white"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            All Stations
          </button>
          {POPULAR_RADIO_ZONES.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedZone === zone
                  ? "bg-pink-500 text-white"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* STATIONS GRID */}
          <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl text-center border border-red-500/20">
                <p className="font-semibold text-lg">
                  Could not load radio stations
                </p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredStations.slice(0, 100).map((station, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentStation(station);
                      setIsPlaying(true);
                      usePlayerStore.getState().setCurrentChannel(null); // Pause TV
                    }}
                    className={`flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 border ${
                      currentStation?.url === station.url
                        ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)] ring-2 ring-pink-500"
                        : "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:-translate-y-1"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mb-4 overflow-hidden shadow-inner p-2 relative group">
                      {station.logo ? (
                        <img
                          src={station.logo}
                          alt=""
                          className={`w-full h-full object-contain ${currentStation?.url === station.url && isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=1e293b&color=ec4899&size=200&font-size=0.33`;
                            (e.target as HTMLImageElement).onerror = null;
                          }}
                        />
                      ) : (
                        <Radio className="w-8 h-8 text-slate-600" />
                      )}

                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full backdrop-blur-sm">
                        {currentStation?.url === station.url && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white line-clamp-2 leading-tight text-sm">
                      {station.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                      {station.group || "Radio"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: RECENTLY PLAYED */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-pink-500" /> Recently Played
            </h2>
            {recentlyPlayed.length === 0 ? (
              <div className="bg-slate-900/50 p-8 rounded-2xl text-center border border-slate-800">
                <p className="text-slate-400">
                  No recently played stations yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlyPlayed.map((station, idx) => (
                  <button
                    key={`recent-${idx}`}
                    onClick={() => {
                      setCurrentStation(station);
                      setIsPlaying(true);
                      usePlayerStore.getState().setCurrentChannel(null); // Pause TV
                    }}
                    className={`flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 border ${
                      currentStation?.url === station.url
                        ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)] ring-2 ring-pink-500"
                        : "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:-translate-y-1"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mb-4 overflow-hidden shadow-inner p-2 relative group">
                      {station.logo ? (
                        <img
                          src={station.logo}
                          alt=""
                          className={`w-full h-full object-contain ${currentStation?.url === station.url && isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=1e293b&color=ec4899&size=200&font-size=0.33`;
                            (e.target as HTMLImageElement).onerror = null;
                          }}
                        />
                      ) : (
                        <Radio className="w-8 h-8 text-slate-600" />
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full backdrop-blur-sm">
                        {currentStation?.url === station.url && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white line-clamp-2 leading-tight">
                      {station.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                      {station.group || "Radio"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
