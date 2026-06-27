import { useEffect } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { parseM3U } from "../utils/m3uParser";
import { GLOBAL_PLAYLISTS, VERIFIED_RELIABLE_CHANNELS } from "../lib/constants";

export const useFetchChannels = () => {
  const { setChannels, setError, setIsLoading, customFeeds, channels } =
    usePlayerStore();

  useEffect(() => {
    // Only fetch if channels are empty to avoid double-fetching on navigation
    if (channels.length > 0) return;

    const fetchM3U = async () => {
      setIsLoading(true);
      try {
        let countryCode = "de"; // Fallback to Germany
        try {
          const geoRes = await fetch("https://get.geojs.io/v1/ip/country.json");
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.country) {
              countryCode = geoData.country.toLowerCase();
            }
          }
        } catch (e) {
          console.warn("Geo-IP failed, falling back to default.", e);
        }

        // Primary validated stream URL (updated via GitHub Actions every 12h)
        const verifiedPlaylist = `https://raw.githubusercontent.com/mlwtech-org/wasmatchdu-de/validated-streams/verified_streams.m3u`;
        const primaryPlaylist = `https://iptv-org.github.io/iptv/countries/${countryCode}.m3u`;

        const texts: string[] = [];
        const verifiedRes = await fetch(verifiedPlaylist).catch(() => null);

        if (verifiedRes && verifiedRes.ok) {
          console.log("Using GitHub Actions verified streams");
          texts.push(await verifiedRes.text());
        } else {
          console.warn(
            "Verified streams not found. Falling back to raw public feeds.",
          );
          const primaryRes = await fetch(primaryPlaylist).catch(() => null);
          if (primaryRes && primaryRes.ok) {
            texts.push(await primaryRes.text());
          } else {
            const fallback = await fetch(
              "https://iptv-org.github.io/iptv/countries/de.m3u",
            ).catch(() => null);
            if (fallback && fallback.ok) texts.push(await fallback.text());
          }

          // Load global fallback playlists if we don't have verified streams
          const globalResponses = await Promise.all(
            GLOBAL_PLAYLISTS.map((u) => fetch(u).catch(() => null)),
          );
          for (const res of globalResponses) {
            if (res && res.ok) texts.push(await res.text());
          }
        }

        // Always load custom user feeds
        if (customFeeds.length > 0) {
          const customResponses = await Promise.all(
            customFeeds.map((u) => fetch(u).catch(() => null)),
          );
          for (const res of customResponses) {
            if (res && res.ok) texts.push(await res.text());
          }
        }

        if (texts.length === 0) {
          console.warn(
            "Failed to fetch playlists from remote. Loading local verified channels.",
          );
        }

        let allChannels: import("../types").Channel[] = [];
        texts.forEach((text) => {
          allChannels = [...allChannels, ...parseM3U(text)];
        });

        // Deduplicate channels by URL so we don't show the same stream twice
        const uniqueChannelsMap = new Map();
        allChannels.forEach((c) => {
          if (!uniqueChannelsMap.has(c.url)) {
            uniqueChannelsMap.set(c.url, c);
          }
        });

        // Add Verified Reliable Channels at the very end to ensure they aren't overridden and are always available
        VERIFIED_RELIABLE_CHANNELS.forEach((c) => {
          if (!uniqueChannelsMap.has(c.url)) {
            uniqueChannelsMap.set(c.url, c);
          }
        });

        if (uniqueChannelsMap.size === 0) {
          throw new Error("Failed to load any channels.");
        }

        setChannels(Array.from(uniqueChannelsMap.values()));
        setError(null);
      } catch (err) {
        console.error("Error fetching M3U:", err);
        setError("Failed to load channel list. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchM3U();
  }, [setChannels, setError, setIsLoading, customFeeds, channels.length]);
};
