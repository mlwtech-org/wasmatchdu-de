import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Channel, PlayerState, PlaylistState, User, UserProfile } from "../types";

interface StoreState extends PlayerState, PlaylistState {
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  playNextChannel: () => void;
  playPreviousChannel: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedGroup: (group: string) => void;
  setShowOnlyRegional: (show: boolean) => void;
  setShowOnlyFavorites: (show: boolean) => void;
  toggleFavorite: (channelId: string) => void;
  setAccessibilityMode: (enabled: boolean) => void;
  setKidsMode: (enabled: boolean) => void;
  useProxy: boolean;
  toggleProxy: () => void;
  toggleTheaterMode: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setUser: (user: User | null) => void;
  profiles: UserProfile[];
  activeProfileId: string | null;
  addProfile: (profile: UserProfile) => void;
  updateProfile: (id: string, updates: Partial<UserProfile>) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  trendingEnabled: boolean;
  setTrendingEnabled: (enabled: boolean) => void;
  customFeeds: string[];
  addCustomFeed: (url: string) => void;
  removeCustomFeed: (url: string) => void;
}

export const usePlayerStore = create<StoreState>()(
  persist(
    (set, get) => ({
      channels: [],
      groups: [],
      currentChannel: null,
      currentPlaylist: [],
      isTheaterMode: false,
      searchQuery: "",
      selectedGroup: "All",
      showOnlyRegional: false,
      showOnlyFavorites: false,
      favorites: [],
      recentlyWatched: [],
      accessibilityMode: false,
      kidsMode: false,
      useProxy: false,
      showUnstableChannels: false,
      isLoading: false,
      error: null,
      user: null,
      profiles: [],
      activeProfileId: null,
      trendingEnabled: true,
      customFeeds: [],

      setChannels: (channels) => {
        const groups = Array.from(new Set(channels.map((c) => c.group))).sort();
        set({ channels, groups: ["All", ...groups] });
      },
      setCurrentChannel: (channel) => {
        set((state) => {
          if (!channel) return { currentChannel: null, error: null };

          const newRecent = [
            channel.id,
            ...state.recentlyWatched.filter((id) => id !== channel.id),
          ].slice(0, 5);
          return {
            currentChannel: channel,
            error: null,
            recentlyWatched: newRecent,
          };
        });
      },
      setCurrentPlaylist: (channels) => set({ currentPlaylist: channels }),
      playNextChannel: () => {
        const { currentChannel, currentPlaylist } = get();
        if (!currentChannel || currentPlaylist.length === 0) return;
        const currentIndex = currentPlaylist.findIndex(
          (c) => c.id === currentChannel.id,
        );
        if (currentIndex !== -1 && currentIndex + 1 < currentPlaylist.length) {
          set({
            currentChannel: currentPlaylist[currentIndex + 1],
            error: null,
          });
        }
      },
      playPreviousChannel: () => {
        const { currentChannel, currentPlaylist } = get();
        if (!currentChannel || currentPlaylist.length === 0) return;
        const currentIndex = currentPlaylist.findIndex(
          (c) => c.id === currentChannel.id,
        );
        if (currentIndex > 0) {
          set({
            currentChannel: currentPlaylist[currentIndex - 1],
            error: null,
          });
        }
      },
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
      setShowOnlyRegional: (showOnlyRegional) => set({ showOnlyRegional }),
      setShowOnlyFavorites: (showOnlyFavorites) => set({ showOnlyFavorites }),
      toggleFavorite: (channelId) =>
        set((state) => ({
          favorites: state.favorites.includes(channelId)
            ? state.favorites.filter((id) => id !== channelId)
            : [...state.favorites, channelId],
        })),
      setAccessibilityMode: (accessibilityMode) => set({ accessibilityMode }),
      setKidsMode: (kidsMode) => {
        set({ kidsMode });
        // Automatically switch to Kids category if turned on
        if (kidsMode) set({ selectedGroup: "Kinder & Familie" });
        else set({ selectedGroup: "All" });
      },
      setShowUnstableChannels: (showUnstableChannels) =>
        set({ showUnstableChannels }),
      toggleProxy: () => set((state) => ({ useProxy: !state.useProxy })),
      toggleTheaterMode: () =>
        set((state) => ({ isTheaterMode: !state.isTheaterMode })),
      setError: (error) => set({ error }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setUser: (user) => set({ user }),
      addProfile: (profile) => set((state) => ({ profiles: [...state.profiles, profile] })),
      updateProfile: (id, updates) => set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      })),
      removeProfile: (id) => set((state) => ({
        profiles: state.profiles.filter((p) => p.id !== id),
        activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
      })),
      setActiveProfile: (id) => {
        set({ activeProfileId: id });
        // Automatically switch kids mode based on profile
        const { profiles, setKidsMode } = get();
        const profile = profiles.find(p => p.id === id);
        if (profile) {
          setKidsMode(profile.isKidsMode);
        }
      },
      setTrendingEnabled: (trendingEnabled) => set({ trendingEnabled }),
      addCustomFeed: (url) =>
        set((state) => {
          if (!state.customFeeds.includes(url)) {
            return { customFeeds: [...state.customFeeds, url] };
          }
          return state;
        }),
      removeCustomFeed: (url) =>
        set((state) => ({
          customFeeds: state.customFeeds.filter((u) => u !== url),
        })),
    }),
    {
      name: "openiptv-storage",
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyWatched: state.recentlyWatched,
        accessibilityMode: state.accessibilityMode,
        kidsMode: state.kidsMode,
        useProxy: state.useProxy,
        showUnstableChannels: state.showUnstableChannels,
        customFeeds: state.customFeeds,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        user: state.user,
      }),
    },
  ),
);
