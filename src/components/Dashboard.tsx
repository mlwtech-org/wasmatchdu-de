import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { parseM3U } from "../utils/m3uParser";
import { VideoPlayer } from "./VideoPlayer";
import { ChannelRow } from "./ChannelRow";
import { CategoryGrid } from "./CategoryGrid";
import { MobileNav } from "./MobileNav";
import {
  Tv,
  Search,
  UserCircle,
  Loader2,
  Maximize2,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

const LANGUAGE_TO_M3U_MAP: Record<string, string> = {
  en: "https://iptv-org.github.io/iptv/languages/eng.m3u",
  de: "https://iptv-org.github.io/iptv/languages/deu.m3u",
  es: "https://iptv-org.github.io/iptv/languages/spa.m3u",
  fr: "https://iptv-org.github.io/iptv/languages/fra.m3u",
  hi: "https://iptv-org.github.io/iptv/languages/hin.m3u",
};

const GLOBAL_PLAYLISTS = [
  "https://iptv-org.github.io/iptv/categories/documentary.m3u",
  "https://iptv-org.github.io/iptv/categories/series.m3u",
];

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

export const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [currentTab, setCurrentTab] = useState("home");
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const navigate = useNavigate();

  const {
    channels,
    currentChannel,
    searchQuery,
    setSearchQuery,
    kidsMode,
    isLoading,
    error,
    setChannels,
    setKidsMode,
    setIsLoading,
    setError,
    setUser,
    isTheaterMode,
    useProxy,
    toggleProxy,
    showUnstableChannels,
    setShowUnstableChannels,
  } = usePlayerStore();

  const handleLogout = () => setUser(null);

  const handleTabSwitch = (tab: string) => {
    if (tab === "kids") {
      setKidsMode(true);
      setCurrentTab("home");
    } else if (tab === "live") {
      setKidsMode(false);
      setCurrentTab("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setKidsMode(false);
      setCurrentTab(tab);
    }
  };

  useEffect(() => {
    const fetchM3U = async () => {
      setIsLoading(true);
      try {
        const currentLang = i18n.language;
        const langCode = currentLang?.split("-")[0]?.toLowerCase() || "de";
        const primaryPlaylist =
          LANGUAGE_TO_M3U_MAP[langCode] || LANGUAGE_TO_M3U_MAP["de"];
        const urlsToFetch = [primaryPlaylist, ...GLOBAL_PLAYLISTS];

        const responses = await Promise.all(urlsToFetch.map((u) => fetch(u)));
        const validResponses = responses.filter((r) => r.ok);

        if (validResponses.length === 0)
          throw new Error("Failed to fetch playlists");

        const texts = await Promise.all(validResponses.map((r) => r.text()));

        let allChannels: import("../types").Channel[] = [];
        texts.forEach((text) => {
          allChannels = [...allChannels, ...parseM3U(text)];
        });

        // Deduplicate channels by URL so we don't show the same stream twice
        const uniqueChannelsMap = new Map();
        allChannels.forEach((c) => {
          if (!uniqueChannelsMap.has(c.url)) {
            uniqueChannelsMap.set(c.url, c);
          }
        });

        setChannels(Array.from(uniqueChannelsMap.values()));
        setError(null);
      } catch (err) {
        console.error("Error fetching M3U:", err);
        setError("Failed to load channel list. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchM3U();
  }, [i18n.language, setChannels, setError, setIsLoading]);

  useEffect(() => {
    const handleScroll = () => {
      // Activate mini player when scrolled past the hero section (~300px)
      if (window.scrollY > 300) {
        setIsMiniPlayer(true);
      } else {
        setIsMiniPlayer(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Hide unstable channels unless the user wants to see them
      if (!showUnstableChannels && channel.isUnstable) return false;

      if (kidsMode && channel.gemeinwohlCategory !== "Kinder & Familie")
        return false;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        channel.name.toLowerCase().includes(searchLower) ||
        (channel.gemeinwohlCategory &&
          channel.gemeinwohlCategory.toLowerCase().includes(searchLower));
      return matchesSearch;
    });
  }, [channels, searchQuery, kidsMode, showUnstableChannels]);

  // Compute trending channels deterministically
  const trendingChannels = useMemo(() => {
    return [...filteredChannels]
      .filter((c) => !c.isUnstable)
      .sort((a, b) => {
        let hashA = 0;
        for (let i = 0; i < a.id.length; i++)
          hashA = a.id.charCodeAt(i) + ((hashA << 5) - hashA);
        let hashB = 0;
        for (let i = 0; i < b.id.length; i++)
          hashB = b.id.charCodeAt(i) + ((hashB << 5) - hashB);
        const countA = Math.abs(hashA) % 49000;
        const countB = Math.abs(hashB) % 49000;
        return countB - countA; // Sort descending
      })
      .slice(0, 12);
  }, [filteredChannels]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 overflow-x-clip pb-20 lg:pb-0">
      {/* Top Desktop Navigation */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-slate-950/95 backdrop-blur-md border-b border-slate-800",
          isTheaterMode ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-[1600px] mx-auto">
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center h-full">
            <div
              className="flex items-center gap-2 text-white font-black text-2xl tracking-tight mr-8 cursor-pointer"
              onClick={() => handleTabSwitch("home")}
            >
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-blue-500/40 blur-lg rounded-full"></div>
                <img
                  src="/icon.png"
                  alt="WasMatchDu Logo"
                  className="relative z-10 w-full h-full object-cover rounded-lg shadow-lg ring-1 ring-white/10"
                />
              </div>
              <span className="hidden sm:inline">WasMatchDu</span>
            </div>

            <nav className="hidden lg:flex items-center h-full gap-4 xl:gap-8 font-bold text-[15px]">
              <button
                onClick={() => handleTabSwitch("home")}
                className={cn(
                  "h-full px-1 border-b-[3px] transition-colors hover:text-white whitespace-nowrap",
                  currentTab === "home" && !kidsMode
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-300",
                )}
              >
                Homepage
              </button>
              <button
                onClick={() => handleTabSwitch("categories")}
                className={cn(
                  "h-full px-1 border-b-[3px] transition-colors hover:text-white whitespace-nowrap",
                  currentTab === "categories"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-300",
                )}
              >
                Categories
              </button>
              <button
                onClick={() => handleTabSwitch("kids")}
                className={cn(
                  "h-full px-1 border-b-[3px] transition-colors hover:text-white whitespace-nowrap",
                  kidsMode
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-300",
                )}
              >
                Children
              </button>
              <button
                onClick={() => handleTabSwitch("live")}
                className={cn(
                  "h-full px-1 border-b-[3px] transition-colors hover:text-white whitespace-nowrap",
                  currentTab === "live"
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-300",
                )}
              >
                Live & TV
              </button>
            </nav>
          </div>

          {/* Right: Search, Proxy & Profile */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex relative items-center shrink min-w-0">
              <Search className="w-5 h-5 absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-48 xl:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => navigate("/go-live")}
              className="hidden lg:flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full font-bold transition-all text-sm border border-red-500/20 whitespace-nowrap shrink-0"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Go Live
            </button>

            <button
              onClick={() => setShowUnstableChannels(!showUnstableChannels)}
              className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                showUnstableChannels
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-300",
              )}
              title="Show channels that might be geo-blocked or unstable (e.g. Pluto TV, DAZN)"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden xl:inline">
                {showUnstableChannels ? "Unstable: ON" : "Unstable: OFF"}
              </span>
            </button>

            <button
              onClick={toggleProxy}
              className={cn(
                "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                useProxy
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-300",
              )}
              title="Use Proxy to bypass network restrictions for broken streams"
            >
              {useProxy ? (
                <Shield className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
              <span className="hidden xl:inline">
                {useProxy ? "Proxy ON" : "Proxy OFF"}
              </span>
            </button>

            <LanguageSwitcher />

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="hidden lg:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full font-bold transition-all text-sm"
              >
                <Download className="w-4 h-4" /> Install App
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-bold transition-colors ml-2"
              title={t("dashboard.signOut")}
            >
              <UserCircle className="w-6 h-6" />
              <span className="hidden xl:inline">My Account</span>
            </button>
          </div>
        </div>
      </header>

      {currentTab === "categories" ? (
        <CategoryGrid
          onSelectCategory={(cat) => {
            setSearchQuery("");
            setKidsMode(false);
            // Set selectedGroup or just filter? We don't have selectedGroup anymore,
            // but we can scroll to the specific category row, or just rely on search.
            // For now, let's set search query to category so it filters it.
            setSearchQuery(cat);
            setCurrentTab("home");
          }}
        />
      ) : (
        <>
          {/* Hero Section Placeholder (preserves space) */}
          <div
            className={cn(
              "relative w-full transition-all duration-700 ease-in-out z-40 mt-16 bg-black",
              isTheaterMode
                ? "fixed inset-0 z-50 h-screen mt-0"
                : "aspect-video md:h-[65vh] md:aspect-auto",
            )}
          >
            {/* The Actual Video Player (morphs to mini-player) */}
            <div
              className={cn(
                "transition-all duration-500 ease-in-out w-full h-full bg-black",
                isMiniPlayer && currentChannel && !isTheaterMode
                  ? "fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-[280px] md:w-[380px] aspect-video z-[60] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer group ring-2 ring-slate-700 hover:ring-blue-500"
                  : "relative shadow-2xl",
              )}
              onClick={() => {
                if (isMiniPlayer) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <VideoPlayer />

              {/* Mini-Player Overlay */}
              {isMiniPlayer && currentChannel && !isTheaterMode && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none">
                  <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-xl" />
                </div>
              )}
            </div>

            {!currentChannel && !isTheaterMode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900 pointer-events-none z-10">
                <Tv className="w-24 h-24 text-slate-700 mb-6 drop-shadow-lg" />
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">
                  {t("dashboard.selectChannel")}
                </h2>
                <p className="text-slate-400 mt-4 text-lg font-medium">
                  Browse our premium catalog below
                </p>
              </div>
            )}

            {/* Bottom gradient to blend hero into rows */}
            {!isTheaterMode && !isMiniPlayer && (
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
            )}
          </div>

          {/* Main Content: Channel Shelves */}
          <main
            className={cn(
              "relative z-30 pb-24 transition-all duration-500",
              currentChannel ? "-mt-8 md:-mt-24" : "mt-8",
            )}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-400 font-medium">Loading catalog...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-medium px-4">
                {error}
              </div>
            ) : (
              <div className="space-y-6 md:space-y-12">
                {/* Trending Now Row */}
                {!searchQuery && !kidsMode && trendingChannels.length > 0 && (
                  <ChannelRow
                    title="🔥 Trending Now"
                    channels={trendingChannels}
                    isTrending={true}
                  />
                )}

                {/* Recently Watched Row */}
                {!searchQuery &&
                  !kidsMode &&
                  usePlayerStore.getState().recentlyWatched.length > 0 && (
                    <ChannelRow
                      title="Recently Watched"
                      channels={usePlayerStore
                        .getState()
                        .recentlyWatched.map((id) =>
                          filteredChannels.find((c) => c.id === id),
                        )
                        .filter(
                          (c): c is import("../types").Channel =>
                            c !== undefined,
                        )}
                    />
                  )}

                {/* Search Results (if searching) */}
                {searchQuery && (
                  <ChannelRow title={searchQuery} channels={filteredChannels} />
                )}

                {/* Favorites Row */}
                {!searchQuery && !kidsMode && (
                  <ChannelRow
                    title={t("dashboard.favoritesOnly")}
                    channels={filteredChannels.filter((c) =>
                      channels.find(
                        (f) =>
                          f.id === c.id &&
                          usePlayerStore.getState().favorites.includes(c.id),
                      ),
                    )}
                  />
                )}

                {/* Render Category Rows */}
                {!searchQuery &&
                  GEMEINWOHL_CATEGORIES.map((category) => {
                    const categoryChannels = filteredChannels.filter(
                      (c) => c.gemeinwohlCategory === category,
                    );
                    if (categoryChannels.length === 0) return null;
                    return (
                      <ChannelRow
                        key={category}
                        title={category}
                        channels={categoryChannels}
                      />
                    );
                  })}
              </div>
            )}
          </main>
        </>
      )}

      {/* Mobile / Tablet Bottom Navigation */}
      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
};
