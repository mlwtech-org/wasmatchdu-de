export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
  isRegional: boolean;
  gemeinwohlCategory: string;
}

export interface PlayerState {
  currentChannel: Channel | null;
  channels: Channel[];
  favorites: string[];
  isTheaterMode: boolean;
  accessibilityMode: boolean;
  kidsMode: boolean;
  setCurrentChannel: (channel: Channel | null) => void;
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
  isLoading: boolean;
  error: string | null;
  user: { email: string; uid: string } | null;
}
