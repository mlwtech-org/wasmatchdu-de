export interface User {
  uid: string;
  email: string;
  isPremium?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isKidsMode: boolean;
  pin?: string;
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
  isRegional: boolean;
  gemeinwohlCategory: string;
  isUnstable: boolean;
  currentProgram?: string;
  currentProgramTime?: string;
  nextProgram?: string;
  nextProgramTime?: string;
}

export interface PlayerState {
  currentChannel: Channel | null;
  currentPlaylist: Channel[];
  channels: Channel[];
  favorites: string[];
  recentlyWatched: string[];
  isTheaterMode: boolean;
  accessibilityMode: boolean;
  kidsMode: boolean;
  setCurrentChannel: (channel: Channel | null) => void;
  setCurrentPlaylist: (channels: Channel[]) => void;
  playNextChannel: () => void;
  setChannels: (channels: Channel[]) => void;
  toggleFavorite: (channelId: string) => void;
  toggleTheaterMode: () => void;
  setAccessibilityMode: (mode: boolean) => void;
  setKidsMode: (mode: boolean) => void;
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
