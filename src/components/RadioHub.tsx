import React, { useEffect, useState, useRef, useCallback } from "react";
import { Radio, Play, Pause, Volume2, Search, Loader2 } from "lucide-react";
import { Channel } from "../types";
import { parseM3U } from "../utils/m3uParser";
import { useRadioStore } from "../store/useRadioStore";
import Hls from "hls.js";

const POPULAR_RADIO_ZONES = [
  "Pop",
  "Rock",
  "News",
  "Classical",
  "Electronic",
  "Jazz",
  "Local",
];

export const RadioHub: React.FC = () => {
  const [stations, setStations] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const {
    currentStation,
    isPlaying,
    volume,
    setCurrentStation,
    setIsPlaying,
    setVolume,
  } = useRadioStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const fetchRadio = async () => {
      try {
        const verifiedPlaylist = `https://raw.githubusercontent.com/mlwtech-org/wasmatchdu-de/validated-streams/verified_radio.m3u`;
        const fallbackPlaylist = `https://iptv-org.github.io/iptv/categories/radio.m3u`;

        let res = await fetch(verifiedPlaylist).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(fallbackPlaylist);
        }

        if (!res.ok) throw new Error("Failed to load radio stations");

        const text = await res.text();
        const parsed = parseM3U(text);

        // Some feeds have too many, limit to 200 for performance if needed, or keep all
        setStations(parsed);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to fetch radio");
      } finally {
        setLoading(false);
      }
    };
    fetchRadio();
  }, []);

  useEffect(() => {
    if (audioRef.current && currentStation) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      if (currentStation.url.includes(".m3u8")) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(currentStation.url);
          hls.attachMedia(audioRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isPlaying) audioRef.current?.play();
          });
          hlsRef.current = hls;
        } else if (
          audioRef.current.canPlayType("application/vnd.apple.mpegurl")
        ) {
          audioRef.current.src = currentStation.url;
          if (isPlaying) audioRef.current.play();
        }
      } else {
        audioRef.current.src = currentStation.url;
        if (isPlaying) audioRef.current.play();
      }
    }
  }, [currentStation, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  const togglePlay = useCallback(
    () => setIsPlaying(!isPlaying),
    [isPlaying, setIsPlaying],
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

        {/* ACTIVE PLAYER BAR */}
        {currentStation && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl border border-slate-700/50">
            <div
              className={`w-24 h-24 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-4 border-slate-800 shadow-xl ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}
            >
              {currentStation.logo ? (
                <img
                  src={currentStation.logo}
                  alt=""
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Radio className="w-10 h-10 text-slate-600" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentStation.name}
              </h2>
              <p className="text-pink-400 font-medium">
                {currentStation.group || "Live Radio"}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-full">
                <Volume2 className="w-5 h-5 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-pink-500"
                />
              </div>
            </div>

            <audio ref={audioRef} />
          </div>
        )}

        {/* STATIONS GRID */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredStations.slice(0, 100).map((station, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStation(station)}
                className={`flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 border ${
                  currentStation?.url === station.url
                    ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                    : "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 hover:-translate-y-1"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mb-4 overflow-hidden shadow-inner p-2">
                  {station.logo ? (
                    <img
                      src={station.logo}
                      alt=""
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Radio className="w-8 h-8 text-slate-600" />
                  )}
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
  );
};
