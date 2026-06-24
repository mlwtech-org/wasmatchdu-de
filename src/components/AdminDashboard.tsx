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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { usePlayerStore } from "../store/usePlayerStore";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const trendingEnabled = usePlayerStore((state) => state.trendingEnabled);
  const setTrendingEnabled = usePlayerStore(
    (state) => state.setTrendingEnabled,
  );

  // Mock Data States
  const [concurrentViewers, setConcurrentViewers] = useState(45291);
  const [isTrendingActive, setIsTrendingActive] = useState(trendingEnabled);
  const [dailyRevenue, setDailyRevenue] = useState(12450.5);
  const [autoModeration, setAutoModeration] = useState(true);

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
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Activity className="w-5 h-5" /> Telemetry
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" /> CMS Content
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors">
            <DollarSign className="w-5 h-5" /> Financials
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl font-medium transition-colors">
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
        <header className="flex justify-between items-center mb-10">
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
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
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
      </main>
    </div>
  );
};
