import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors");

admin.initializeApp();

const corsHandler = cors({ origin: true });

// Mock sports streams generator based on detected region
export const getRegionalSports = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    try {
      // In a real scenario, you would determine location via CF-IPCountry header
      // or a Geo-IP database based on the requester's IP.
      const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      
      // Mock logic: Simulate a region based on a query parameter for testing
      const userRegion = req.query.region || "Global";
      
      console.log(`Generating regional sports stream for: ${userRegion}, IP: ${clientIp}`);

      let m3uContent = "#EXTM3U\n";
      
      // Regional channels (Live Free Feeds)
      if (userRegion === "Europe") {
        m3uContent += `#EXTINF:-1 tvg-id="eu1" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/UEFA_Champions_League_logo_2.svg/200px-UEFA_Champions_League_logo_2.svg.png" group-title="Sports",DAZN Women's Football\n`;
        m3uContent += `https://daznwomensfootball.amagi.tv/playlist.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="eu2" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/200px-Premier_League_Logo.svg.png" group-title="Sports",DAZN Combat\n`;
        m3uContent += `https://dazncombat.amagi.tv/playlist.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="eu3" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Red_Bull_GmbH_logo.svg/200px-Red_Bull_GmbH_logo.svg.png" group-title="Sports",Red Bull TV Europe\n`;
        m3uContent += `https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8\n`;
      } else if (userRegion === "US") {
        m3uContent += `#EXTINF:-1 tvg-id="us1" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/200px-National_Football_League_logo.svg.png" group-title="Sports",CBS Sports HQ\n`;
        m3uContent += `https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="us2" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Major_League_Baseball_logo.svg/200px-Major_League_Baseball_logo.svg.png" group-title="Sports",Stadium\n`;
        m3uContent += `https://stadium.amagi.tv/playlist.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="us3" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/PGA_Tour_logo.svg/200px-PGA_Tour_logo.svg.png" group-title="Sports",PGA Tour\n`;
        m3uContent += `https://pgatour.amagi.tv/playlist.m3u8\n`;
      } else if (userRegion === "Asia") {
        m3uContent += `#EXTINF:-1 tvg-id="as1" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/ONE_Championship_logo.svg/200px-ONE_Championship_logo.svg.png" group-title="Sports",ONE Championship\n`;
        m3uContent += `https://onechampionship.amagi.tv/playlist.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="as2" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/UEFA_Champions_League_logo_2.svg/200px-UEFA_Champions_League_logo_2.svg.png" group-title="Sports",Fight Network\n`;
        m3uContent += `https://fightnetwork.amagi.tv/playlist.m3u8\n`;
      } else {
        // Global / Fallback Trending
        m3uContent += `#EXTINF:-1 tvg-id="g1" tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Olympic_rings_with_transparent_background.svg/200px-Olympic_rings_with_transparent_background.svg.png" group-title="Trending",World Poker Tour\n`;
        m3uContent += `https://wpt.amagi.tv/playlist.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="g2" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/FIFA_logo.svg/200px-FIFA_logo.svg.png" group-title="Trending",FIFA+\n`;
        m3uContent += `https://fifa.amagi.tv/playlist.m3u8\n`;
        m3uContent += `#EXTINF:-1 tvg-id="g3" tvg-logo="https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/FIFA_logo.svg/200px-FIFA_logo.svg.png" group-title="Trending",BeIN Sports Xtra\n`;
        m3uContent += `https://beinsportsxtra.amagi.tv/playlist.m3u8\n`;
      }

      // Return the generated M3U file
      res.setHeader('Content-Type', 'audio/x-mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*'); // explicitly for good measure
      res.status(200).send(m3uContent);
      
    } catch (error) {
      console.error("Error generating regional playlist:", error);
      res.status(500).send("Error generating playlist");
    }
  });
});

export * from "./stripe";
