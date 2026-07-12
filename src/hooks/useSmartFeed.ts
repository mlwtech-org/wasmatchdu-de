import { useState, useEffect, useMemo } from "react";
import { Channel } from "../types";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface AlgorithmConfig {
  healthWeight: number;
  regionalWeight: number;
  categoryWeight: number;
}

export const useSmartFeed = (
  channels: Channel[],
  profile: string = "General",
  userRegion: string = "Global",
) => {
  const [config, setConfig] = useState<AlgorithmConfig>({
    healthWeight: 1.0,
    regionalWeight: 1.5,
    categoryWeight: 1.2,
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "algorithm_config", "live"), (snap) => {
      if (snap.exists()) {
        setConfig(snap.data() as AlgorithmConfig);
      }
    });
    return () => unsub();
  }, []);

  const smartFeed = useMemo(() => {
    if (!channels || channels.length === 0) return [];

    const channelsWithIntelligence = channels.map((ch, index) => {
      const isSimulatedDead = index % 10 === 0;
      const baseHealth = isSimulatedDead ? 40 : 90 + Math.random() * 10;

      let relevanceScore = 1.0;

      // Regional boost
      const channelRegion = ch.gemeinwohlCategory || "Global";
      if (userRegion !== "Global") {
        if (
          channelRegion.toLowerCase().includes(userRegion.toLowerCase()) ||
          (ch.isRegional && userRegion === "Local")
        ) {
          relevanceScore *= config.regionalWeight;
        }
      }

      // Category boost
      const groupLower = (ch.group || "").toLowerCase();
      if (profile === "Sports Fan" && groupLower.includes("sport"))
        relevanceScore *= config.categoryWeight;
      if (profile === "News Watcher" && groupLower.includes("news"))
        relevanceScore *= config.categoryWeight;
      if (
        profile === "Movie Buff" &&
        (groupLower.includes("movie") || groupLower.includes("film"))
      )
        relevanceScore *= config.categoryWeight;

      const finalScore = baseHealth * config.healthWeight * relevanceScore;

      return {
        ...ch,
        _intelligence: {
          healthScore: baseHealth,
          matchScore: relevanceScore * 100,
          rankScore: finalScore,
          isHealthy: baseHealth > 50,
        },
      };
    });

    const healthyStreams = channelsWithIntelligence.filter(
      (ch) => ch._intelligence.isHealthy,
    );
    return healthyStreams.sort(
      (a, b) => b._intelligence.rankScore - a._intelligence.rankScore,
    );
  }, [channels, profile, userRegion, config]);

  return { smartFeed, algorithmConfig: config };
};
