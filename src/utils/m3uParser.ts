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

      // Advanced heuristic for German Regional Channels
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

      // Gemeinwohl Categorization
      let gemeinwohlCategory = 'Gemeinsame Unterhaltung';
      if (
        nameAndGroup.includes('arte') || 
        nameAndGroup.includes('3sat') || 
        nameAndGroup.includes('doku') || 
        nameAndGroup.includes('wissen') ||
        nameAndGroup.includes('alpha')
      ) {
        gemeinwohlCategory = 'Wissen & Kultur';
      } else if (
        nameAndGroup.includes('kika') || 
        nameAndGroup.includes('kinder') || 
        nameAndGroup.includes('family') || 
        nameAndGroup.includes('disney') || 
        nameAndGroup.includes('nick') || 
        nameAndGroup.includes('super rtl') || 
        nameAndGroup.includes('toggo')
      ) {
        gemeinwohlCategory = 'Kinder & Familie';
      } else if (isRegional) {
        gemeinwohlCategory = 'Lokal & Regional';
      } else if (
        nameAndGroup.includes('tagesschau') || 
        nameAndGroup.includes('phoenix') || 
        nameAndGroup.includes('welt') || 
        nameAndGroup.includes('news') || 
        nameAndGroup.includes('nachrichten')
      ) {
        gemeinwohlCategory = 'Nachrichten & Gesellschaft';
      }

      currentChannel = {
        id: `ch-${Math.random().toString(36).substring(2, 9)}`,
        logo: logoMatch ? logoMatch[1] : '',
        group,
        name,
        isRegional,
        gemeinwohlCategory,
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
