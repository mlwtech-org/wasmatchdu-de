import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAST_SOURCES = [
  { id: "iptv-in", name: "Live TV (India)", url: "https://iptv-org.github.io/iptv/countries/in.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-hin", name: "Live TV (Hindi)", url: "https://iptv-org.github.io/iptv/languages/hin.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-tam", name: "Live TV (Tamil)", url: "https://iptv-org.github.io/iptv/languages/tam.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-tel", name: "Live TV (Telugu)", url: "https://iptv-org.github.io/iptv/languages/tel.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-mal", name: "Live TV (Malayalam)", url: "https://iptv-org.github.io/iptv/languages/mal.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-ben", name: "Live TV (Bengali)", url: "https://iptv-org.github.io/iptv/languages/ben.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-kan", name: "Live TV (Kannada)", url: "https://iptv-org.github.io/iptv/languages/kan.m3u", provider: "Public IPTV", region: "India" },
  { id: "iptv-mar", name: "Live TV (Marathi)", url: "https://iptv-org.github.io/iptv/languages/mar.m3u", provider: "Public IPTV", region: "India" }
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

// Extremely fast liveness check: just abort immediately on response headers
async function checkStreamReachable(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const req = client.request(url, { method: 'GET', timeout: 3500 }, (res) => {
      req.destroy(); // Abort downloading video chunks
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function aggregateFeeds() {
  console.log("Downloading and aggregating feeds...");
  let rawChannels = [];
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
          rawChannels.push(ch);
        }
      }
      console.log(`Parsed ${parsedChannels.length} channels from ${source.name}`);
    } catch (e) {
      console.error(`Error with ${source.name}:`, e.message);
    }
  }

  console.log(`\nValidating ${rawChannels.length} streams for 100% liveness... (This may take a minute)`);
  
  const MAX_CONCURRENCY = 100; // Check 100 at a time
  const verifiedChannels = [];
  
  for (let i = 0; i < rawChannels.length; i += MAX_CONCURRENCY) {
    const batch = rawChannels.slice(i, i + MAX_CONCURRENCY);
    const results = await Promise.all(batch.map(async (ch) => {
      // If it's already marked as unstable, we can skip it or double check it.
      // For maximum reliability, we only keep it if checkStreamReachable is true.
      const isAlive = await checkStreamReachable(ch.url);
      return isAlive ? ch : null;
    }));
    
    for (const r of results) {
      if (r) verifiedChannels.push(r);
    }
    process.stdout.write(`\rProgress: ${Math.min(i + MAX_CONCURRENCY, rawChannels.length)} / ${rawChannels.length}`);
  }

  console.log(`\nValidation complete. Kept ${verifiedChannels.length} highly reliable channels out of ${rawChannels.length}.`);
  console.log(`Writing ${verifiedChannels.length} total channels to public/channels.json`);
  fs.writeFileSync(path.join(targetDir, 'channels.json'), JSON.stringify(verifiedChannels, null, 2));
}

aggregateFeeds();
