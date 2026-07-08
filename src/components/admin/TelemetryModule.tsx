import React, { useEffect, useState } from "react";
import { Activity, Server, Zap, Globe2, WifiHigh, Cpu } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { RegionalFeedAnalysis } from "./RegionalFeedAnalysis";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const TelemetryModule: React.FC = () => {
  const [logs, setLogs] = useState<
    { id: number; msg: string; type: "info" | "warn" | "error"; time: string }[]
  >([]);

  // Mock live server logs
  useEffect(() => {
    const messages = [
      "Stream health check: [Global Sports] ping 45ms.",
      "Dead link pruned automatically from feed: .m3u8 404 Not Found.",
      "Buffer event spike detected on stream #421.",
      "Transcoding worker node scaled up.",
      "Syncing live viewer presence for 45,291 clients.",
    ];

    let id = 0;
    const interval = setInterval(() => {
      const type =
        Math.random() > 0.8 ? "warn" : Math.random() > 0.9 ? "error" : "info";
      const newLog = {
        id: id++,
        msg: messages[Math.floor(Math.random() * messages.length)],
        type: type as "info" | "warn" | "error",
        time: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top row: Server Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">
              Global CDN Latency
            </h3>
            <Globe2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            24 <span className="text-sm font-medium text-slate-500">ms</span>
          </div>
          <div className="mt-3 flex gap-1 h-8 items-end opacity-60">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${20 + Math.random() * 80}%` }}
              />
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">
              Active Edge Nodes
            </h3>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            142
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All systems operational
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">
              Transcode CPU Load
            </h3>
            <Cpu className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            68%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4">
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 h-1.5 rounded-full w-[68%]" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium text-sm">
              Bandwidth (Out)
            </h3>
            <WifiHigh className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1">
            1.2 <span className="text-sm font-medium text-slate-500">Tbps</span>
          </div>
          <div className="mt-3 flex gap-1 h-8 items-end opacity-60">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-indigo-500 rounded-t"
                style={{ height: `${40 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Map Mock */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[400px]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" />
            Live Viewer Distribution
          </h3>
          <div className="flex-1 relative rounded-xl border border-slate-800/50 bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Extremely simple CSS map mock pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-950"></div>
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-contain opacity-20 filter invert"></div>

            {/* Blinking node points */}
            <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
            <div className="absolute top-[35%] left-[45%] w-2 h-2 bg-blue-500 rounded-full animate-ping delay-75"></div>
            <div className="absolute top-[25%] left-[50%] w-3 h-3 bg-rose-500 rounded-full animate-ping delay-150"></div>
            <div className="absolute top-[40%] left-[75%] w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-300"></div>
            <div className="absolute top-[60%] left-[30%] w-2 h-2 bg-indigo-500 rounded-full animate-ping delay-500"></div>

            <p className="z-10 text-slate-500 font-mono text-sm bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
              Syncing geo-spatial Mux data...
            </p>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-0 flex flex-col overflow-hidden h-[400px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Real-time Logs
            </h3>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <p className="text-slate-600">Waiting for events...</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-slate-600 shrink-0">{log.time}</span>
                  <span
                    className={cn(
                      "shrink-0 font-bold",
                      log.type === "info"
                        ? "text-blue-500"
                        : log.type === "warn"
                          ? "text-amber-500"
                          : "text-rose-500",
                    )}
                  >
                    [{log.type.toUpperCase()}]
                  </span>
                  <span
                    className={cn(
                      log.type === "error" ? "text-rose-200" : "text-slate-300",
                    )}
                  >
                    {log.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NEW: Stream Health & Audience Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" />
            Stream Health Monitoring
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-white font-bold">Global Sports Feed</h4>
                <p className="text-xs text-slate-400 mt-1">
                  iptv-org / global_sports.m3u
                </p>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  99.8% Uptime
                </div>
                <p className="text-xs text-slate-500 mt-1">Validated 2m ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-white font-bold">Regional Sports Feed</h4>
                <p className="text-xs text-slate-400 mt-1">
                  iptv-org / regional_de.m3u
                </p>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  98.5% Uptime
                </div>
                <p className="text-xs text-slate-500 mt-1">Validated 5m ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-rose-900/50 opacity-70">
              <div>
                <h4 className="text-white font-bold">Unknown Provider</h4>
                <p className="text-xs text-slate-400 mt-1">
                  http://192.168.../feed.m3u8
                </p>
              </div>
              <div className="text-right">
                <div className="text-rose-500 font-bold flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Offline
                </div>
                <p className="text-xs text-slate-500 mt-1">Auto-pruned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Globe2 className="w-5 h-5 text-blue-500" />
            Live Audience Leaderboard
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">
                  Sky Sports Premier League
                </h4>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white font-black">24.5k</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                  Viewers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">ESPN Live</h4>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white font-black">18.2k</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                  Viewers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">CBS News Live</h4>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-white font-black">8.4k</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                  Viewers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional VPN Insights */}
      <RegionalFeedAnalysis />
    </div>
  );
};
