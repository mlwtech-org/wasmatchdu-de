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
import { VoiceOverlay } from "./VoiceOverlay";
import { useSmartFeed } from "../hooks/useSmartFeed";
import {
  Search,
  Mic,
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
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { auth } from "../lib/firebase";
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
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isProUpgradeModalOpen, setIsProUpgradeModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleUpgradeClick = async () => {
    if (!user) return; // Prompt login if not logged in? Or just return.
    setIsCheckoutLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-wasmatch-du.cloudfunctions.net/createStripeCheckoutSession",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

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
    aiRecommendedChannels,
    aiRecommendationTitle,
    user,
  } = usePlayerStore();

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.",
      )
    ) {
      try {
        if (auth.currentUser) {
          // This will trigger the backend onDelete cloud function to clean up Firestore
          await auth.currentUser.delete();
          navigate("/login");
        }
      } catch (err) {
        console.error("Failed to delete account", err);
        alert("Please sign in again to delete your account.");
      }
    }
  };

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

  const [activeRegion, setActiveRegion] = useState("Global (Auto)");

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Hide unstable channels unless the user wants to see them
      if (!showUnstableChannels && channel.isUnstable) return false;

      if (kidsMode && channel.gemeinwohlCategory !== "Kinder & Familie")
        return false;

      // Region filtering
      if (activeRegion !== "Global (Auto)") {
        const cat = channel.gemeinwohlCategory || "";
        const channelRegion =
          (channel as unknown as { region?: string }).region || "";
        // Only show if the channel is explicitly part of the selected region
        if (
          !cat.toLowerCase().includes(activeRegion.toLowerCase()) &&
          !channelRegion.toLowerCase().includes(activeRegion.toLowerCase()) &&
          !cat.toLowerCase().includes("global")
        ) {
          return false;
        }
      }

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        channel.name.toLowerCase().includes(searchLower) ||
        (channel.gemeinwohlCategory &&
          channel.gemeinwohlCategory.toLowerCase().includes(searchLower));
      return matchesSearch;
    });
  }, [channels, searchQuery, kidsMode, showUnstableChannels, activeRegion]);

  // Feed intelligence based on active profile
  const { smartFeed } = useSmartFeed(
    filteredChannels,
    activeProfile?.name || "General",
    activeProfile?.regionLock || "Global",
  );

  // Compute trending channels deterministically using the Smart Feed Algorithm
  const trendingChannels = useMemo(() => {
    return smartFeed.slice(0, 12);
  }, [smartFeed]);

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
    <div className="min-h-screen mesh-bg text-white font-sans selection:bg-blue-500/30 overflow-x-clip pb-20 lg:pb-0">
      {/* Top Desktop Navigation */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 glass-panel border-b-0",
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
                className="w-full sm:w-48 lg:w-64 bg-slate-900/80 border border-slate-700/50 rounded-full py-2 pl-10 pr-10 text-sm font-medium focus:outline-none focus:border-slate-500 transition-all text-white placeholder-slate-400 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setIsVoiceSearchOpen(true)}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
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
              onClick={() => navigate("/view-space")}
              className="hidden sm:flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-1.5 md:px-4 rounded-full font-bold transition-all text-sm border border-purple-500/20 whitespace-nowrap shrink-0"
              title="My Space"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">My Space</span>
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
          "fixed top-0 left-0 bottom-0 w-72 glass-panel border-r border-white/5 z-[110] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto shadow-2xl flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5 sticky top-0 glass-panel z-10">
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
              <div className="hidden lg:flex w-full flex-col gap-2 px-1">
                <button
                  onClick={() => setIsRegionModalOpen(true)}
                  className="flex items-center justify-between w-full px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-blue-400" />
                    {!isSidebarCollapsed && <span>Region</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-xs text-slate-400">Global</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (user?.isPro) {
                      toggleProxy();
                    } else {
                      setIsProUpgradeModalOpen(true);
                    }
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 ${useProxy ? "bg-amber-500/10 hover:bg-amber-500/20" : "bg-slate-800/80 hover:bg-slate-700"} text-slate-200 rounded-lg text-sm font-medium transition-colors border ${useProxy ? "border-amber-500/30" : "border-slate-700/50"} group`}
                >
                  <div className="flex items-center gap-2">
                    <Shield
                      className={`w-4 h-4 ${useProxy ? "text-amber-400" : "text-slate-500 group-hover:text-amber-400"} transition-colors`}
                    />
                    {!isSidebarCollapsed && <span>VPN</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-500/30">
                      {useProxy ? "On" : "Pro"}
                    </span>
                  )}
                </button>
              </div>
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
            <button
              onClick={() => {
                handleDeleteAccount();
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-colors mt-2"
            >
              <AlertTriangle className="w-5 h-5" /> Delete Account
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
                onClick={() => {
                  if (user?.isPro) {
                    toggleProxy();
                  } else {
                    setIsProUpgradeModalOpen(true);
                  }
                }}
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
          <main className="relative z-50 pb-24 transition-all duration-500 max-w-[1600px] mx-auto w-full -mt-8 md:-mt-16">
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
                {/* AI Recommendations */}
                {!searchQuery &&
                  !kidsMode &&
                  aiRecommendedChannels &&
                  aiRecommendedChannels.length > 0 && (
                    <ChannelRow
                      title={`✨ ${aiRecommendationTitle}`}
                      channels={aiRecommendedChannels}
                    />
                  )}

                {/* Pro Channels Row */}
                {!searchQuery && !kidsMode && user?.isPro && (
                  <ChannelRow
                    title="👑 Pro Channels (VPN Unlocked)"
                    channels={channels
                      .filter(
                        (c) =>
                          c.group.toLowerCase().includes("sports") ||
                          c.group.toLowerCase().includes("movie") ||
                          c.name.toLowerCase().includes("pro"),
                      )
                      .slice(0, 20)}
                  />
                )}

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

      {/* Region Selection Modal */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setIsRegionModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Globe2 className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-black text-white tracking-tight">
                Select Region
              </h2>
            </div>
            <div className="space-y-3">
              {["Global (Auto)", "Europe", "North America", "Asia Pacific"].map(
                (region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setActiveRegion(region);
                      setIsRegionModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeRegion === region
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <span className="font-medium">{region}</span>
                    {activeRegion === region && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pro Upgrade Modal */}
      {isProUpgradeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-8 w-full max-w-lg relative shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>

            <button
              onClick={() => setIsProUpgradeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Shield className="w-10 h-10 text-slate-950" />
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                Secure VPN Access
              </h2>
              <p className="text-amber-400 font-bold tracking-widest uppercase text-sm mb-6">
                Pro Feature
              </p>

              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                Bypass geo-restrictions and ISP throttling instantly. Upgrade to
                Pro for high-speed, encrypted streaming on all channels.
              </p>

              <div className="text-white text-2xl font-black mb-8">
                $9.99{" "}
                <span className="text-slate-500 text-sm font-medium">
                  / month
                </span>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={handleUpgradeClick}
                  disabled={isCheckoutLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-lg px-8 py-4 rounded-xl transition-all shadow-lg transform hover:scale-[1.02]"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Loading Secure Checkout...
                    </>
                  ) : (
                    "Upgrade to Pro"
                  )}
                </button>
                <button
                  onClick={() => setIsProUpgradeModalOpen(false)}
                  disabled={isCheckoutLoading}
                  className="w-full bg-transparent hover:bg-slate-800 text-slate-400 font-medium px-8 py-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Search Overlay */}
      {isVoiceSearchOpen && (
        <VoiceOverlay
          onClose={() => setIsVoiceSearchOpen(false)}
          onSearch={(query) => setSearchQuery(query)}
        />
      )}
    </div>
  );
};
