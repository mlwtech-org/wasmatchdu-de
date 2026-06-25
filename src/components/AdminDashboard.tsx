import React, { useState, useEffect } from "react";
import {
  Activity,
  Users,
  Settings,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { usePlayerStore } from "../store/usePlayerStore";
import { parseM3U } from "../utils/m3uParser";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const trendingEnabled = usePlayerStore((state) => state.trendingEnabled);
  const setTrendingEnabled = usePlayerStore(
    (state) => state.setTrendingEnabled,
  );
  const customFeeds = usePlayerStore((state) => state.customFeeds);
  const addCustomFeed = usePlayerStore((state) => state.addCustomFeed);
  const removeCustomFeed = usePlayerStore((state) => state.removeCustomFeed);

  // Mock Data States
  const [concurrentViewers, setConcurrentViewers] = useState(45291);
  const [isTrendingActive, setIsTrendingActive] = useState(trendingEnabled);
  const [dailyRevenue, setDailyRevenue] = useState(12450.5);
  const [autoModeration, setAutoModeration] = useState(true);
  const [feedUrl, setFeedUrl] = useState(
    "https://iptv-org.github.io/iptv/index.m3u",
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parseCount, setParseCount] = useState<number | null>(null);

  const [flaggedStreams, setFlaggedStreams] = useState([
    {
      id: "stream_8x2",
      channel: "Sky Sports Action",
      reason: "Copyright Violation",
      confidence: 96,
      time: "2 mins ago",
      thumbnail:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&q=80",
    },
    {
      id: "stream_9p1",
      channel: "HBO Comedy HD",
      reason: "NSFW Content",
      confidence: 88,
      time: "5 mins ago",
      thumbnail:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&q=80",
    },
  ]);

  const handleModerate = (id: string, action: "ban" | "approve") => {
    setFlaggedStreams((prev) => prev.filter((s) => s.id !== id));
    // In a real app, this would make an API call to Firebase/Backend
    alert(`Stream has been ${action === "ban" ? "BANNED" : "APPROVED"}.`);
  };

  const handleFetchFeed = async () => {
    if (!feedUrl) return;
    setIsParsing(true);
    try {
      const res = await fetch(feedUrl);
      const text = await res.text();
      const parsedChannels = parseM3U(text);
      const existingChannels = usePlayerStore.getState().channels;

      // Merge unique channels based on URL to prevent infinite duplicates if clicked twice
      const urlMap = new Map();
      [...existingChannels, ...parsedChannels].forEach((c) => {
        if (!urlMap.has(c.url)) {
          urlMap.set(c.url, c);
        }
      });
      const uniqueChannels = Array.from(urlMap.values());

      usePlayerStore.getState().setChannels(uniqueChannels);
      addCustomFeed(feedUrl);
      setParseCount(parsedChannels.length);
      setFeedUrl("");
      alert(
        `Successfully parsed and loaded ${parsedChannels.length} channels from public feed!`,
      );
    } catch (e) {
      console.error(e);
      alert(
        "Failed to load feed. It may be restricted by CORS or an invalid URL.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  // Simulate live changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setConcurrentViewers(
        (prev) => prev + Math.floor(Math.random() * 100) - 40,
      );
      setDailyRevenue((prev) => prev + Math.random() * 15);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Command Center</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Overview
          </button>
          <button
            onClick={() =>
              alert("Telemetry dashboard is under construction. Coming soon!")
            }
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors"
          >
            <Activity className="w-5 h-5" /> Telemetry
          </button>
          <button
            onClick={() =>
              alert("CMS Content manager is under construction. Coming soon!")
            }
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors"
          >
            <Settings className="w-5 h-5" /> CMS Content
          </button>
          <button
            onClick={() =>
              alert("Financials ledger is under construction. Coming soon!")
            }
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors"
          >
            <DollarSign className="w-5 h-5" /> Financials
          </button>
          <button
            onClick={() =>
              alert("Moderation settings are under construction. Coming soon!")
            }
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors"
          >
            <ShieldAlert className="w-5 h-5" /> Moderation
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back to App
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">
              Platform Overview
            </h1>
            <p className="text-slate-500 mt-1">
              Real-time metrics and administration
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-medium border border-slate-700"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500">
              <Users className="w-24 h-24 transform translate-x-4 -translate-y-4" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">
              Live Viewers (Global)
            </h3>
            <div className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              {concurrentViewers.toLocaleString()}
              <span className="text-sm font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live via Mux Data
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
              <DollarSign className="w-24 h-24 transform translate-x-4 -translate-y-4" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">
              Today's Revenue (Tips & Subs)
            </h3>
            <div className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              $
              {dailyRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {import.meta.env.VITE_STRIPE_PUB_KEY?.startsWith("pk_live_") ? (
                <span className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded uppercase tracking-wider">
                  LIVE
                </span>
              ) : (
                <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded uppercase tracking-wider">
                  TEST
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              Processed via Stripe Connect
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
              <Activity className="w-24 h-24 transform translate-x-4 -translate-y-4" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">
              Platform Uptime & Health
            </h3>
            <div className="text-4xl font-black text-white tracking-tight">
              99.98%
            </div>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              0.4% Global Buffering Rate
            </p>
          </div>
        </div>

        {/* Feature Toggles Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CMS Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-500" />
              Dynamic CMS Controls
            </h3>
            <p className="text-slate-400 mt-2 mb-6">
              Toggle features via Firebase Remote Config in real-time.
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Trending Streams Row</h4>
                  <p className="text-sm text-slate-400">
                    Currently syncing with Firebase Remote Config:
                    `trending_streams_enabled`
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newState = !isTrendingActive;
                    setIsTrendingActive(newState);
                    setTrendingEnabled(newState);
                    alert(
                      "Trending streams visibility updated locally! To update this globally for all users, you must change the 'trending_streams_enabled' parameter in your Firebase Console > Remote Config.",
                    );
                  }}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    isTrendingActive ? "bg-blue-500" : "bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                      isTrendingActive ? "translate-x-6" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/50">
                <div>
                  <h4 className="font-bold text-white">Promo Banners</h4>
                  <p className="text-sm text-slate-500">
                    Display global announcement banners to all users.
                  </p>
                </div>
                <button className="w-12 h-6 rounded-full bg-slate-700 relative transition-colors">
                  <span className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full" />
                </button>
              </div>
            </div>
          </div>

          {/* Automated Moderation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              AI Moderation Engine
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/50">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    Auto-Ban Explicit Content
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold tracking-wider">
                      AWS
                    </span>
                  </h4>
                  <p className="text-sm text-slate-500">
                    Automatically shut down streams flagged for NSFW content.
                  </p>
                </div>
                <button
                  onClick={() => setAutoModeration(!autoModeration)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    autoModeration ? "bg-rose-600" : "bg-slate-700",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                      autoModeration ? "translate-x-6" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              {flaggedStreams.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Review Queue ({flaggedStreams.length})
                  </h4>
                  {flaggedStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-4 items-center"
                    >
                      <img
                        src={stream.thumbnail}
                        alt="Flagged frame"
                        className="w-16 h-12 object-cover rounded border border-rose-500/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white truncate">
                            {stream.channel}
                          </h5>
                          <span className="text-xs text-slate-500">
                            {stream.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                            {stream.reason}
                          </span>
                          <span className="text-xs text-slate-400">
                            {stream.confidence}% Confidence
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleModerate(stream.id, "ban")}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded transition-colors"
                          title="Ban Stream"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleModerate(stream.id, "approve")}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors"
                          title="Approve / Ignore"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-700 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-slate-300">
                    All clear! Monitoring 142 Active Streams
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Zero infractions detected today.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Public Feed Aggregator */}
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Public Feed Aggregator
          </h3>
          <p className="text-slate-400 mb-6 max-w-3xl">
            Import free public IPTV streams instantly using M3U playlists. Try
            the standard <code>iptv-org</code> global feed below, which contains
            over 30,000 channels.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Public M3U URL
              </label>
              <input
                type="url"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://example.com/playlist.m3u"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={handleFetchFeed}
              disabled={isParsing || !feedUrl}
              className="w-full md:w-auto mt-6 md:mt-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isParsing ? "Parsing..." : "Fetch & Sync"}
            </button>
          </div>

          {parseCount !== null && !isParsing && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="text-emerald-400 font-medium">
                Successfully parsed {parseCount.toLocaleString()} channels. They
                are now live and saved to your feeds.
              </p>
            </div>
          )}

          {customFeeds.length > 0 && (
            <div className="mt-8">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Active Custom Feeds
              </h4>
              <div className="space-y-3">
                {customFeeds.map((url) => (
                  <div
                    key={url}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl"
                  >
                    <span className="text-slate-300 text-sm truncate mr-4 font-mono">
                      {url}
                    </span>
                    <button
                      onClick={() => removeCustomFeed(url)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove Feed"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
