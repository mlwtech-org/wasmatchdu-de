import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Channel,
  PlayerState,
  PlaylistState,
  User,
  UserProfile,
  FeedConfiguration,
} from "../types";

interface StoreState extends PlayerState, PlaylistState {
  setChannels: (channels: Channel[]) => void;
  setGlobalChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  removeChannel: (channelId: string) => void;
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
  configuredFeeds: FeedConfiguration[];
  addConfiguredFeed: (feed: FeedConfiguration) => void;
  removeConfiguredFeed: (id: string) => void;
  watchHistory: Record<string, number>;
  updateWatchHistory: (category: string, durationSeconds: number) => void;
  loadUserDataFromFirebase: (userId: string) => Promise<void>;
  miniPlayerChannel: Channel | null;
  setMiniPlayerChannel: (channel: Channel | null) => void;
  closeMiniPlayer: () => void;
  aiRecommendedChannels: Channel[];
  setAiRecommendedChannels: (channels: Channel[]) => void;
  aiRecommendationTitle: string;
  setAiRecommendationTitle: (title: string) => void;
}

export const usePlayerStore = create<StoreState>()(
  persist(
    (set, get) => ({
      channels: [],
      globalChannels: [],
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
      watchHistory: {},
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
      configuredFeeds: [
        {
          id: "default-global-1",
          name: "Global Public Feed",
          url: "https://iptv-org.github.io/iptv/index.m3u",
          type: "global",
          allowedRoles: ["user", "operator", "admin", "dev"],
        },
      ],
      miniPlayerChannel: null,
      aiRecommendedChannels: [],
      aiRecommendationTitle: "AI Recommendations",

      setAiRecommendedChannels: (channels) =>
        set({ aiRecommendedChannels: channels }),
      setAiRecommendationTitle: (title) =>
        set({ aiRecommendationTitle: title }),

      setChannels: (channels) => {
        const groups = Array.from(new Set(channels.map((c) => c.group))).sort();
        set({ channels, groups: ["All", ...groups] });
      },
      setGlobalChannels: (channels) => set({ globalChannels: channels }),
      removeChannel: (channelId) => {
        set((state) => {
          const newChannels = state.channels.filter((c) => c.id !== channelId);
          return { channels: newChannels };
        });
      },
      setCurrentChannel: (channel) => {
        set((state) => {
          if (!channel) return { currentChannel: null, error: null };

          const newRecent = [
            channel.id,
            ...state.recentlyWatched.filter((id) => id !== channel.id),
          ].slice(0, 20);
          return {
            currentChannel: channel,
            error: null,
            recentlyWatched: newRecent,
          };
        });
      },
      updateWatchHistory: (category, durationSeconds) => {
        set((state) => {
          if (!category) return state;
          const current = state.watchHistory[category] || 0;
          const newHistory = {
            ...state.watchHistory,
            [category]: current + durationSeconds,
          };

          // Sync to Firebase if user is logged in (and not a dev mock)
          if (state.user?.uid && !state.user.uid.startsWith("dev-")) {
            setDoc(
              doc(db, "users", state.user.uid),
              { watchHistory: newHistory },
              { merge: true },
            ).catch((err) => console.error("Firebase sync failed:", err));
          }

          return {
            watchHistory: newHistory,
          };
        });
      },
      loadUserDataFromFirebase: async (userId) => {
        if (!userId || userId.startsWith("dev-")) return;
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("../lib/firebase");
          const docRef = doc(db, "users", userId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            set((state) => {
              // Update watch history
              const newWatchHistory = data.watchHistory
                ? { ...state.watchHistory, ...data.watchHistory }
                : state.watchHistory;

              // Update user object with premium status and role if available
              const updatedUser = state.user
                ? {
                    ...state.user,
                    isPremium: !!data.isPremium,
                    isPro: !!data.isPro,
                    stripeCustomerId: data.stripeCustomerId || undefined,
                    subscriptionStatus: data.subscriptionStatus || undefined,
                    role: data.role || state.user.role,
                  }
                : state.user;

              return {
                watchHistory: newWatchHistory,
                user: updatedUser,
              };
            });
          }
        } catch (err) {
          console.error("Failed to load user data from Firebase:", err);
        }
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
      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),
      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
      removeProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id ? null : state.activeProfileId,
        })),
      setActiveProfile: (id) => {
        set({ activeProfileId: id });
        // Automatically switch kids mode based on profile
        const { profiles, setKidsMode } = get();
        const profile = profiles.find((p) => p.id === id);
        if (profile) {
          setKidsMode(profile.isKidsMode);
        }
      },
      setTrendingEnabled: (trendingEnabled) => set({ trendingEnabled }),
      addConfiguredFeed: (feed) =>
        set((state) => {
          if (!state.configuredFeeds.find((f) => f.id === feed.id)) {
            return { configuredFeeds: [...state.configuredFeeds, feed] };
          }
          return state;
        }),
      removeConfiguredFeed: (id) =>
        set((state) => ({
          configuredFeeds: state.configuredFeeds.filter((f) => f.id !== id),
        })),

      setMiniPlayerChannel: (channel) => set({ miniPlayerChannel: channel }),
      closeMiniPlayer: () => set({ miniPlayerChannel: null }),
    }),
    {
      name: "openiptv-storage",
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyWatched: state.recentlyWatched,
        watchHistory: state.watchHistory,
        accessibilityMode: state.accessibilityMode,
        kidsMode: state.kidsMode,
        useProxy: state.useProxy,
        showUnstableChannels: state.showUnstableChannels,
        configuredFeeds: state.configuredFeeds,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        user: state.user,
      }),
    },
  ),
);
