import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAST_SOURCES = [
  { id: "iptv-us", name: "Live TV (US)", url: "https://iptv-org.github.io/iptv/countries/us.m3u", provider: "Public IPTV", region: "North America" },
  { id: "iptv-uk", name: "Live TV (UK)", url: "https://iptv-org.github.io/iptv/countries/uk.m3u", provider: "Public IPTV", region: "Europe" },
  { id: "iptv-in", name: "Live TV (IN)", url: "https://iptv-org.github.io/iptv/countries/in.m3u", provider: "Public IPTV", region: "Asia Pacific" },
  { id: "iptv-au", name: "Live TV (AU)", url: "https://iptv-org.github.io/iptv/countries/au.m3u", provider: "Public IPTV", region: "Asia Pacific" },
  { id: "iptv-ca", name: "Live TV (CA)", url: "https://iptv-org.github.io/iptv/countries/ca.m3u", provider: "Public IPTV", region: "North America" },
  { id: "iptv-de", name: "Live TV (DE)", url: "https://iptv-org.github.io/iptv/countries/de.m3u", provider: "Public IPTV", region: "Europe" }
];

const targetDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const generateId = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `ch-${Math.abs(hash).toString(36)}`;
};

const NSFW_TERMS = ["xxx", "porn", "adult", "18+", "onlyfans", "playboy", "hustler", "x-rated", "nsfw"];

const parseM3U = (m3uContent, providerName, sourceRegion) => {
  const lines = m3uContent.split("\n");
  const channels = [];
  let currentChannel = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF:")) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const nameMatch = line.match(/,(.+)$/);

      const name = nameMatch ? nameMatch[1].trim() : "Unknown Channel";
      const group = groupMatch ? groupMatch[1] : "Uncategorized";
      const nameAndGroup = `${name} ${group}`.toLowerCase();

      if (NSFW_TERMS.some((term) => nameAndGroup.includes(term))) {
        currentChannel = {}; 
        continue;
      }

      let gemeinwohlCategory = "Unterhaltung";
      if (group.toLowerCase().includes("news")) gemeinwohlCategory = "Nachrichten & Info";
      else if (group.toLowerCase().includes("movie") || group.toLowerCase().includes("film")) gemeinwohlCategory = "Filme & Serien";
      else if (group.toLowerCase().includes("sport")) gemeinwohlCategory = "Sport & Action";
      else if (group.toLowerCase().includes("music")) gemeinwohlCategory = "Musik & Kultur";
      else if (group.toLowerCase().includes("docu") || group.toLowerCase().includes("wissen")) gemeinwohlCategory = "Doku & Wissen";
      else if (group.toLowerCase().includes("kids")) gemeinwohlCategory = "Kinder & Familie";

      currentChannel = {
        logo: logoMatch ? logoMatch[1] : "",
        group,
        name,
        isRegional: true,
        region: sourceRegion || "Global (Auto)",
        gemeinwohlCategory,
        isUnstable: false,
        provider: providerName,
      };
    } else if (line.startsWith("http") && currentChannel.name) {
      currentChannel.url = line;
      currentChannel.id = generateId(line);
      
      const urlLower = line.toLowerCase();
      let isBlocked = false;
        
      if (
        currentChannel.name &&
        (currentChannel.name.toLowerCase().includes("geo-blocked") ||
         currentChannel.name.toLowerCase().includes("not 24/7") ||
         currentChannel.name.toLowerCase().includes("unstable"))
      ) {
        isBlocked = true;
      }
      
      currentChannel.isUnstable = isBlocked;

      channels.push({ ...currentChannel });
      currentChannel = {};
    }
  }
  return channels;
};

async function aggregateFeeds() {
  console.log("Downloading and aggregating feeds...");
  let allChannels = [];
  const uniqueUrls = new Set();

  for (const source of FAST_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) continue;
      const text = await res.text();
      const parsedChannels = parseM3U(text, source.provider, source.region);
      
      for (const ch of parsedChannels) {
        if (!uniqueUrls.has(ch.url)) {
          uniqueUrls.add(ch.url);
          allChannels.push(ch);
        }
      }
      console.log(`Parsed ${parsedChannels.length} channels from ${source.name}`);
    } catch (e) {
      console.error(`Error with ${source.name}:`, e.message);
    }
  }

  console.log(`Writing ${allChannels.length} total channels to public/channels.json`);
  fs.writeFileSync(path.join(targetDir, 'channels.json'), JSON.stringify(allChannels, null, 2));
}

aggregateFeeds();
