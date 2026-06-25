import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { parseM3U } from "../utils/m3uParser";
import { VideoPlayer } from "./VideoPlayer";
import { ChannelRow } from "./ChannelRow";
import { CategoryGrid } from "./CategoryGrid";
import { CountryGrid } from "./CountryGrid";
import { MobileNav } from "./MobileNav";
import {
  Tv,
  Search,
  UserCircle,
  Loader2,
  Maximize2,
  Shield,
  ShieldAlert,
  Menu,
  X,
  Home,
  Grid,
  Globe2,
  Baby,
  MonitorPlay,
  Settings,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePWAInstall } from "../hooks/usePWAInstall";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    trendingEnabled,
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
          {/* Left: Menu & Logo */}
          <div className="flex items-center h-full">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-2 md:mr-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Open Menu"
            >
              <Menu className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <div
              className="flex items-center gap-2 text-white font-black text-xl md:text-2xl tracking-tight cursor-pointer"
              onClick={() => handleTabSwitch("home")}
            >
              <div className="relative w-7 h-7 md:w-8 md:h-8">
                <div className="absolute inset-0 bg-blue-500/40 blur-lg rounded-full"></div>
                <img
                  src="/icon.png"
                  alt="WasMatchDu Logo"
                  className="relative z-10 w-full h-full object-cover rounded-lg shadow-lg ring-1 ring-white/10"
                />
              </div>
              <span className="hidden sm:inline">WasMatchDu</span>
            </div>
          </div>

          {/* Right: Search, Quick Actions */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
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
              className="hidden sm:flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 md:px-4 rounded-full font-bold transition-all text-sm border border-red-500/20 whitespace-nowrap shrink-0"
              title="Go Live"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="hidden md:inline">Go Live</span>
            </button>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Profile Avatar Trigger for Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 ml-1 md:ml-0"
            >
              <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 z-[110] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto shadow-2xl flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 text-white font-black text-xl tracking-tight">
            <div className="relative w-6 h-6">
              <img
                src="/icon.png"
                alt="Logo"
                className="w-full h-full object-cover rounded shadow"
              />
            </div>
            WasMatchDu
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1">
          {/* Main Navigation */}
          <div className="space-y-1 mb-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Discover
            </h4>
            <button
              onClick={() => {
                handleTabSwitch("home");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors",
                currentTab === "home" && !kidsMode
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <Home className="w-5 h-5" /> Homepage
            </button>
            <button
              onClick={() => {
                handleTabSwitch("categories");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors",
                currentTab === "categories"
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <Grid className="w-5 h-5" /> Categories
            </button>
            <button
              onClick={() => {
                handleTabSwitch("regions");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors",
                currentTab === "regions"
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <Globe2 className="w-5 h-5" /> Regions
            </button>
            <button
              onClick={() => {
                handleTabSwitch("kids");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors",
                kidsMode
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <Baby className="w-5 h-5" /> Children
            </button>
            <button
              onClick={() => {
                handleTabSwitch("live");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors",
                currentTab === "live"
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <MonitorPlay className="w-5 h-5" /> Live & TV
            </button>
          </div>

          {/* Account Settings */}
          <div className="space-y-1 mb-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Account & Tools
            </h4>
            {isInstallable && (
              <button
                onClick={() => {
                  promptInstall();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <Download className="w-5 h-5" /> Install App
              </button>
            )}
            <button
              onClick={() => {
                navigate("/admin");
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              <Shield className="w-5 h-5" /> Admin Center
            </button>
            <button
              onClick={() => {
                handleLogout();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <UserCircle className="w-5 h-5" /> Sign Out
            </button>
          </div>

          {/* Advanced Toggles */}
          <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Advanced
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <AlertTriangle
                  className={cn(
                    "w-4 h-4",
                    showUnstableChannels ? "text-amber-400" : "text-slate-500",
                  )}
                />
                <span>Show Unstable</span>
              </div>
              <button
                onClick={() => setShowUnstableChannels(!showUnstableChannels)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  showUnstableChannels ? "bg-amber-500" : "bg-slate-700",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform",
                    showUnstableChannels ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <ShieldAlert
                  className={cn(
                    "w-4 h-4",
                    useProxy ? "text-emerald-400" : "text-slate-500",
                  )}
                />
                <span>Bypass CORS Proxy</span>
              </div>
              <button
                onClick={toggleProxy}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  useProxy ? "bg-emerald-500" : "bg-slate-700",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform",
                    useProxy ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-tight mt-2">
              Enable proxy if streams are failing due to network blocks. Enable
              unstable to see experimental sources.
            </p>
          </div>
        </div>
      </aside>

      {currentTab === "categories" ? (
        <CategoryGrid
          onSelectCategory={(cat) => {
            setSearchQuery("");
            setKidsMode(false);
            setSearchQuery(cat);
            setCurrentTab("home");
          }}
        />
      ) : currentTab === "regions" ? (
        <CountryGrid
          onSelectCountry={() => {
            setSearchQuery("");
            setKidsMode(false);
            setCurrentTab("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : (
        <>
          {/* Hero Section Placeholder (preserves space) */}
          <div
            className={cn(
              "relative w-full transition-all duration-700 ease-in-out z-40 mt-16 bg-black max-w-[1600px] mx-auto",
              isTheaterMode
                ? "fixed inset-0 z-50 h-screen mt-0 max-w-none"
                : "aspect-video md:h-[65vh] md:max-h-[800px] md:aspect-auto",
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
              "relative z-30 pb-24 transition-all duration-500 max-w-[1600px] mx-auto w-full",
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
                {!searchQuery &&
                  !kidsMode &&
                  trendingEnabled &&
                  trendingChannels.length > 0 && (
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
