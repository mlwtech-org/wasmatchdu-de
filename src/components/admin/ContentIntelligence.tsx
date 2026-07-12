import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  HeartPulse,
  ActivitySquare,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart2,
  Video,
} from "lucide-react";

export const ContentIntelligence: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalStreams: 1420,
    healthyStreams: 1285,
    deadStreams: 135,
    lastScan: "12 hours ago",
    topCategory: "Sports",
    healthScore: 90.5,
  });

  const [simulatedProfile, setSimulatedProfile] = useState("Sports Fan");

  // Simulated fetching from verified_streams.json
  useEffect(() => {
    // In a real scenario, this would fetch from /verified_streams.json
    // For now, we simulate the parsed insight
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        healthScore: prev.healthScore + (Math.random() > 0.5 ? 0.1 : -0.1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
            Content Intelligence
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time algorithmic insights powered by automated stream
            validation.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-lg transition-colors text-sm font-medium border border-indigo-500/20">
          <RefreshCw className="w-4 h-4" />
          Force Re-Scan
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <HeartPulse className="w-16 h-16 text-emerald-500" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm mb-1">
            Network Health Score
          </h3>
          <div className="text-3xl font-black text-white">
            {metrics.healthScore.toFixed(1)}%
          </div>
          <div className="mt-2 text-xs flex items-center text-emerald-400 gap-1">
            <ArrowUpRight className="w-3 h-3" /> +1.2% since last scan
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Video className="w-16 h-16 text-blue-500" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm mb-1">
            Healthy Streams
          </h3>
          <div className="text-3xl font-black text-white">
            {metrics.healthyStreams.toLocaleString()}
          </div>
          <div className="mt-2 text-xs flex items-center text-slate-400 gap-1">
            Out of {metrics.totalStreams.toLocaleString()} total
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className="w-16 h-16 text-rose-500" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm mb-1">
            Dead / Buffering
          </h3>
          <div className="text-3xl font-black text-white">
            {metrics.deadStreams}
          </div>
          <div className="mt-2 text-xs flex items-center text-rose-400 gap-1">
            <ArrowDownRight className="w-3 h-3" /> Auto-demoted in feed
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart2 className="w-16 h-16 text-amber-500" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm mb-1">
            Dominant Category
          </h3>
          <div className="text-3xl font-black text-white">
            {metrics.topCategory}
          </div>
          <div className="mt-2 text-xs flex items-center text-slate-400 gap-1">
            Highest uptime density
          </div>
        </div>
      </div>

      {/* Simulator and Demotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendation Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <ActivitySquare className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Algorithm Simulator
            </h3>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Simulate Demographic Profile
            </label>
            <div className="flex gap-2">
              {["Sports Fan", "News Watcher", "Movie Buff", "General"].map(
                (profile) => (
                  <button
                    key={profile}
                    onClick={() => setSimulatedProfile(profile)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${simulatedProfile === profile ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    {profile}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">
                  Sky Sports Main Event
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Health: 99.8% • Match: 95%
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                #1 RECOMMENDED
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">ESPN HD</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Health: 98.2% • Match: 88%
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                #2 RECOMMENDED
              </span>
            </div>
          </div>
        </div>

        {/* Demoted Streams */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Quarantined / Demoted Streams
            </h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            These streams failed the last GitHub Action validation check and are
            currently hidden from user recommendations.
          </p>

          <div className="space-y-3">
            {[
              { name: "Fox Sports 2", error: "404 Not Found" },
              { name: "BBC News Live", error: "High Buffering Ratio" },
              { name: "HBO Max Feed", error: "Geoblocked" },
            ].map((stream) => (
              <div
                key={stream.name}
                className="p-4 rounded-xl bg-slate-950/50 border border-rose-900/30 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-white font-medium opacity-70 line-through">
                    {stream.name}
                  </h4>
                  <p className="text-xs text-rose-400 mt-1">
                    Reason: {stream.error}
                  </p>
                </div>
                <button className="text-xs font-medium text-slate-500 hover:text-white transition-colors">
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
