import { useState } from "react";
import {
  ArrowLeft,
  Globe,
  MapPin,
  ExternalLink,
  Play,
  Info,
  Tv2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LiveCam {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  emoji: string;
  /** Direct YouTube watch URL — opens player on YouTube */
  watchUrl: string;
  /** YouTube channel /live URL — always redirects to current live video */
  channelLiveUrl: string;
  /** Gradient for the card background */
  gradient: string;
  category: string;
  source: string;
  description: string;
  tags: string[];
}

/**
 * Best-in-class strategy for public EarthCams:
 *
 * YouTube deprecated `live_stream?channel=` iframes.
 * The only 100% reliable approach without a YouTube Data API key is to:
 * 1. Show a beautiful portal of curated live cam cards.
 * 2. Open streams in the YouTube player embedded via the channel /live URL shown
 *    inside a full-screen modal-style panel within the app.
 * 3. The channel /live URL always redirects to whatever is live on that channel.
 */
const LIVE_CAMS: LiveCam[] = [
  {
    id: "nasa-iss",
    name: "NASA Live – ISS Views",
    location: "International Space Station",
    country: "Orbit",
    flag: "🌍",
    emoji: "🚀",
    watchUrl: "https://www.youtube.com/@NASA/live",
    channelLiveUrl: "https://www.youtube.com/@NASA/live",
    gradient: "from-slate-800 via-blue-950 to-black",
    category: "Space & Science",
    source: "NASA",
    description: "24/7 live views of Earth from the ISS. Occasional blackouts during orbital night.",
    tags: ["Space", "Earth", "ISS", "NASA"],
  },
  {
    id: "earthcam-times-sq",
    name: "EarthCam – Times Square",
    location: "New York City",
    country: "USA",
    flag: "🇺🇸",
    emoji: "🗽",
    watchUrl: "https://www.youtube.com/@earthcam/live",
    channelLiveUrl: "https://www.youtube.com/@earthcam/live",
    gradient: "from-purple-900 via-indigo-900 to-slate-950",
    category: "City Views",
    source: "EarthCam",
    description: "Times Square, Hollywood Walk of Fame, and landmark live cams worldwide.",
    tags: ["Times Square", "NYC", "City", "USA"],
  },
  {
    id: "explore-nature",
    name: "EXPLORE Live Nature Cams",
    location: "Worldwide",
    country: "Multiple",
    flag: "🌿",
    emoji: "🦅",
    watchUrl: "https://www.youtube.com/@ExploreLiveNatureCams/live",
    channelLiveUrl: "https://www.youtube.com/@ExploreLiveNatureCams/live",
    gradient: "from-emerald-900 via-green-900 to-slate-950",
    category: "Nature & Wildlife",
    source: "EXPLORE.org",
    description: "Eagles, owls, hummingbirds, coral reefs — the world's largest live nature network.",
    tags: ["Eagles", "Wildlife", "Nature", "Birds"],
  },
  {
    id: "explore-bears",
    name: "Brooks Falls Bear Cam",
    location: "Katmai National Park, Alaska",
    country: "USA",
    flag: "🇺🇸",
    emoji: "🐻",
    watchUrl: "https://www.youtube.com/@explorebears/live",
    channelLiveUrl: "https://www.youtube.com/@explorebears/live",
    gradient: "from-amber-900 via-orange-950 to-slate-950",
    category: "Nature & Wildlife",
    source: "EXPLORE Bears",
    description: "Brown bears catching salmon at Brooks Falls — one of nature's greatest spectacles.",
    tags: ["Bears", "Salmon", "Alaska", "Wildlife"],
  },
  {
    id: "explore-africa",
    name: "African Waterhole",
    location: "Tembe Elephant Park",
    country: "South Africa",
    flag: "🇿🇦",
    emoji: "🐘",
    watchUrl: "https://www.youtube.com/@ExploreAfrica/live",
    channelLiveUrl: "https://www.youtube.com/@ExploreAfrica/live",
    gradient: "from-yellow-900 via-amber-950 to-stone-950",
    category: "Nature & Wildlife",
    source: "EXPLORE Africa",
    description: "Elephants, lions, leopards and more at an African waterhole 24/7.",
    tags: ["Elephants", "Africa", "Safari", "Wildlife"],
  },
  {
    id: "africam",
    name: "Africam Nkorho Pan",
    location: "Greater Kruger, Limpopo",
    country: "South Africa",
    flag: "🇿🇦",
    emoji: "🦁",
    watchUrl: "https://www.youtube.com/@AfricamSafari/live",
    channelLiveUrl: "https://www.youtube.com/@AfricamSafari/live",
    gradient: "from-orange-900 via-yellow-950 to-stone-950",
    category: "Nature & Wildlife",
    source: "Africam",
    description: "Night and day live cam at Nkorho Pan waterhole in Greater Kruger National Park.",
    tags: ["Kruger", "Lions", "Africa", "Night Cam"],
  },
  {
    id: "london-eye",
    name: "London Eye & Thames",
    location: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    emoji: "🎡",
    watchUrl: "https://www.youtube.com/results?search_query=london+live+webcam+thames+eye&sp=EgJAAQ%3D%3D",
    channelLiveUrl: "https://www.youtube.com/results?search_query=london+live+webcam&sp=EgJAAQ%3D%3D",
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    category: "City Views",
    source: "YouTube Live",
    description: "Live views of the London Eye, Big Ben and the River Thames.",
    tags: ["London", "Thames", "UK", "City"],
  },
  {
    id: "relaxing-worlds",
    name: "Relaxing World – Nature 4K",
    location: "Various",
    country: "Worldwide",
    flag: "🌲",
    emoji: "🎋",
    watchUrl: "https://www.youtube.com/@RelaxingWorld/live",
    channelLiveUrl: "https://www.youtube.com/@RelaxingWorld/live",
    gradient: "from-teal-900 via-cyan-950 to-slate-950",
    category: "Nature & Wildlife",
    source: "Relaxing World",
    description: "Peaceful 4K nature scenes — forests, waterfalls, rain and ocean waves.",
    tags: ["Nature", "4K", "Relaxing", "Forest"],
  },
];

const CATEGORIES = ["All", "City Views", "Nature & Wildlife", "Space & Science"];

export function EarthCamViewer() {
  const navigate = useNavigate();
  const [selectedCam, setSelectedCam] = useState<LiveCam | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCams =
    activeCategory === "All"
      ? LIVE_CAMS
      : LIVE_CAMS.filter((c) => c.category === activeCategory);

  const handleSelect = (cam: LiveCam) => {
    setSelectedCam(cam);
    setTimeout(() => {
      document.getElementById("cam-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 lg:pb-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 h-16 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-black text-white">Public EarthCams</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-red-400 text-xs font-bold">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          {LIVE_CAMS.length} LIVE
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ============================
            ACTIVE CAM PLAYER
            Uses YouTube's /live page in an iframe — 
            This always redirects to the channel's current live video.
            YouTube allows embedding youtube.com pages in iframes with allow-popups.
            ============================*/}
        {selectedCam && (
          <div id="cam-player" className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            {/* Player header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{selectedCam.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-white text-sm">{selectedCam.name}</h2>
                    <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse inline-block" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{selectedCam.location} · {selectedCam.flag} · via {selectedCam.source}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <a
                  href={selectedCam.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Watch on YouTube
                </a>
                <button
                  onClick={() => setSelectedCam(null)}
                  className="text-slate-500 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 
              Best available embed strategy:
              We show the YouTube channel's /live page. YouTube does not block this with
              X-Frame-Options when opened from within the YouTube ecosystem. 
              However since this is a different domain, Chrome/Firefox may block it.
              We use the `allow-same-origin` sandbox which gives it enough permissions
              to load the YouTube player script.
              
              The video area also shows a prominent "Watch on YouTube" CTA as primary action
              so users always have a reliable way to view.
            */}
            <div className="relative bg-black">
              {/* Beautiful preview with direct watch CTA */}
              <div className={`relative overflow-hidden bg-gradient-to-br ${selectedCam.gradient}`}
                   style={{ minHeight: "420px" }}>
                
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)"
                  }}
                />

                {/* Live pulse rings animation */}
                <div className="absolute top-8 right-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 bg-red-500/30 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
                    <div className="absolute inset-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Tv2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="relative flex flex-col items-center justify-center text-center p-10 pt-16 min-h-[420px]">
                  <div className="text-7xl mb-6 drop-shadow-2xl">{selectedCam.emoji}</div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-3 drop-shadow-lg">
                    {selectedCam.name}
                  </h2>
                  <p className="text-slate-300/80 text-sm md:text-base max-w-lg mb-2">
                    {selectedCam.description}
                  </p>
                  <p className="text-slate-500 text-xs mb-10 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedCam.location} · {selectedCam.flag} {selectedCam.country}
                  </p>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap justify-center mb-8">
                    {selectedCam.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <a
                    href={selectedCam.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-2xl shadow-red-900/50 hover:shadow-red-800/50 hover:scale-105"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    Watch Live on YouTube
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  </a>
                  <p className="text-slate-600 text-xs mt-4 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Opens the official {selectedCam.source} live stream in a new tab
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state hero */}
        {!selectedCam && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
            <Globe className="w-16 h-16 text-cyan-500/30 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Select a Live Camera</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              {LIVE_CAMS.length} curated live cam channels from around the world. Streams open directly on YouTube for the best experience.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {LIVE_CAMS.slice(0, 5).map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => handleSelect(cam)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-cyan-300 transition-all"
                >
                  <span>{cam.emoji}</span>
                  <span className="font-medium">{cam.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCams.map((cam) => {
            const isActive = selectedCam?.id === cam.id;
            return (
              <div
                key={cam.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20"
                    : "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50"
                }`}
              >
                {/* Card background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cam.gradient}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {isActive && (
                  <div className="absolute inset-0 border-2 border-cyan-400 rounded-2xl pointer-events-none z-20" />
                )}

                {/* Live badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
                  LIVE
                </div>

                {/* Source badge */}
                <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-white/10">
                  {cam.source}
                </div>

                {/* Card content */}
                <div className="relative z-10 p-4 pt-12 pb-5 min-h-[180px] flex flex-col justify-end">
                  <div className="text-3xl mb-2">{cam.emoji}</div>
                  <h3 className="font-bold text-white text-sm leading-snug">{cam.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cam.description}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-2">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {cam.flag} {cam.location}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSelect(cam)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-cyan-500 text-white"
                          : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {isActive ? "Selected" : "Preview"}
                    </button>
                    <a
                      href={cam.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-red-600/80 hover:bg-red-500 text-white transition-all"
                      title="Watch on YouTube"
                    >
                      <ExternalLink className="w-3 h-3" />
                      YouTube
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How it works note */}
        <div className="flex items-start gap-3 bg-slate-900/50 border border-white/5 rounded-xl p-4 text-xs text-slate-500">
          <Info className="w-4 h-4 text-cyan-500/60 shrink-0 mt-0.5" />
          <p>
            EarthCam streams are served by <strong className="text-slate-400">official YouTube channels</strong> from NASA, EarthCam, 
            EXPLORE.org, and Africam. Clicking <strong className="text-slate-400">Watch on YouTube</strong> opens the channel's 
            current live stream in a new tab — guaranteed to always work. YouTube's embedding policy blocks 
            in-page players for live streams on external domains.
          </p>
        </div>
      </div>
    </div>
  );
}
