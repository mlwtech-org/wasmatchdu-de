import { Channel } from '../types';

/**
 * Parses an M3U playlist file into a structured array of Channels.
 */
export const parseM3U = (m3uContent: string): Channel[] => {
  const lines = m3uContent.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const nameMatch = line.match(/,(.+)$/);

      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
      const group = groupMatch ? groupMatch[1] : 'Uncategorized';

      // Advanced heuristic for German Regional Channels (WDR, NDR, ARD, etc.)
      const nameAndGroup = `${name} ${group}`.toLowerCase();
      const isRegional = 
        nameAndGroup.includes('wdr') || 
        nameAndGroup.includes('ndr') || 
        nameAndGroup.includes('swr') || 
        nameAndGroup.includes('mdr') || 
        nameAndGroup.includes('hr-fernsehen') || 
        nameAndGroup.includes('br fernsehen') || 
        nameAndGroup.includes('regional') || 
        nameAndGroup.includes('lokal');

      currentChannel = {
        id: `ch-${Math.random().toString(36).substring(2, 9)}`,
        logo: logoMatch ? logoMatch[1] : '',
        group,
        name,
        isRegional,
        url: '' // Will be set on the next line
      };
    } else if (line.startsWith('http') && currentChannel.name) {
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }

  return channels;
};
