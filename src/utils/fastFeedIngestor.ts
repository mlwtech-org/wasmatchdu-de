import { Channel } from "../types";
import { parseM3U } from "./m3uParser";

// ─────────────────────────────────────────────────────────────────────────────
// FAST (Free Ad-Supported Streaming TV) channel sources from iptv-org
// Organised by: Global (work everywhere) → Regional (by detected country code)
// ─────────────────────────────────────────────────────────────────────────────

interface FastSource {
  id: string;
  name: string;
  url: string;
  provider: string;
  regions: string[]; // "global" or ISO-3166-1 alpha-2 country codes
}

const FAST_SOURCES: FastSource[] = [
  // ── Always-on Global FAST Networks ──────────────────────────────────────
  {
    id: "pluto-us",
    name: "Pluto TV (US)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_pluto.m3u",
    provider: "Pluto TV",
    regions: ["global", "us", "ca"],
  },
  {
    id: "pluto-de",
    name: "Pluto TV (DE)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/de_pluto.m3u",
    provider: "Pluto TV DE",
    regions: ["global", "de", "at", "ch"],
  },
  {
    id: "pluto-gb",
    name: "Pluto TV (UK)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/gb_pluto.m3u",
    provider: "Pluto TV UK",
    regions: ["global", "gb", "ie"],
  },
  {
    id: "pluto-es",
    name: "Pluto TV (Spain)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/es_pluto.m3u",
    provider: "Pluto TV ES",
    regions: ["global", "es"],
  },
  {
    id: "pluto-it",
    name: "Pluto TV (Italy)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/it_pluto.m3u",
    provider: "Pluto TV IT",
    regions: ["global", "it"],
  },
  {
    id: "pluto-fr",
    name: "Pluto TV (France)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/fr_pluto.m3u",
    provider: "Pluto TV FR",
    regions: ["global", "fr"],
  },
  {
    id: "pluto-au",
    name: "Pluto TV (Australia)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/au_pluto.m3u",
    provider: "Pluto TV AU",
    regions: ["global", "au", "nz"],
  },

  // ── Samsung TV Plus ──────────────────────────────────────────────────────
  {
    id: "samsung-us",
    name: "Samsung TV Plus (US)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_samsung.m3u",
    provider: "Samsung TV+",
    regions: ["global", "us"],
  },
  {
    id: "samsung-de",
    name: "Samsung TV Plus (DE)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/de_samsung.m3u",
    provider: "Samsung TV+ DE",
    regions: ["global", "de", "at"],
  },
  {
    id: "samsung-gb",
    name: "Samsung TV Plus (UK)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/gb_samsung.m3u",
    provider: "Samsung TV+ UK",
    regions: ["global", "gb"],
  },
  {
    id: "samsung-in",
    name: "Samsung TV Plus (India)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/in_samsung.m3u",
    provider: "Samsung TV+ IN",
    regions: ["global", "in"],
  },
  {
    id: "samsung-au",
    name: "Samsung TV Plus (AU)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/au_samsung.m3u",
    provider: "Samsung TV+ AU",
    regions: ["global", "au"],
  },
  {
    id: "samsung-fr",
    name: "Samsung TV Plus (FR)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/fr_samsung.m3u",
    provider: "Samsung TV+ FR",
    regions: ["global", "fr"],
  },
  {
    id: "samsung-it",
    name: "Samsung TV Plus (IT)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/it_samsung.m3u",
    provider: "Samsung TV+ IT",
    regions: ["global", "it"],
  },

  // ── Plex & Tubi (Global) ─────────────────────────────────────────────────
  {
    id: "plex-us",
    name: "Plex Live TV",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_plex.m3u",
    provider: "Plex",
    regions: ["global"],
  },
  {
    id: "tubi-us",
    name: "Tubi Live",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_tubi.m3u",
    provider: "Tubi",
    regions: ["global", "us"],
  },

  // ── Roku Channel ────────────────────────────────────────────────────────
  {
    id: "roku-us",
    name: "Roku Channel (US)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_roku.m3u",
    provider: "Roku",
    regions: ["global", "us", "ca", "gb"],
  },

  // ── Regional / Country-specific FAST networks ────────────────────────────
  {
    id: "rakuten-de",
    name: "Rakuten TV (DE)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/de_rakuten.m3u",
    provider: "Rakuten TV",
    regions: ["de", "at", "ch"],
  },
  {
    id: "rakuten-gb",
    name: "Rakuten TV (UK)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/gb_rakuten.m3u",
    provider: "Rakuten TV",
    regions: ["gb"],
  },
  {
    id: "rakuten-fr",
    name: "Rakuten TV (FR)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/fr_rakuten.m3u",
    provider: "Rakuten TV",
    regions: ["fr"],
  },
  {
    id: "pbs-us",
    name: "PBS Channels",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_pbs.m3u",
    provider: "PBS",
    regions: ["global", "us"],
  },
  {
    id: "stirr-us",
    name: "STIRR (US)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_stirr.m3u",
    provider: "STIRR",
    regions: ["us"],
  },
  {
    id: "local-now-us",
    name: "Local Now (US)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_localnow.m3u",
    provider: "Local Now",
    regions: ["us"],
  },
  {
    id: "freeform-us",
    name: "XUMO Play (US)",
    url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us_xumo.m3u",
    provider: "XUMO",
    regions: ["us"],
  },
];

/**
 * Fetch FAST channels for the given country code.
 * Loads:
 *  1. All sources tagged "global"
 *  2. Sources tagged with the user's specific country code
 * This ensures users always get content relevant to their region + widely-available content.
 */
export const fetchFastFeeds = async (countryCode: string = "global"): Promise<Channel[]> => {
  const cc = countryCode.toLowerCase();

  // Select sources relevant to this user's region
  const relevantSources = FAST_SOURCES.filter(
    (s) => s.regions.includes("global") || s.regions.includes(cc)
  );

  console.log(
    `[FAST] Loading ${relevantSources.length} FAST feeds for region: ${cc.toUpperCase()}`
  );

  let allChannels: Channel[] = [];

  // Fetch all relevant sources concurrently for speed
  const results = await Promise.allSettled(
    relevantSources.map(async (source) => {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseM3U(text);
      return parsed.map((c) => ({
        ...c,
        id: `${source.id}-${c.id || Math.random().toString(36).substring(7)}`,
        group: `${source.provider} – ${c.group || "General"}`,
        isRegional: false,
        provider: source.provider,
      }));
    })
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      allChannels = [...allChannels, ...result.value];
    } else {
      console.warn(`[FAST] Failed to load ${relevantSources[i].name}:`, result.reason);
    }
  }

  console.log(`[FAST] Loaded ${allChannels.length} FAST channels total`);
  return allChannels;
};
