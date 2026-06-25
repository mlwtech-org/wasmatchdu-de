import { Channel } from "../types";

/**
 * Parses an M3U playlist file into a structured array of Channels.
 */
export const parseM3U = (m3uContent: string): Channel[] => {
  const lines = m3uContent.split("\n");
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF:")) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const nameMatch = line.match(/,(.+)$/);

      const name = nameMatch ? nameMatch[1].trim() : "Unknown Channel";
      const group = groupMatch ? groupMatch[1] : "Uncategorized";

      // Advanced heuristic for German Regional Channels
      const nameAndGroup = `${name} ${group}`.toLowerCase();
      const isRegional =
        nameAndGroup.includes("wdr") ||
        nameAndGroup.includes("ndr") ||
        nameAndGroup.includes("swr") ||
        nameAndGroup.includes("mdr") ||
        nameAndGroup.includes("hr-fernsehen") ||
        nameAndGroup.includes("br fernsehen") ||
        nameAndGroup.includes("regional") ||
        nameAndGroup.includes("lokal");

      // ZDF.de style High-Quality Categorization
      let gemeinwohlCategory = "Unterhaltung";

      if (
        nameAndGroup.includes("arte") ||
        nameAndGroup.includes("3sat") ||
        nameAndGroup.includes("doku") ||
        nameAndGroup.includes("documentary") ||
        nameAndGroup.includes("wissen") ||
        nameAndGroup.includes("science") ||
        nameAndGroup.includes("nature") ||
        nameAndGroup.includes("alpha") ||
        nameAndGroup.includes("zdfinfo") ||
        nameAndGroup.includes("history") ||
        nameAndGroup.includes("phoenix") ||
        nameAndGroup.includes("planet")
      ) {
        gemeinwohlCategory = "Doku & Wissen";
      } else if (
        nameAndGroup.includes("sport") ||
        nameAndGroup.includes("euro") ||
        nameAndGroup.includes("kicker") ||
        nameAndGroup.includes("motor") ||
        nameAndGroup.includes("auto")
      ) {
        gemeinwohlCategory = "Sport & Action";
      } else if (
        nameAndGroup.includes("film") ||
        nameAndGroup.includes("kino") ||
        nameAndGroup.includes("movie") ||
        nameAndGroup.includes("serie") ||
        nameAndGroup.includes("series") ||
        nameAndGroup.includes("webseries") ||
        nameAndGroup.includes("one") ||
        nameAndGroup.includes("zdfneo") ||
        nameAndGroup.includes("tele 5")
      ) {
        gemeinwohlCategory = "Filme & Serien";
      } else if (
        nameAndGroup.includes("comedy") ||
        nameAndGroup.includes("sat.1") ||
        nameAndGroup.includes("prosieben") ||
        nameAndGroup.includes("rtl") ||
        nameAndGroup.includes("vox") ||
        nameAndGroup.includes("show")
      ) {
        gemeinwohlCategory = "Shows & Comedy";
      } else if (
        nameAndGroup.includes("kika") ||
        nameAndGroup.includes("kinder") ||
        nameAndGroup.includes("family") ||
        nameAndGroup.includes("disney") ||
        nameAndGroup.includes("nick") ||
        nameAndGroup.includes("toggo") ||
        nameAndGroup.includes("cartoon")
      ) {
        gemeinwohlCategory = "Kinder & Familie";
      } else if (isRegional) {
        gemeinwohlCategory = "Lokal & Regional";
      } else if (
        nameAndGroup.includes("tagesschau") ||
        nameAndGroup.includes("welt") ||
        nameAndGroup.includes("news") ||
        nameAndGroup.includes("nachrichten") ||
        nameAndGroup.includes("n-tv") ||
        nameAndGroup.includes("info")
      ) {
        gemeinwohlCategory = "Nachrichten & Info";
      }

      currentChannel = {
        id: `ch-${Math.random().toString(36).substring(2, 9)}`,
        logo: logoMatch ? logoMatch[1] : "",
        group,
        name,
        isRegional,
        gemeinwohlCategory,
        isUnstable: false,
        url: "", // Will be set on the next line
      };
    } else if (line.startsWith("http") && currentChannel.name) {
      currentChannel.url = line;

      const urlLower = line.toLowerCase();
      // Tag known problematic hosters that require VPNs, tokens, or strict CORS
      let isBlocked =
        urlLower.includes("pluto.tv") ||
        urlLower.includes("pluto") ||
        urlLower.includes("dazn") ||
        urlLower.includes("rakuten") ||
        urlLower.includes("samsung");

      // Modern browsers block HTTP video streams on HTTPS sites (Mixed Content)
      if (window.location.protocol === "https:" && line.startsWith("http://")) {
        isBlocked = true;
      }

      currentChannel.isUnstable = isBlocked;
      channels.push(currentChannel as Channel);

      currentChannel = {};
    }
  }

  return channels;
};
