export type UserRole = "user" | "operator" | "admin" | "dev";

export interface User {
  uid: string;
  email: string;
  isPremium?: boolean;
  isPro?: boolean;
  stripeCustomerId?: string;
  subscriptionStatus?:
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "trialing";
  role: UserRole;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isKidsMode: boolean;
  pin?: string;
  regionLock?: string;
  contentRating?: string;
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
  isRegional: boolean;
  gemeinwohlCategory: string;
  _intelligence?: {
    healthScore: number;
    matchScore: number;
    rankScore: number;
    isHealthy: boolean;
  };
  isUnstable: boolean;
  currentProgram?: string;
  currentProgramTime?: string;
  nextProgram?: string;
  nextProgramTime?: string;
  provider?: string;
  isPremium?: boolean;
}

export interface PlayerState {
  currentChannel: Channel | null;
  currentPlaylist: Channel[];
  channels: Channel[]; // curated dashboard channels
  globalChannels: Channel[]; // all public unverified channels
  favorites: string[];
  recentlyWatched: string[];
  watchHistory: Record<string, number>;
  isTheaterMode: boolean;
  accessibilityMode: boolean;
  kidsMode: boolean;
  setCurrentChannel: (channel: Channel | null) => void;
  setCurrentPlaylist: (channels: Channel[]) => void;
  playNextChannel: () => void;
  setChannels: (channels: Channel[]) => void;
  toggleFavorite: (channelId: string) => void;
  updateWatchHistory: (category: string, durationSeconds: number) => void;
  toggleTheaterMode: () => void;
  setAccessibilityMode: (mode: boolean) => void;
  setKidsMode: (mode: boolean) => void;
}

export interface FeedConfiguration {
  id: string;
  name: string;
  url: string;
  type: "global" | "regional";
  allowedRoles: UserRole[];
}

export interface PlaylistState {
  channels: Channel[];
  groups: string[];
  searchQuery: string;
  selectedGroup: string;
  showOnlyRegional: boolean;
  showOnlyFavorites: boolean;
  favorites: string[];
  accessibilityMode: boolean;
  kidsMode: boolean;
  showUnstableChannels: boolean;
  setShowUnstableChannels: (show: boolean) => void;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}
