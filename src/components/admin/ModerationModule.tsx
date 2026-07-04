import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, Search, XCircle, CheckCircle, Ban, SlidersHorizontal, Activity } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: (string | undefined | null | false)[]) =>
  twMerge(clsx(inputs));

export const ModerationModule: React.FC<{ showToast: (msg: string, type: "success" | "error" | "info") => void }> = ({ showToast }) => {
  const [autoModeration, setAutoModeration] = useState(true);
  const [strictness, setStrictness] = useState<"low" | "medium" | "high">("medium");

  const [flaggedStreams, setFlaggedStreams] = useState([
    {
      id: "stream_8x2",
      channel: "Sky Sports Action",
      reason: "Copyright Violation",
      confidence: 96,
      time: "2 mins ago",
      thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&q=80",
    },
    {
      id: "stream_9p1",
      channel: "HBO Comedy HD",
      reason: "NSFW Content",
      confidence: 88,
      time: "5 mins ago",
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&q=80",
    },
    {
      id: "stream_1a4",
      channel: "User: GamerBoy23",
      reason: "Hate Speech (Audio)",
      confidence: 92,
      time: "12 mins ago",
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&q=80",
    },
    {
      id: "stream_7z9",
      channel: "Movie Central",
      reason: "Copyright Violation",
      confidence: 99,
      time: "1 hour ago",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&q=80",
    }
  ]);

  const handleModerate = (id: string, action: "ban" | "approve") => {
    setFlaggedStreams((prev) => prev.filter((s) => s.id !== id));
    showToast(`Stream has been ${action === "ban" ? "BANNED" : "APPROVED"}.`, "success");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Moderation Controls Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              AI Auto-Moderation Engine
            </h3>
            <button
              onClick={() => {
                setAutoModeration(!autoModeration);
                showToast(`Auto-Moderation ${!autoModeration ? "Enabled" : "Disabled"}`, !autoModeration ? "success" : "info");
              }}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
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
          <p className="text-slate-400 text-sm mb-6">
            When enabled, the AWS Rekognition engine automatically analyzes frames and audio for NSFW content, hate speech, and copyright violations.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              AI Strictness Threshold
            </h4>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setStrictness(level);
                    showToast(`Strictness set to ${level.toUpperCase()}`, "info");
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all",
                    strictness === level ? "bg-slate-800 text-white shadow" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              {strictness === "low" ? "Flags only > 95% confidence." : strictness === "medium" ? "Flags > 80% confidence (Recommended)." : "Flags > 60% confidence (Aggressive)."}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Ban className="w-5 h-5 text-indigo-500" />
            User Ban Management
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Search for users to revoke access or manage IP blocklists.
          </p>

          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username, IP, or Email..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="p-4 border border-dashed border-slate-700 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center text-center">
             <Activity className="w-6 h-6 text-emerald-500 mb-2" />
             <p className="text-sm font-medium text-slate-300">No active bans match search.</p>
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Manual Review Queue ({flaggedStreams.length})
          </h3>
          {flaggedStreams.length > 0 && (
            <div className="flex gap-2">
              <button 
                onClick={() => { setFlaggedStreams([]); showToast("All streams approved.", "success"); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors text-sm"
              >
                Approve All
              </button>
            </div>
          )}
        </div>

        {flaggedStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaggedStreams.map((stream) => (
              <div
                key={stream.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-4 items-center group"
              >
                <img
                  src={stream.thumbnail}
                  alt="Flagged frame"
                  className="w-24 h-16 object-cover rounded border border-rose-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-white truncate text-lg">
                      {stream.channel}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {stream.reason}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {stream.confidence}% Conf.
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 block">
                    Detected {stream.time}
                  </span>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleModerate(stream.id, "ban")}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> BAN
                  </button>
                  <button
                    onClick={() => handleModerate(stream.id, "approve")}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs rounded transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> IGNORE
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-700 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <p className="text-lg font-bold text-white">Inbox Zero!</p>
            <p className="text-sm text-slate-400 mt-1">
              No streams require manual review at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
