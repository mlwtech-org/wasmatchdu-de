import React, { useState, useEffect } from "react";
import { Settings, Globe, Download, XCircle, ListVideo, MonitorPlay, ShieldCheck, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { usePlayerStore } from "../../store/usePlayerStore";
import { parseM3U } from "../../utils/m3uParser";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const CMSModule: React.FC<{ showToast: (msg: string, type: "success" | "error" | "info") => void }> = ({ showToast }) => {
  const trendingEnabled = usePlayerStore((state) => state.trendingEnabled);
  const setTrendingEnabled = usePlayerStore((state) => state.setTrendingEnabled);
  const configuredFeeds = usePlayerStore((state) => state.configuredFeeds);
  const addConfiguredFeed = usePlayerStore((state) => state.addConfiguredFeed);
  const removeConfiguredFeed = usePlayerStore((state) => state.removeConfiguredFeed);

  const [isTrendingActive, setIsTrendingActive] = useState(trendingEnabled);
  const [feedUrl, setFeedUrl] = useState("https://i.mjh.nz/PlutoTV/us.m3u8");
  const [feedType, setFeedType] = useState<"global" | "regional">("global");
  const [feedRoles, setFeedRoles] = useState<string[]>(["user", "operator", "admin", "dev"]);
  const [isParsing, setIsParsing] = useState(false);
  const [promoBanner, setPromoBanner] = useState("");
  const [isPromoActive, setIsPromoActive] = useState(false);

  const [verifiedStreamsCount, setVerifiedStreamsCount] = useState<number | null>(null);
  const [verifiedStreamsData, setVerifiedStreamsData] = useState<any[]>([]);
  const [isSyncingPremium, setIsSyncingPremium] = useState(false);

  useEffect(() => {
    const fetchVerifiedStreams = async () => {
      try {
        const res = await fetch(`/verified_streams.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setVerifiedStreamsData(data);
          setVerifiedStreamsCount(data.length);
        } else {
          setVerifiedStreamsCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch verified streams", err);
        setVerifiedStreamsCount(0);
      }
    };
    fetchVerifiedStreams();
  }, []);

  const handleFetchFeed = async () => {
    if (!feedUrl) return;
    setIsParsing(true);
    try {
      const res = await fetch(feedUrl);
      const text = await res.text();
      const parsedChannels = parseM3U(text);
      const existingChannels = usePlayerStore.getState().channels;

      const urlMap = new Map();
      [...existingChannels, ...parsedChannels].forEach((c) => {
        if (!urlMap.has(c.url)) {
          urlMap.set(c.url, c);
        }
      });
      const uniqueChannels = Array.from(urlMap.values());

      usePlayerStore.getState().setChannels(uniqueChannels);
      addConfiguredFeed({
        id: `feed-${Date.now()}`,
        name: feedUrl.split('/').pop() || 'Custom Feed',
        url: feedUrl,
        type: feedType,
        allowedRoles: feedRoles as any[]
      });
      setFeedUrl("");
      showToast(`Successfully loaded ${parsedChannels.length} channels!`, "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to load feed. Invalid URL or CORS issue.", "error");
    } finally {
      setIsParsing(false);
    }
  };

  const handleSyncPremium = () => {
    if (!verifiedStreamsData.length) return;
    setIsSyncingPremium(true);
    
    // Simulate network delay for UX
    setTimeout(() => {
      const existingChannels = usePlayerStore.getState().channels;
      const urlMap = new Map();
      [...existingChannels, ...verifiedStreamsData].forEach((c) => {
        if (!urlMap.has(c.url)) {
          urlMap.set(c.url, c);
        }
      });
      const uniqueChannels = Array.from(urlMap.values());
      
      usePlayerStore.getState().setChannels(uniqueChannels);
      setIsSyncingPremium(false);
      showToast(`Successfully deployed ${verifiedStreamsData.length} premium streams!`, "success");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Automated Premium Streams Metric Card */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-48 h-48 text-emerald-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              One-Click Syncing: Premium Verified Streams
            </h3>
            <p className="text-slate-400 text-sm max-w-xl">
              GitHub Actions automatically tests public streams for uptime and CORS compliance every 12 hours. 
              These validated streams are isolated for the Premium Tier to guarantee zero buffering and maximum availability.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500 mb-1">Working Streams</p>
              {verifiedStreamsCount === null ? (
                <div className="w-16 h-8 mx-auto bg-slate-800 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-black text-emerald-400 tracking-tight">
                  {verifiedStreamsCount.toLocaleString()}
                </p>
              )}
            </div>
            <div className="h-12 w-px bg-slate-800" />
            <button
              onClick={handleSyncPremium}
              disabled={isSyncingPremium || verifiedStreamsCount === null}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-6 py-3 rounded-lg font-black transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.8)] hover:shadow-[0_0_30px_0px_rgba(16,185,129,1)] scale-105"
            >
              <RefreshCw className={cn("w-5 h-5", isSyncingPremium && "animate-spin")} />
              {isSyncingPremium ? "Deploying..." : "Deploy to Players"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic CMS Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-blue-500" />
            UI Feature Flags
          </h3>
          <p className="text-slate-400 mt-2 mb-6 text-sm">
            Toggle features instantly for all connected clients.
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-slate-400" />
                  Trending Streams Row
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  Shows a carousel of top-performing streams on the homepage.
                </p>
              </div>
              <button
                onClick={() => {
                  const newState = !isTrendingActive;
                  setIsTrendingActive(newState);
                  setTrendingEnabled(newState);
                  showToast("Trending streams visibility updated globally!", "info");
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

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <MonitorPlay className="w-4 h-4 text-slate-400" />
                    Global Promo Banner
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Display an announcement at the top of the app.
                  </p>
                </div>
                <button 
                  onClick={() => setIsPromoActive(!isPromoActive)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    isPromoActive ? "bg-emerald-500" : "bg-slate-700",
                  )}
                >
                  <span className={cn(
                    "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                    isPromoActive ? "translate-x-6" : "translate-x-0",
                  )} />
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Server maintenance scheduled for 2 AM UTC"
                  value={promoBanner}
                  onChange={(e) => setPromoBanner(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  onClick={() => showToast("Banner updated globally!", "success")}
                  className="absolute right-2 top-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Feeds Manager */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Content Feed Manager
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Import new channels via remote M3U playlists.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://example.com/playlist.m3u"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            
            <div className="flex gap-4">
              <select
                value={feedType}
                onChange={(e) => setFeedType(e.target.value as "global" | "regional")}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="global">Global (Standard)</option>
                <option value="regional">Regional / Premium</option>
              </select>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-sm font-bold text-slate-400 mb-2">Allowed Roles</p>
              <div className="flex flex-wrap gap-2">
                {["user", "operator", "admin", "dev"].map((role) => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={feedRoles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) setFeedRoles([...feedRoles, role]);
                        else setFeedRoles(feedRoles.filter((r) => r !== role));
                      }}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300 capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleFetchFeed}
              disabled={isParsing || !feedUrl || feedRoles.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isParsing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isParsing ? "Parsing & Syncing..." : "Inject FAST/Remote M3U"}
            </button>
          </div>

          <div className="mt-8">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Active Sync Feeds ({configuredFeeds.length})
            </h4>
            {configuredFeeds.length === 0 ? (
              <div className="text-sm text-slate-500 italic p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                No configured feeds active.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {configuredFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="flex flex-col p-3 bg-slate-950 border border-slate-800/80 rounded-xl group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-200 font-bold text-sm truncate">
                        {feed.name}
                      </span>
                      <button
                        onClick={() => removeConfiguredFeed(feed.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remove Feed"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-slate-500 text-xs truncate mb-2 font-mono">
                      {feed.url}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded",
                        feed.type === "global" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {feed.type}
                      </span>
                      <div className="flex gap-1">
                        {feed.allowedRoles.map((role) => (
                          <span key={role} className="text-[10px] uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
