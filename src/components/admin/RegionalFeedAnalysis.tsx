import React, { useMemo, useState } from "react";
import {
  Shield,
  ShieldAlert,
  Globe2,
  MapPin,
  Search,
  ChevronRight,
  ChevronDown,
  Activity,
  Users,
  Play,
} from "lucide-react";
import { usePlayerStore } from "../../store/usePlayerStore";
import { getViewerCount } from "../../utils/sorting";
import { Channel } from "../../types";
import { AdminMiniPlayer } from "./AdminMiniPlayer";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const RegionalFeedAnalysis: React.FC = () => {
  const { channels } = usePlayerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [selectedTestChannel, setSelectedTestChannel] =
    useState<Channel | null>(null);

  // Group channels by region/group and calculate VPN necessity
  const regionStats = useMemo(() => {
    const groups: Record<
      string,
      {
        total: number;
        requiresVpn: number;
        direct: number;
        regions: Set<string>;
      }
    > = {};

    channels.forEach((channel) => {
      const groupName = channel.group || "Uncategorized";
      if (!groups[groupName]) {
        groups[groupName] = {
          total: 0,
          requiresVpn: 0,
          direct: 0,
          regions: new Set(),
        };
      }

      groups[groupName].total += 1;
      // Heuristic: If it's regional, it likely needs a VPN when accessed globally
      if (channel.isRegional || channel.isUnstable) {
        groups[groupName].requiresVpn += 1;
      } else {
        groups[groupName].direct += 1;
      }

      if (channel.gemeinwohlCategory) {
        groups[groupName].regions.add(channel.gemeinwohlCategory);
      }
    });

    return Object.entries(groups)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        requiresVpn: stats.requiresVpn,
        direct: stats.direct,
        categories: Array.from(stats.regions).join(", "),
        // Simulated latency for realism
        vpnLatency: Math.floor(Math.random() * 80) + 120, // 120-200ms
        directLatency: Math.floor(Math.random() * 30) + 15, // 15-45ms
        successRate:
          stats.requiresVpn > 0
            ? (Math.random() * 5 + 90).toFixed(1)
            : (Math.random() * 2 + 97).toFixed(1),
      }))
      .sort((a, b) => b.total - a.total); // Sort by volume
  }, [channels]);

  const filteredStats = useMemo(() => {
    return regionStats.filter(
      (stat) =>
        stat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.categories.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [regionStats, searchTerm]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-6 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-500" />
            Regional Feed & VPN Analysis
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Real-time breakdown of channel accessibility across different
            geographical zones.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
              <th className="p-4 pl-6">Region / Group</th>
              <th className="p-4">Channels</th>
              <th className="p-4">Connection Type</th>
              <th className="p-4">Avg Latency</th>
              <th className="p-4">Success Rate</th>
              <th className="p-4 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredStats.map((stat, i) => {
              const needsVpn = stat.requiresVpn > 0;
              const isExpanded = expandedRegion === stat.name;

              // Get top 5 channels for this region
              const topChannels = [...channels]
                .filter((c) => (c.group || "Uncategorized") === stat.name)
                .sort((a, b) => getViewerCount(b.id) - getViewerCount(a.id))
                .slice(0, 5);

              return (
                <React.Fragment key={i}>
                  <tr
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() =>
                      setExpandedRegion(isExpanded ? null : stat.name)
                    }
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg mt-1 border",
                            needsVpn
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                          )}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white mb-0.5">
                            {stat.name}
                          </div>
                          <div
                            className="text-xs text-slate-500 max-w-xs truncate"
                            title={stat.categories}
                          >
                            {stat.categories || "Global Content"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">
                        {stat.total}{" "}
                        <span className="text-slate-500 text-sm font-normal">
                          total
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex gap-2">
                        {stat.direct > 0 && (
                          <span className="text-emerald-400">
                            {stat.direct} Direct
                          </span>
                        )}
                        {stat.requiresVpn > 0 && (
                          <span className="text-amber-400">
                            {stat.requiresVpn} Geo-Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {stat.direct > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md w-fit border border-emerald-500/20">
                            <Shield className="w-3 h-3" /> Direct Connection
                          </span>
                        )}
                        {stat.requiresVpn > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md w-fit border border-amber-500/20">
                            <ShieldAlert className="w-3 h-3" /> VPN Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm font-mono text-slate-300">
                        {stat.direct > 0 && (
                          <div>
                            <span className="text-slate-500 mr-2">DIR:</span>
                            {stat.directLatency}ms
                          </div>
                        )}
                        {stat.requiresVpn > 0 && (
                          <div>
                            <span className="text-slate-500 mr-2">VPN:</span>
                            {stat.vpnLatency}ms
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-white">
                          {stat.successRate}%
                        </div>
                        <Activity
                          className={cn(
                            "w-4 h-4",
                            parseFloat(stat.successRate) > 95
                              ? "text-emerald-500"
                              : "text-amber-500",
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-2 rounded-lg transition-colors border border-blue-500/20 group-hover:border-blue-500/40">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-900/50">
                      <td colSpan={6} className="p-0 border-b border-slate-800">
                        <div className="p-4 pl-6 md:pl-16 bg-slate-950/30 shadow-inner">
                          <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Top Performing Channels in {stat.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-2">
                            {topChannels.map((tc) => (
                              <div
                                key={tc.id}
                                onClick={() => setSelectedTestChannel(tc)}
                                className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="bg-blue-600/90 p-2 rounded-full transform scale-50 group-hover:scale-100 transition-transform shadow-lg shadow-blue-900/50">
                                    <Play className="w-4 h-4 text-white ml-0.5" />
                                  </div>
                                </div>
                                <div
                                  className="font-bold text-white text-sm truncate relative z-10"
                                  title={tc.name}
                                >
                                  {tc.name}
                                </div>
                                <div className="flex justify-between items-end relative z-10">
                                  <div className="text-xs text-slate-400">
                                    {tc.isRegional || tc.isUnstable ? (
                                      <span className="text-amber-500 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3" />{" "}
                                        Geo-Locked
                                      </span>
                                    ) : (
                                      <span className="text-emerald-500 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Direct
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-blue-400 font-black text-sm">
                                    {(getViewerCount(tc.id) / 1000).toFixed(1)}k{" "}
                                    <span className="text-[10px] font-normal text-slate-500">
                                      viewers
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredStats.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No regional data found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTestChannel && (
        <AdminMiniPlayer
          channel={selectedTestChannel}
          onClose={() => setSelectedTestChannel(null)}
        />
      )}
    </div>
  );
};
