import React, { useMemo } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { ChannelRow } from "./ChannelRow";
import { Tv, Star, Flame, Sparkles, Activity } from "lucide-react";

export const ViewSpace: React.FC = () => {
  const { watchHistory, recentlyWatched, favorites, channels } =
    usePlayerStore();

  // Metrics Calculations
  const totalWatchedSeconds = Object.values(watchHistory || {}).reduce(
    (a, b) => a + b,
    0,
  );
  const totalWatchedHours = Math.round((totalWatchedSeconds / 3600) * 10) / 10;
  const uniqueChannels = recentlyWatched?.length || 0;

  // Calculate top genres from watch history (which is Record<category, duration>)
  const topGenres = useMemo(() => {
    return Object.entries(watchHistory || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [watchHistory]);

  const primaryGenre = topGenres.length > 0 ? topGenres[0][0] : "Mixed";

  // Algorithmic Recommendations based on Favorites
  const recommendedChannels = useMemo(() => {
    if (favorites.length === 0) return [];

    // Find categories of favorites
    const favCategories = new Set<string>();
    favorites.forEach((favId) => {
      const c = channels.find((c) => c.id === favId);
      if (c && c.group) favCategories.add(c.group);
    });

    // Recommend channels in the same categories that aren't already favorited
    return channels
      .filter((c) => favCategories.has(c.group) && !favorites.includes(c.id))
      .slice(0, 15); // Top 15 recommendations
  }, [favorites, channels]);

  const recentChannelsList = channels.filter((c) =>
    recentlyWatched.includes(c.id),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 pb-20 md:pb-8 px-4 sm:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-purple-400" />
          My Space
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Your personalized dashboard. We've curated these insights and
          recommendations based on your unique watch history and favorites.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Metric Cards */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-purple-500/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tv className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Unique Channels
              </p>
              <h3 className="text-3xl font-black text-white">
                {uniqueChannels}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Channels explored on the platform
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-pink-500/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Watch Time (Hours)
              </p>
              <h3 className="text-3xl font-black text-white">
                {totalWatchedHours}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">Total watch time recorded</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-orange-500/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Top Genre</p>
              <h3 className="text-3xl font-black text-white truncate">
                {primaryGenre}
              </h3>
            </div>
          </div>
          <div className="flex gap-2">
            {topGenres.map(([genre]) => (
              <span
                key={genre}
                className="text-[10px] px-2 py-1 bg-slate-800 rounded-full text-slate-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Because you favorited... */}
      {recommendedChannels.length > 0 && (
        <div className="max-w-screen-[2000px] mx-auto -mx-4 sm:-mx-8">
          <ChannelRow
            title="Because you Favorited"
            channels={recommendedChannels}
          />
        </div>
      )}

      {/* Row: Continue Watching */}
      {recentChannelsList.length > 0 && (
        <div className="max-w-screen-[2000px] mx-auto -mx-4 sm:-mx-8">
          <ChannelRow title="Continue Watching" channels={recentChannelsList} />
        </div>
      )}

      {/* Row: Favorites Fallback (if they haven't favorited much yet) */}
      {favorites.length === 0 && recentChannelsList.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <Star className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Your space is looking empty
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Start watching and favoriting channels to get personalized
            recommendations and track your watch habits here.
          </p>
        </div>
      )}
    </div>
  );
};
