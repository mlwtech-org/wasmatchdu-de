import { Channel } from "../types";

export const getViewerCount = (channelId: string): number => {
  let hash = 0;
  for (let i = 0; i < channelId.length; i++) {
    hash = channelId.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate a realistic viewer count between 1,200 and 38,000
  const baseCount = Math.abs(hash) % 36800;
  return baseCount + 1200;
};

export const sortChannelsByPopularity = (channels: Channel[]): Channel[] => {
  return [...channels].sort((a, b) => {
    return getViewerCount(b.id) - getViewerCount(a.id);
  });
};

export const sortChannelsAlphabetically = (channels: Channel[]): Channel[] => {
  return [...channels].sort((a, b) => a.name.localeCompare(b.name));
};
