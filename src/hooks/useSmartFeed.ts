import { useMemo } from "react";
import { Channel } from "../types";

// This hook simulates parsing `verified_streams.json` and ranking streams
// based on their health metric, ensuring dead links are not recommended.
export const useSmartFeed = (
  channels: Channel[],
  profile: string = "General",
) => {
  const smartFeed = useMemo(() => {
    if (!channels || channels.length === 0) return [];

    // 1. Assign simulated health scores (In production, this would map directly to verified_streams.json)
    const channelsWithIntelligence = channels.map((ch, index) => {
      // Simulate that ~10% of streams are dead/buffering (health < 50)
      const isSimulatedDead = index % 10 === 0;
      const baseHealth = isSimulatedDead ? 40 : 90 + Math.random() * 10;

      // Calculate relevance based on profile
      let relevanceScore = 1.0;
      if (profile === "Sports Fan" && ch.group.toLowerCase().includes("sport"))
        relevanceScore = 1.5;
      if (profile === "News Watcher" && ch.group.toLowerCase().includes("news"))
        relevanceScore = 1.5;

      const finalScore = baseHealth * relevanceScore;

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

    // 2. Filter out unhealthy streams completely from recommendations
    const healthyStreams = channelsWithIntelligence.filter(
      (ch) => ch._intelligence.isHealthy,
    );

    // 3. Sort by rankScore descending
    return healthyStreams.sort(
      (a, b) => b._intelligence.rankScore - a._intelligence.rankScore,
    );
  }, [channels, profile]);

  return { smartFeed };
};
