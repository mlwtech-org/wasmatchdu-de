import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Channel } from "../types";

interface RadioState {
  currentStation: Channel | null;
  isPlaying: boolean;
  volume: number;
  recentlyPlayed: Channel[];
  setCurrentStation: (station: Channel | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  addRecentlyPlayed: (station: Channel) => void;
}

export const useRadioStore = create<RadioState>()(
  persist(
    (set) => ({
      currentStation: null,
      isPlaying: false,
      volume: 1,
      recentlyPlayed: [],
      setCurrentStation: (station) =>
        set((state) => {
          if (!station) return { currentStation: null, isPlaying: false };
          const filtered = state.recentlyPlayed.filter(
            (s) => s.url !== station.url,
          );
          return {
            currentStation: station,
            isPlaying: true,
            recentlyPlayed: [station, ...filtered].slice(0, 20),
          };
        }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setVolume: (volume) => set({ volume }),
      addRecentlyPlayed: (station) =>
        set((state) => {
          const filtered = state.recentlyPlayed.filter(
            (s) => s.url !== station.url,
          );
          return { recentlyPlayed: [station, ...filtered].slice(0, 20) };
        }),
    }),
    {
      name: "radio-storage",
      partialize: (state) => ({ recentlyPlayed: state.recentlyPlayed }),
    },
  ),
);
