import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { AVATARS } from "../lib/avatars";
import { usePWAInstall } from "../hooks/usePWAInstall";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

// Replaced LANGUAGE_TO_M3U_MAP with IP detection

const GLOBAL_PLAYLISTS = [
  "https://iptv-org.github.io/iptv/categories/documentary.m3u",
  "https://iptv-org.github.io/iptv/categories/series.m3u",
];

const VERIFIED_RELIABLE_CHANNELS: import("../types").Channel[] = [
  {
    id: "verified-redbull",
    name: "Red Bull TV",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png",
    group: "Sports & Action",
    gemeinwohlCategory: "Sport & Action",
    isRegional: false,
    isUnstable: false,
    currentProgram: "Live: Red Bull Cliff Diving World Series",
  },
  {
    id: "verified-dw",
    name: "DW English",
    url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Deutsche_Welle_logo.svg/1200px-Deutsche_Welle_logo.svg.png",
    group: "News",
    gemeinwohlCategory: "Nachrichten & Info",
    isRegional: false,
    isUnstable: false,
    currentProgram: "Live: DW News Desk",
  },
  {
    id: "verified-cgtn",
    name: "CGTN Global",
    url: "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/CGTN_logo.svg/1200px-CGTN_logo.svg.png",
    group: "News",
    gemeinwohlCategory: "Nachrichten & Info",
    isRegional: false,
    isUnstable: false,
    currentProgram: "Live: Global Watch",
  },
  {
    id: "verified-bbb",
    name: "Big Buck Bunny (Test)",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg",
    group: "Movies",
    gemeinwohlCategory: "Filme & Serien",
    isRegional: false,
    isUnstable: false,
    currentProgram: "Big Buck Bunny (4K Remaster)",
  }
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
  const { t } = useTranslation();
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
    setCurrentChannel,
    setCurrentPlaylist,
    customFeeds,
    profiles,
    activeProfileId,
  } = usePlayerStore();

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const activeAvatar = AVATARS.find(a => a.id === activeProfile?.avatarUrl) || AVATARS[0];
  const AvatarIcon = activeAvatar.icon;

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
        let countryCode = "de"; // Fallback to Germany
        try {
          const geoRes = await fetch("https://get.geojs.io/v1/ip/country.json");
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.country) {
              countryCode = geoData.country.toLowerCase();
            }
          }
        } catch (e) {
          console.warn("Geo-IP failed, falling back to default.", e);
        }

        // Primary validated stream URL (updated via GitHub Actions every 12h)
        const verifiedPlaylist = `https://raw.githubusercontent.com/mlwtech-org/wasmatchdu-de/validated-streams/verified_streams.m3u`;
        const primaryPlaylist = `https://iptv-org.github.io/iptv/countries/${countryCode}.m3u`;
        
        const urlsToFetch = [
          verifiedPlaylist, // Try verified first
          ...GLOBAL_PLAYLISTS,
          ...customFeeds,
        ];

        let responses = await Promise.all(
          urlsToFetch.map((u) => fetch(u).catch(() => null)),
        );
        let validResponses = responses.filter((r) => r && r.ok) as Response[];

        // If the verified playlist doesn't exist yet (e.g. GitHub Action hasn't run), fallback to original
        if (!validResponses[0] && customFeeds.length === 0) {
          console.warn("Verified playlist not found, falling back to raw public feed.");
          const fallbackRes = await fetch(primaryPlaylist);
          if (fallbackRes.ok) {
              validResponses[0] = fallbackRes;
          } else {
              // Final fallback to DE if even the dynamic country code fails
              const finalFallback = await fetch("https://iptv-org.github.io/iptv/countries/de.m3u");
              if (finalFallback.ok) validResponses[0] = finalFallback;
          }
        }

        validResponses = validResponses.filter(Boolean);

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

        // Always keep existing channels that were previously stored (so custom ones aren't lost if fetch fails)
        const currentChannels = usePlayerStore.getState().channels;
        currentChannels.forEach((c) => {
          if (!uniqueChannelsMap.has(c.url)) {
            uniqueChannelsMap.set(c.url, c);
          }
        });

        // Add Verified Reliable Channels
        VERIFIED_RELIABLE_CHANNELS.forEach((c) => {
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
  }, [setChannels, setError, setIsLoading, customFeeds]);

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

  const liveEventsChannels = useMemo(() => {
    return filteredChannels
      .filter((c) => !c.isUnstable && c.currentProgram && (c.currentProgram.startsWith("Live:") || c.gemeinwohlCategory === "Sport & Action"))
      .slice(0, 15);
  }, [filteredChannels]);

  // Auto-play the top verified channel on initial load to guarantee playback
  const hasAutoPlayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoPlayed.current &&
      !isLoading &&
      !currentChannel &&
      VERIFIED_RELIABLE_CHANNELS.length > 0 &&
      currentTab === "home"
    ) {
      hasAutoPlayed.current = true;
      setCurrentPlaylist(VERIFIED_RELIABLE_CHANNELS);
      setCurrentChannel(VERIFIED_RELIABLE_CHANNELS[0]);
    }
  }, [isLoading, currentChannel, currentTab, setCurrentChannel, setCurrentPlaylist]);

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
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="WMD Streams Logo"
                className="h-6 w-auto drop-shadow-[0_0_15px_rgba(255,20,147,0.8)] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => handleTabSwitch("home")}
              />
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
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${activeProfile ? `bg-gradient-to-br ${activeAvatar.color}` : 'bg-slate-800'} flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-slate-700 ml-1 md:ml-0 shadow-lg ring-2 ring-white/10 hover:ring-white/30 hover:scale-105`}
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
                  <div className={`w-16 h-16 rounded-[1rem] bg-gradient-to-br ${activeAvatar.color} flex items-center justify-center shadow-inner ring-1 ring-white/10`}>
                    <AvatarIcon className="w-8 h-8 text-white/90" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white">{activeProfile.name}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{activeProfile.isKidsMode ? 'Kids Mode' : 'Standard'}</div>
                  </div>
                </>
              )}
              <button
                onClick={() => navigate('/sports')}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                <Tv className="w-5 h-5" />
                Regional Sports
              </button>
              <button 
                data-focusable="true"
                onClick={() => navigate('/profile-selection')}
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
                {/* Verified Reliable Channels */}
                {!searchQuery && !kidsMode && (
                  <ChannelRow
                    title="⭐ Verified 24/7 Channels (Always Work)"
                    channels={VERIFIED_RELIABLE_CHANNELS}
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
                        title={t(`categories.${category}`, { defaultValue: category })}
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
