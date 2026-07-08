import React from "react";
import {
  Users,
  DollarSign,
  Activity,
  ArrowRight,
  ShieldAlert,
  Globe,
  Monitor,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

interface AnalyticsDrillDownProps {
  selectedMetric: "viewers" | "revenue" | "health" | null;
  onClose: () => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export const AnalyticsDrillDown: React.FC<AnalyticsDrillDownProps> = ({
  selectedMetric,
  onClose,
  showToast,
}) => {
  if (!selectedMetric) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
          {selectedMetric === "viewers" && (
            <Users className="text-blue-500 w-6 h-6" />
          )}
          {selectedMetric === "revenue" && (
            <DollarSign className="text-emerald-500 w-6 h-6" />
          )}
          {selectedMetric === "health" && (
            <Activity className="text-rose-500 w-6 h-6" />
          )}
          {selectedMetric} Deep Dive
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5 transition"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedMetric === "viewers" && (
          <>
            {/* Viewers Insight */}
            <div className="space-y-4">
              <h3 className="text-slate-400 font-medium">Top Geographies</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-slate-500" /> United States
                  </div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-blue-500"></div>
                  </div>
                  <div className="text-sm font-medium">65%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-slate-500" /> United Kingdom
                  </div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[20%] h-full bg-blue-500"></div>
                  </div>
                  <div className="text-sm font-medium">20%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-slate-500" /> Germany
                  </div>
                  <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[15%] h-full bg-blue-500"></div>
                  </div>
                  <div className="text-sm font-medium">15%</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-slate-400 font-medium">Device Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
                  <Smartphone className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-2xl font-bold text-white">72%</span>
                  <span className="text-xs text-slate-400">Mobile Devices</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
                  <Monitor className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-2xl font-bold text-white">28%</span>
                  <span className="text-xs text-slate-400">
                    Desktop & Smart TV
                  </span>
                </div>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-2 bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-blue-400 mb-1">
                  AI Actionable Insight
                </h4>
                <p className="text-sm text-slate-300">
                  Mobile viewership is trending 15% higher today than the 30-day
                  average. Consider sending a push notification to prompt PWA
                  installation for better retention.
                </p>
              </div>
            </div>
          </>
        )}

        {selectedMetric === "revenue" && (
          <>
            {/* Revenue Insight */}
            <div className="space-y-4">
              <h3 className="text-slate-400 font-medium">Revenue Velocity</h3>
              <div className="flex h-32 items-end gap-2 border-b border-slate-800 pb-2">
                {[40, 65, 45, 80, 55, 95, 120].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-sm transition-colors cursor-pointer group relative"
                    style={{ height: `${(h / 120) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ${h}k
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-slate-400 font-medium">Conversion Funnel</h3>
              <div className="space-y-2">
                <div className="bg-slate-800 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm">Total Free Users</span>
                  <span className="font-bold">45,291</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
                </div>
                <div className="bg-slate-800/80 rounded-lg p-3 flex justify-between items-center border border-emerald-900/30">
                  <span className="text-sm">Clicked Upgrade</span>
                  <span className="font-bold">3,120</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
                </div>
                <div className="bg-emerald-900/20 rounded-lg p-3 flex justify-between items-center border border-emerald-500/50">
                  <span className="text-sm text-emerald-400 font-medium">
                    Active Pro Subs
                  </span>
                  <span className="font-bold text-emerald-400">
                    1,940 (4.2%)
                  </span>
                </div>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-2 bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-emerald-600/20 p-2 rounded-lg text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-emerald-400 mb-1">
                  AI Actionable Insight
                </h4>
                <p className="text-sm text-slate-300">
                  Pro upgrades spike immediately before premium sports events.
                  Scheduling an automated in-app banner 15 minutes before major
                  matches will likely increase conversion by ~2%.
                </p>
              </div>
            </div>
          </>
        )}

        {selectedMetric === "health" && (
          <>
            {/* Health & Regional Anomaly Insight */}
            <div className="space-y-4">
              <h3 className="text-slate-400 font-medium">Global Error Rates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/50">
                  <div className="text-2xl font-bold text-rose-400 mb-1">
                    0.4%
                  </div>
                  <div className="text-xs text-slate-400">
                    Average Buffer Ratio
                  </div>
                </div>
                <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/50">
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    12
                  </div>
                  <div className="text-xs text-slate-400">
                    Failed M3U Parsings (24h)
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-slate-400 font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Regional
                Anomalies
              </h3>
              <div className="bg-slate-800/50 rounded-xl border border-rose-900/50 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-rose-400">
                      Geo-Spoofing Spike Detected
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      High volume of requests for US-locked content from EU IP
                      ranges without Pro VPN auth.
                    </p>
                  </div>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                    CRITICAL
                  </span>
                </div>
                <button
                  onClick={() =>
                    showToast(
                      "Regional firewall rules updated. Unauthorized IPs are now blocked.",
                      "success",
                    )
                  }
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 rounded-lg transition"
                >
                  Enforce Regional Block Policy
                </button>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-rose-600/20 p-2 rounded-lg text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-rose-400 mb-1">
                  AI Actionable Insight
                </h4>
                <p className="text-sm text-slate-300">
                  A targeted attack bypassing regional locks is attempting to
                  overload the US edge servers. Enforcing the regional block
                  policy will drop these connections at the CDN level and
                  restore optimal bandwidth.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
