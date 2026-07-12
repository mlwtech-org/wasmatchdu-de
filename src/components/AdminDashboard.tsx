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
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { TelemetryModule } from "./admin/TelemetryModule";
import { CMSModule } from "./admin/CMSModule";
import { FinancialsModule } from "./admin/FinancialsModule";
import { ModerationModule } from "./admin/ModerationModule";
import { AnalyticsDrillDown } from "./admin/AnalyticsDrillDown";
import { ContentIntelligence } from "./admin/ContentIntelligence";
import { BrainCircuit } from "lucide-react";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

type Tab =
  | "overview"
  | "telemetry"
  | "cms"
  | "financials"
  | "moderation"
  | "intelligence";
type Metric = "viewers" | "revenue" | "health" | null;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data States for Overview
  const [concurrentViewers, setConcurrentViewers] = useState(45291);
  const [dailyRevenue, setDailyRevenue] = useState(12450.5);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedMetric, setSelectedMetric] = useState<Metric>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Simulate live changing data for Overview
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
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === "overview"
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            <LayoutDashboard className="w-5 h-5" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === "telemetry"
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            <Activity className="w-5 h-5" /> Telemetry
          </button>
          <button
            onClick={() => setActiveTab("intelligence")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === "intelligence"
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            <BrainCircuit className="w-5 h-5" /> Intelligence
          </button>
          <button
            onClick={() => setActiveTab("cms")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === "cms"
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            <Settings className="w-5 h-5" /> CMS Content
          </button>
          <button
            onClick={() => setActiveTab("financials")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === "financials"
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
          >
            <DollarSign className="w-5 h-5" /> Financials
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === "moderation"
                ? "bg-blue-600/10 text-blue-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
            )}
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
            <h1 className="text-3xl font-black text-white capitalize">
              {activeTab === "overview"
                ? "Platform Overview"
                : activeTab === "intelligence"
                  ? "Content Intelligence"
                  : activeTab === "cms"
                    ? "CMS Content"
                    : activeTab}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === "overview" &&
                "Real-time metrics and platform administration"}
              {activeTab === "intelligence" &&
                "AI-driven content recommendations and stream health"}
              {activeTab === "telemetry" &&
                "Network health, latency, and regional VPN analysis"}
              {activeTab === "cms" &&
                "Content management, feature flags, and stream verification"}
              {activeTab === "financials" &&
                "Revenue, tips, and financial projections"}
              {activeTab === "moderation" &&
                "User reports and automated moderation tools"}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-fit flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-medium border border-slate-700"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </header>

        {activeTab === "telemetry" ? (
          <TelemetryModule />
        ) : activeTab === "intelligence" ? (
          <ContentIntelligence />
        ) : activeTab === "cms" ? (
          <CMSModule showToast={showToast} />
        ) : activeTab === "financials" ? (
          <FinancialsModule />
        ) : activeTab === "moderation" ? (
          <ModerationModule showToast={showToast} />
        ) : (
          <>
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                onClick={() =>
                  setSelectedMetric(
                    selectedMetric === "viewers" ? null : "viewers",
                  )
                }
                className={cn(
                  "bg-slate-900 border rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10",
                  selectedMetric === "viewers"
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-800",
                )}
              >
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
                  Click to view geo breakdown & insights
                </p>
              </div>

              <div
                onClick={() =>
                  setSelectedMetric(
                    selectedMetric === "revenue" ? null : "revenue",
                  )
                }
                className={cn(
                  "bg-slate-900 border rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10",
                  selectedMetric === "revenue"
                    ? "border-emerald-500 ring-1 ring-emerald-500"
                    : "border-slate-800",
                )}
              >
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
                </div>
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  Click to view conversion funnel
                </p>
              </div>

              <div
                onClick={() =>
                  setSelectedMetric(
                    selectedMetric === "health" ? null : "health",
                  )
                }
                className={cn(
                  "bg-slate-900 border rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10",
                  selectedMetric === "health"
                    ? "border-rose-500 ring-1 ring-rose-500"
                    : "border-slate-800",
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500">
                  <Activity className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                </div>
                <h3 className="text-slate-400 font-medium mb-1">
                  Platform Uptime & Health
                </h3>
                <div className="text-4xl font-black text-white tracking-tight">
                  99.98%
                </div>
                <p className="text-xs text-rose-400 mt-4 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Anomalous traffic
                  detected. Click to view.
                </p>
              </div>
            </div>

            {/* Drill Down Area */}
            <AnalyticsDrillDown
              selectedMetric={selectedMetric}
              onClose={() => setSelectedMetric(null)}
              showToast={showToast}
            />
          </>
        )}
      </main>

      {/* Custom Toast System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border",
              toast.type === "success"
                ? "bg-emerald-950 border-emerald-900 text-emerald-400"
                : toast.type === "error"
                  ? "bg-rose-950 border-rose-900 text-rose-400"
                  : "bg-blue-950 border-blue-900 text-blue-400",
            )}
          >
            <Bell className="w-5 h-5" />
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
