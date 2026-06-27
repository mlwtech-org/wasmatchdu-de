import { Channel } from "../types";

/**
 * Parses an M3U playlist file into a structured array of Channels.
 */
const NSFW_TERMS = [
  "xxx",
  "porn",
  "adult",
  "18+",
  "onlyfans",
  "playboy",
  "hustler",
  "x-rated",
  "nsfw",
];

const generateId = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `ch-${Math.abs(hash).toString(36)}`;
};

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

      const nameAndGroup = `${name} ${group}`.toLowerCase();

      // NSFW Check - Drop the channel entirely if it matches
      const isSafe = !NSFW_TERMS.some((term) => nameAndGroup.includes(term));
      if (!isSafe) {
        currentChannel = {}; // Reset so the next URL line is ignored
        continue;
      }

      // Advanced heuristic for German Regional Channels
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
        nameAndGroup.includes("show") ||
        nameAndGroup.includes("comedy")
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

      const groupLower = group.toLowerCase();
      if (groupLower.includes("news") || groupLower.includes("nachrichten"))
        gemeinwohlCategory = "Nachrichten & Info";
      else if (
        groupLower.includes("movie") ||
        groupLower.includes("film") ||
        groupLower.includes("cinema")
      )
        gemeinwohlCategory = "Filme & Serien";
      else if (groupLower.includes("sport"))
        gemeinwohlCategory = "Sport & Action";
      else if (groupLower.includes("music") || groupLower.includes("musik"))
        gemeinwohlCategory = "Musik & Kultur";
      else if (groupLower.includes("docu") || groupLower.includes("wissen"))
        gemeinwohlCategory = "Doku & Wissen";
      else if (
        groupLower.includes("kids") ||
        groupLower.includes("kinder") ||
        groupLower.includes("family")
      )
        gemeinwohlCategory = "Kinder & Familie";
      else if (isRegional) gemeinwohlCategory = "Lokal & Regional";

      currentChannel = {
        id: "", // Will be set deterministically from the URL

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
      currentChannel.id = generateId(line); // Deterministic ID based on the stream URL

      const urlLower = line.toLowerCase();
      // Tag known problematic hosters that require VPNs, tokens, or strict CORS
      let isBlocked =
        urlLower.includes("pluto.tv") ||
        urlLower.includes("pluto") ||
        urlLower.includes("dazn") ||
        urlLower.includes("rakuten") ||
        urlLower.includes("samsung");

      // Filter out explicitly geo-blocked channels
      if (
        currentChannel.name &&
        currentChannel.name.toLowerCase().includes("geo-blocked")
      ) {
        isBlocked = true;
      }

      // Modern browsers block HTTP video streams on HTTPS sites (Mixed Content)
      if (window.location.protocol === "https:" && line.startsWith("http://")) {
        isBlocked = true;
      }

      currentChannel.isUnstable = isBlocked;

      // Mock EPG Data assignment based on category
      let currentProgram: string | undefined = undefined;
      let currentProgramTime: string | undefined = undefined;
      let nextProgram: string | undefined = undefined;

      const now = new Date();
      const hour = now.getHours();
      const nextHour = (hour + 1) % 24;
      const nextNextHour = (hour + 2) % 24;

      // Format like "19:00 - 20:30"
      const formatTime = (h: number, m: string) =>
        `${h.toString().padStart(2, "0")}:${m}`;

      const gemeinwohlCategory = currentChannel.gemeinwohlCategory;

      // Assign mock EPG to ~80% of channels to make the sidebar look populated
      if (Math.random() > 0.2) {
        currentProgramTime = `${formatTime(hour, "00")} - ${formatTime(nextHour, "30")}`;
        const nextTimeStr = `${formatTime(nextHour, "30")} - ${formatTime(nextNextHour, "00")}`;

        if (gemeinwohlCategory === "Nachrichten & Info") {
          currentProgram =
            hour < 12
              ? "Live: Morning Briefing"
              : hour < 18
                ? "Live: Global Updates"
                : "Live: Evening News Desk";
          nextProgram = `${nextTimeStr} | World Report`;
        } else if (gemeinwohlCategory === "Filme & Serien") {
          const movies = [
            "The Matrix",
            "Inception",
            "Interstellar",
            "The Dark Knight",
            "Pulp Fiction",
            "Forrest Gump",
          ];
          currentProgram = `Movie: ${movies[Math.floor(Math.random() * movies.length)]}`;
          nextProgram = `${nextTimeStr} | ${movies[Math.floor(Math.random() * movies.length)]}`;
        } else if (gemeinwohlCategory === "Sport & Action") {
          const sports = [
            "Live: World Cup Qualifier",
            "Live: Premier League",
            "Sports Center",
            "Live: Formula 1 Practice",
            "Live: NBA Playoffs",
          ];
          currentProgram = sports[Math.floor(Math.random() * sports.length)];
          nextProgram = `${nextTimeStr} | Sports Highlight Reel`;
        } else if (gemeinwohlCategory === "Kinder & Familie") {
          const kids = [
            "SpongeBob SquarePants",
            "Peppa Pig",
            "Bluey",
            "Paw Patrol",
            "Tom & Jerry",
          ];
          currentProgram = kids[Math.floor(Math.random() * kids.length)];
          nextProgram = `${nextTimeStr} | ${kids[Math.floor(Math.random() * kids.length)]}`;
        } else if (gemeinwohlCategory === "Doku & Wissen") {
          const docs = [
            "Planet Earth II",
            "Cosmos",
            "How It's Made",
            "Ancient Aliens",
            "MythBusters",
          ];
          currentProgram = docs[Math.floor(Math.random() * docs.length)];
          nextProgram = `${nextTimeStr} | ${docs[Math.floor(Math.random() * docs.length)]}`;
        } else {
          currentProgram = `Live: ${currentChannel.name || "Channel"} Broadcasting`;
          nextProgram = `${nextTimeStr} | Upcoming Show`;
        }
      }

      currentChannel.currentProgram = currentProgram;
      currentChannel.currentProgramTime = currentProgramTime;
      currentChannel.nextProgram = nextProgram;

      channels.push(currentChannel as Channel);

      currentChannel = {};
    }
  }

  return channels;
};
