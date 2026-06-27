import { create } from "zustand";
import { Channel } from "../types";

interface RadioState {
  currentStation: Channel | null;
  isPlaying: boolean;
  volume: number;
  setCurrentStation: (station: Channel | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useRadioStore = create<RadioState>((set) => ({
  currentStation: null,
  isPlaying: false,
  volume: 1,
  setCurrentStation: (station) =>
    set({ currentStation: station, isPlaying: !!station }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
}));
