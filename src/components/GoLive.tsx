import React, { useState } from "react";
import {
  Copy,
  RefreshCw,
  Radio,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  ServerCrash,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";

export const GoLive: React.FC = () => {
  const [channelName, setChannelName] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [streamData, setStreamData] = useState<{
    stream_id: string;
    stream_key: string;
    ingest_urls: { srt: string; rtmp: string };
  } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<"srt" | "rtmp" | "key" | "link" | null>(
    null,
  );
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const isLocalBackend = apiUrl.includes("localhost");

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    setIsProvisioning(true);
    setProvisionError(null);
    try {
      const response = await fetch(`${apiUrl}/stream/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_name: channelName }),
      });

      if (!response.ok)
        throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      setStreamData(data);
    } catch (error) {
      console.error(error);
      setProvisionError(isLocalBackend ? "backend_offline" : "server_error");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCopy = (text: string, type: "srt" | "rtmp" | "key" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in duration-500">
        {/* Page Title */}
        <div className="text-center mb-12">
          <Radio className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Start Broadcasting
          </h1>
          <p className="mt-4 text-xl text-slate-400">
            Provision your stream, get your ingest credentials, and go live to
            the world.
          </p>
        </div>

        {/* Warning banner: local backend required */}
        {isLocalBackend && !streamData && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <ServerCrash className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-semibold mb-1">Local Backend Required</p>
              <p>
                Go Live needs the MediaMTX streaming server running locally on{" "}
                <code className="bg-black/30 px-1 rounded text-amber-300">
                  {apiUrl}
                </code>
                . Start it with{" "}
                <code className="bg-black/30 px-1 rounded text-amber-300">
                  ./mediamtx
                </code>{" "}
                before provisioning a stream.
              </p>
            </div>
          </div>
        )}

        {/* Inline error state */}
        {provisionError && (
          <div
            className={cn(
              "mb-6 rounded-xl p-5 flex items-start gap-4 border",
              provisionError === "backend_offline"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-orange-500/10 border-orange-500/30",
            )}
          >
            <XCircle
              className={cn(
                "w-6 h-6 flex-shrink-0 mt-0.5",
                provisionError === "backend_offline"
                  ? "text-red-400"
                  : "text-orange-400",
              )}
            />
            <div className="flex-1">
              {provisionError === "backend_offline" ? (
                <>
                  <p className="font-semibold text-red-300 mb-1">
                    Streaming Backend is Offline
                  </p>
                  <p className="text-sm text-red-200/80">
                    Could not reach{" "}
                    <code className="bg-black/30 px-1 rounded">{apiUrl}</code>.
                    Make sure the MediaMTX server is running on your machine,
                    then try again.
                  </p>
                  <div className="mt-3 bg-black/40 rounded-lg p-3 font-mono text-xs text-green-400 leading-relaxed">
                    # Start the streaming backend
                    <br />
                    cd mediamtx &amp;&amp; ./mediamtx
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-orange-300 mb-1">
                    Stream Provisioning Failed
                  </p>
                  <p className="text-sm text-orange-200/80">
                    The server returned an error. Please try again or contact
                    support if the problem persists.
                  </p>
                </>
              )}
              <button
                onClick={() => setProvisionError(null)}
                className="mt-3 text-sm text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Form or Stream Credentials */}
        {!streamData ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <form
              onSubmit={handleProvision}
              className="relative z-10 space-y-6 max-w-md mx-auto"
            >
              <div>
                <label
                  htmlFor="channelName"
                  className="block text-sm font-medium text-slate-300"
                >
                  Channel Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="channelName"
                    id="channelName"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="block w-full rounded-lg border-0 py-3 px-4 bg-slate-800/50 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                    placeholder="e.g., Gaming Stream"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isProvisioning || !channelName}
                className={cn(
                  "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200",
                  isProvisioning
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02]",
                )}
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  "Generate Stream Credentials"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-bold text-white">
                  Stream Provisioned!
                </h2>
              </div>

              <div className="space-y-6">
                {/* SRT URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    SRT Ingest URL (Recommended for OBS)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 block p-4 bg-black/40 rounded-lg border border-white/5 text-green-400 font-mono text-sm break-all">
                      {streamData.ingest_urls.srt}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(streamData.ingest_urls.srt, "srt")
                      }
                      className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shrink-0"
                    >
                      {copied === "srt" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* RTMP URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    RTMP URL (Fallback)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 block p-4 bg-black/40 rounded-lg border border-white/5 text-blue-400 font-mono text-sm break-all">
                      {streamData.ingest_urls.rtmp}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(streamData.ingest_urls.rtmp, "rtmp")
                      }
                      className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shrink-0"
                    >
                      {copied === "rtmp" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center justify-between">
                    <span>Stream Key</span>
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {showKey ? "Hide" : "Reveal"}
                    </button>
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 block p-4 bg-black/40 rounded-lg border border-white/5 text-purple-400 font-mono text-sm break-all">
                      {showKey ? streamData.stream_key : "•".repeat(32)}
                    </code>
                    <button
                      onClick={() => handleCopy(streamData.stream_key, "key")}
                      className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shrink-0"
                    >
                      {copied === "key" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">
                    Keep your Stream Key secret!
                  </p>
                  <p>
                    Anyone with this key can broadcast to your channel. Input
                    these settings into your encoder (like OBS Studio) and start
                    streaming.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/live/${streamData.stream_id}`)}
                  className="flex-1 flex justify-center items-center py-3 px-4 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors shadow-lg shadow-green-900/20"
                >
                  Preview Stream
                </button>
                <button
                  onClick={() =>
                    handleCopy(
                      `${window.location.origin}/live/${streamData.stream_id}`,
                      "link",
                    )
                  }
                  className="flex-1 flex justify-center items-center py-3 px-4 rounded-lg border border-slate-600 hover:bg-slate-800 text-white font-medium transition-colors"
                >
                  {copied === "link" ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Copied!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Copy className="w-5 h-5" /> Copy Public Link
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setStreamData(null)}
                className="text-slate-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Provision another stream
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
