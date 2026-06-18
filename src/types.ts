export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  group: string;
  isRegional: boolean;
}

export interface PlayerState {
  currentChannel: Channel | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isTheaterMode: boolean;
}

export interface PlaylistState {
  channels: Channel[];
  groups: string[];
  searchQuery: string;
  selectedGroup: string;
  showOnlyRegional: boolean;
  showOnlyFavorites: boolean;
  favorites: string[];
  isLoading: boolean;
  error: string | null;
}
