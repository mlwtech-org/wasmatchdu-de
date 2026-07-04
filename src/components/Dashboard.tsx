import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { HeroBanner } from "./HeroBanner";
import { ChannelRow } from "./ChannelRow";
import { CategoryGrid } from "./CategoryGrid";
import { CountryGrid } from "./CountryGrid";
import { RadioHub } from "./RadioHub";
import { GlobalRadioPlayer } from "./GlobalRadioPlayer";
import { MobileNav } from "./MobileNav";
import {
  Search,
  UserCircle,
  Loader2,
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
  Radio,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AVATARS } from "../lib/avatars";
import { usePWAInstall } from "../hooks/usePWAInstall";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

// Replaced LANGUAGE_TO_M3U_MAP with IP detection

import { FALLBACK_CHANNELS, GEMEINWOHL_CATEGORIES } from "../lib/constants";

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isInstallable, promptInstall } = usePWAInstall();
  const [currentTab, setCurrentTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed] = useState(false);

  const navigate = useNavigate();

  const {
    channels,
    globalChannels,
    currentChannel,
    searchQuery,
    setSearchQuery,
    kidsMode,
    isLoading,
    error,
    setKidsMode,
    setUser,
    isTheaterMode,
    useProxy,
    toggleProxy,
    showUnstableChannels,
    setShowUnstableChannels,
    trendingEnabled,
    setCurrentChannel,
    setCurrentPlaylist,
    currentPlaylist,
    profiles,
    activeProfileId,
  } = usePlayerStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activeAvatar =
    AVATARS.find((a) => a.id === activeProfile?.avatarUrl) || AVATARS[0];
  const AvatarIcon = activeAvatar.icon;

  const handleLogout = () => setUser(null);

  const handleTabSwitch = (tab: string) => {
    if (tab === "kids") {
      setKidsMode(true);
      setCurrentTab("home");
    } else if (tab === "surf") {
      if (globalChannels && globalChannels.length > 0) {
        navigate(`/live/${globalChannels[0].id}`);
      } else {
        setKidsMode(false);
        setCurrentTab("home");
      }
    } else {
      setKidsMode(false);
      setCurrentTab(tab);
      if (tab === "home") {
        setSearchQuery("");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

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

  const liveEventsChannels = useMemo(() => {
    return filteredChannels
      .filter(
        (c) =>
          !c.isUnstable &&
          c.currentProgram &&
          (c.currentProgram.startsWith("Live:") ||
            c.gemeinwohlCategory === "Sport & Action"),
      )
      .slice(0, 15);
  }, [filteredChannels]);

  // Auto-play the top verified channel on initial load to guarantee playback
  const hasAutoPlayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoPlayed.current &&
      !isLoading &&
      !currentChannel &&
      FALLBACK_CHANNELS.length > 0
    ) {
      hasAutoPlayed.current = true;
      setCurrentPlaylist(FALLBACK_CHANNELS);
      setCurrentChannel(FALLBACK_CHANNELS[0]);
    }
  }, [
    isLoading,
    currentChannel,
    currentTab,
    setCurrentChannel,
    setCurrentPlaylist,
    currentPlaylist,
  ]);

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
              data-focusable="true"
              onClick={() => setIsSidebarOpen(true)}
              className="mr-2 md:mr-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Open Menu"
            >
              <Menu className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <div
              className="flex items-center gap-2 text-white font-black text-xl tracking-tight cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => handleTabSwitch("home")}
            >
              <div className="relative w-7 h-7">
                <img
                  src="/icon.png"
                  alt="WasMatchDu Logo"
                  className="w-full h-full object-contain rounded drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                />
              </div>
              <span className="drop-shadow-md">
                WasMatch<span className="text-cyan-400 font-light">Du</span>
              </span>
            </div>
          </div>

          {/* Right: Search, Quick Actions */}
          <div className="flex items-center gap-4 relative z-10 mr-4 md:mr-6 lg:mr-8">
            <div className="hidden md:flex relative items-center shrink min-w-0">
              <Search className="w-5 h-5 absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder={t("dashboard.searchChannels")}
                className="w-full sm:w-48 lg:w-64 bg-slate-900/80 border border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-slate-500 transition-all text-white placeholder-slate-400 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              data-focusable="true"
              onClick={() => {
                const liveChannel =
                  liveEventsChannels[0] || channels[0] || FALLBACK_CHANNELS[0];
                if (liveChannel) {
                  navigate(`/live/${liveChannel.id}`);
                }
              }}
              className="hidden sm:flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-3 py-1.5 md:px-4 rounded-full font-bold transition-all text-sm border border-blue-500/20 whitespace-nowrap shrink-0"
              title="Live TV Mode"
            >
              <MonitorPlay className="w-4 h-4" />
              <span className="hidden md:inline">Live TV Mode</span>
            </button>

            <button
              data-focusable="true"
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
              data-focusable="true"
              onClick={() => setIsSidebarOpen(true)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${activeProfile ? `bg-gradient-to-br ${activeAvatar.color}` : "bg-slate-800"} flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-slate-700 ml-1 md:ml-0 shadow-lg ring-2 ring-white/10 hover:ring-white/30 hover:scale-105`}
            >
              {activeProfile ? (
                <AvatarIcon className="w-5 h-5 md:w-6 md:h-6 text-white/90" />
              ) : (
                <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
              )}
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
            data-focusable="true"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1">
          {/* Main Navigation */}
          <div className="space-y-1 mb-8">
            <div className="mb-4 bg-slate-900/50 rounded-2xl p-3 border border-slate-800 flex flex-col items-center gap-3">
              {activeProfile && (
                <>
                  <div
                    className={`w-16 h-16 rounded-[1rem] bg-gradient-to-br ${activeAvatar.color} flex items-center justify-center shadow-inner ring-1 ring-white/10`}
                  >
                    <AvatarIcon className="w-8 h-8 text-white/90" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white">
                      {activeProfile.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {activeProfile.isKidsMode ? "Kids Mode" : "Standard"}
                    </div>
                  </div>
                </>
              )}
              <button
                onClick={() => navigate("/sports")}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                <Grid className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && "Categories"}
              </button>
              <button
                data-focusable="true"
                onClick={() => navigate("/profile-selection")}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
              >
                Switch Profile
              </button>
            </div>

            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Discover
            </h4>
            <button
              data-focusable="true"
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
              data-focusable="true"
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
              data-focusable="true"
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
              data-focusable="true"
              onClick={() => {
                handleTabSwitch("radio");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center transition-all duration-300",
                isSidebarCollapsed
                  ? "justify-center p-2.5 rounded-xl"
                  : "gap-3 px-3 py-2.5 rounded-xl font-bold",
                currentTab === "radio"
                  ? "bg-pink-500/10 text-pink-400 shadow-[inset_4px_0_0_0_rgba(236,72,153,1),0_0_10px_rgba(236,72,153,0.1)]"
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-white border-l-4 border-transparent hover:border-slate-700",
              )}
              title={isSidebarCollapsed ? "Radio Hub" : undefined}
            >
              <Radio className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && "Radio Hub"}
            </button>
            <button
              data-focusable="true"
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
              data-focusable="true"
              onClick={() => {
                handleTabSwitch("surf");
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-colors",
                currentTab === "surf"
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              )}
            >
              <MonitorPlay className="w-5 h-5" /> Global Surf
            </button>
          </div>

          {/* Account Settings */}
          <div className="space-y-1 mb-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Account & Tools
            </h4>
            {isInstallable && (
              <button
                data-focusable="true"
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
              data-focusable="true"
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
                data-focusable="true"
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
                data-focusable="true"
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
        <div className="flex-1 lg:ml-72 bg-slate-950 overflow-y-auto">
          <CategoryGrid
            channels={filteredChannels}
            onSelectCategory={(cat) => {
              setSearchQuery("");
              if (!activeProfile?.isKidsMode) {
                setKidsMode(false);
              }
              setSearchQuery(cat);
              handleTabSwitch("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      ) : currentTab === "regions" ? (
        <div className="flex-1 lg:ml-64 bg-slate-950 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto mt-16 lg:mt-0">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-6">
              Regions
            </h2>
            <CountryGrid
              onSelectCountry={() => {
                setSearchQuery("");
                setKidsMode(false);
                setCurrentTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      ) : currentTab === "radio" ? (
        <RadioHub />
      ) : (
        <>
          {/* Premium Hero Banner */}
          <div className="relative w-full z-40 bg-black mt-16 max-w-[1600px] mx-auto shadow-2xl">
            <HeroBanner />
          </div>

          {/* Main Content: Channel Shelves */}
          <main className="relative z-30 pb-24 transition-all duration-500 max-w-[1600px] mx-auto w-full -mt-16 md:-mt-32">
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
                {/* Verified Reliable Channels */}
                {!searchQuery && !kidsMode && (
                  <ChannelRow
                    title="Top Picks for You"
                    channels={FALLBACK_CHANNELS}
                  />
                )}

                {/* Live Events Now */}
                {!searchQuery && !kidsMode && liveEventsChannels.length > 0 && (
                  <ChannelRow
                    title="🔴 Live Events & Breaking News"
                    channels={liveEventsChannels}
                  />
                )}

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
                        title={t(`categories.${category}`, {
                          defaultValue: category,
                        })}
                        channels={categoryChannels}
                      />
                    );
                  })}
              </div>
            )}
          </main>
        </>
      )}

      {/* Mobile Navigation */}
      <MobileNav currentTab={currentTab} setCurrentTab={handleTabSwitch} />

      {/* Persistent Global Radio Player */}
      <GlobalRadioPlayer />
    </div>
  );
};
