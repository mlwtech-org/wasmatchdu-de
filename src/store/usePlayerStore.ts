import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, PlayerState, PlaylistState } from '../types';

interface StoreState extends PlayerState, PlaylistState {
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGroup: (group: string) => void;
  setShowOnlyRegional: (show: boolean) => void;
  setShowOnlyFavorites: (show: boolean) => void;
  toggleFavorite: (channelId: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsTheaterMode: (isTheaterMode: boolean) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const usePlayerStore = create<StoreState>()(
  persist(
    (set) => ({
      channels: [],
      groups: [],
      currentChannel: null,
      isPlaying: false,
      volume: 1,
      isMuted: false,
      isTheaterMode: false,
      searchQuery: '',
      selectedGroup: 'All',
      showOnlyRegional: false,
      showOnlyFavorites: false,
      favorites: [],
      isLoading: false,
      error: null,

      setChannels: (channels) => {
        const groups = Array.from(new Set(channels.map((c) => c.group))).sort();
        set({ channels, groups: ['All', ...groups] });
      },
      setCurrentChannel: (channel) => set({ currentChannel: channel, error: null }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
      setShowOnlyRegional: (showOnlyRegional) => set({ showOnlyRegional }),
      setShowOnlyFavorites: (showOnlyFavorites) => set({ showOnlyFavorites }),
      toggleFavorite: (channelId) => set((state) => ({
        favorites: state.favorites.includes(channelId)
          ? state.favorites.filter(id => id !== channelId)
          : [...state.favorites, channelId]
      })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setIsTheaterMode: (isTheaterMode) => set({ isTheaterMode }),
      setError: (error) => set({ error }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'openiptv-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
