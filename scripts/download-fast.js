import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAST_SOURCES = [
  { id: "pluto-us", name: "Pluto TV (US)", url: "https://i.mjh.nz/PlutoTV/us.m3u8" },
  { id: "samsung-us", name: "Samsung TV Plus (US)", url: "https://i.mjh.nz/SamsungTVPlus/us.m3u8" },
  { id: "plex-us", name: "Plex Live TV", url: "https://i.mjh.nz/Plex/us.m3u8" },
  { id: "roku-us", name: "Roku Channel", url: "https://i.mjh.nz/Roku/us.m3u8" },
  { id: "tubi-us", name: "Tubi Live", url: "https://i.mjh.nz/Tubi/us.m3u8" }
];

const targetDir = path.join(__dirname, '..', 'public', 'fast');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadFeeds() {
  console.log("Downloading FAST feeds...");
  for (const source of FAST_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) {
        console.warn(`Failed to fetch ${source.name}: ${res.status}`);
        continue;
      }
      const text = await res.text();
      fs.writeFileSync(path.join(targetDir, `${source.id}.m3u8`), text);
      console.log(`Successfully downloaded ${source.name}`);
    } catch (e) {
      console.error(`Error downloading ${source.name}:`, e.message);
    }
  }
}

downloadFeeds();
