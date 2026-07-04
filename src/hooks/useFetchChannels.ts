import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { FALLBACK_CHANNELS } from "../lib/constants";
import { Channel } from "../types";

export const useFetchChannels = () => {
  const {
    setChannels,
    setGlobalChannels,
    setError,
    setIsLoading,
    globalChannels,
    watchHistory,
    recentlyWatched,
    activeProfileId,
    profiles,
  } = usePlayerStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const regionLock = activeProfile?.regionLock || "none";
  const lastLoadedRegion = useRef<string | null>(null);

  useEffect(() => {
    if (regionLock === lastLoadedRegion.current && globalChannels.length > 0) return;

    const fetchOptimizedFeeds = async () => {
      setIsLoading(true);
      setChannels([]);
      try {
        let allChannels: Channel[] = [];
        
        // Fetch pre-aggregated static JSON for instant load
        const res = await fetch("/channels.json");
        if (res.ok) {
           allChannels = await res.json();
        } else {
           console.warn("Failed to fetch channels.json, ensure aggregate script is run.");
        }

        const dashboardCandidates = allChannels.filter(c => 
          c.url.startsWith("https") && 
          !c.url.match(/\d+\.\d+\.\d+\.\d+/) && 
          c.logo && 
          !c.isUnstable
        );

        // Sorting Logic (Personalization)
        // 1. Identify top 2 categories from watch history
        const sortedHistory = Object.entries(watchHistory || {})
          .sort(([, a], [, b]) => b - a)
          .map(([category]) => category);
        const topCategories = sortedHistory.slice(0, 2);

        // 2. Sort candidates
        const sortedChannels = [...dashboardCandidates].sort((a, b) => {
          // Boost recently watched
          const aRecentIdx = recentlyWatched ? recentlyWatched.indexOf(a.id) : -1;
          const bRecentIdx = recentlyWatched ? recentlyWatched.indexOf(b.id) : -1;
          
          if (aRecentIdx !== -1 && bRecentIdx === -1) return -1;
          if (bRecentIdx !== -1 && aRecentIdx === -1) return 1;
          if (aRecentIdx !== -1 && bRecentIdx !== -1) return aRecentIdx - bRecentIdx;

          // Boost top categories
          const aInTop = topCategories.includes(a.gemeinwohlCategory);
          const bInTop = topCategories.includes(b.gemeinwohlCategory);

          if (aInTop && !bInTop) return -1;
          if (!aInTop && bInTop) return 1;

          // Alphabetical fallback
          return a.name.localeCompare(b.name);
        });

        const dynamicDashboardChannels = regionLock === "none"
          ? [
              ...FALLBACK_CHANNELS,
              ...sortedChannels
            ]
          : sortedChannels; 

        setChannels(dynamicDashboardChannels);
        setGlobalChannels(allChannels);
        lastLoadedRegion.current = regionLock;
        setError(null);
      } catch (err) {
        console.error("Error fetching channels:", err);
        setError("Failed to load channel list. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptimizedFeeds();
  }, [
    setChannels,
    setGlobalChannels,
    setError,
    setIsLoading,
    globalChannels.length,
    regionLock,
  ]);
};
