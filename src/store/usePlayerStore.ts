import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, PlayerState, PlaylistState } from '../types';

interface StoreState extends PlayerState, PlaylistState {
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGroup: (group: string) => void;
  setShowOnlyRegional: (show: boolean) => void;
  setShowOnlyFavorites: (show: boolean) => void;
  toggleFavorite: (channelId: string) => void;
  setAccessibilityMode: (enabled: boolean) => void;
  setKidsMode: (enabled: boolean) => void;
  toggleTheaterMode: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setUser: (user: { email: string; uid: string } | null) => void;
}

export const usePlayerStore = create<StoreState>()(
  persist(
    (set) => ({
      channels: [],
      groups: [],
      currentChannel: null,
      isTheaterMode: false,
      searchQuery: '',
      selectedGroup: 'All',
      showOnlyRegional: false,
      showOnlyFavorites: false,
      favorites: [],
      accessibilityMode: false,
      kidsMode: false,
      isLoading: false,
      error: null,
      user: null,

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
      setAccessibilityMode: (accessibilityMode) => set({ accessibilityMode }),
      setKidsMode: (kidsMode) => {
        set({ kidsMode });
        // Automatically switch to Kids category if turned on
        if (kidsMode) set({ selectedGroup: 'Kinder & Familie' });
        else set({ selectedGroup: 'All' });
      },
      toggleTheaterMode: () => set((state) => ({ isTheaterMode: !state.isTheaterMode })),
      setError: (error) => set({ error }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'openiptv-storage',
      partialize: (state) => ({ 
        favorites: state.favorites,
        accessibilityMode: state.accessibilityMode,
        kidsMode: state.kidsMode
      }),
    }
  )
);
