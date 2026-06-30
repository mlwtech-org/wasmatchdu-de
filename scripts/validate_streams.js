import fs from 'fs';
import https from 'https';
import http from 'http';

// This script is designed to be run periodically via GitHub Actions.
// It fetches a public IPTV list and tests the streams to see if they are active and support CORS.
// Channels that pass are saved to a verified list.

const PUBLIC_CHANNELS_URL = "https://iptv-org.github.io/api/channels.json";
const PUBLIC_STREAMS_URL = "https://iptv-org.github.io/api/streams.json";
const TIMEOUT_MS = 3000;

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function checkStream(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const req = client.request(url, { method: 'GET', timeout: TIMEOUT_MS }, (res) => {
      // Check if it's successful and has CORS headers
      const cors = res.headers['access-control-allow-origin'];
      req.destroy(); // Abort the request so we don't download the stream
      if (res.statusCode >= 200 && res.statusCode < 400 && cors) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function validateStreams() {
  console.log("Fetching public channels...");
  const channels = await fetchJSON(PUBLIC_CHANNELS_URL);

  console.log("Fetching public streams...");
  const streams = await fetchJSON(PUBLIC_STREAMS_URL);

  console.log(`Found ${channels.length} channels and ${streams.length} streams.`);

  // Combine and map
  const activeStreams = streams.filter((s) => s.url && s.channel);
  
  // For a real production app, checking 10,000 streams takes time.
  // We'll process in batches.
  const verified = [];
  const MAX_TO_CHECK = 100; // Limits the check for demonstration purposes
  
  console.log(`Testing first ${MAX_TO_CHECK} streams for CORS and availability...`);

  let checked = 0;
  for (const stream of activeStreams) {
    if (checked >= MAX_TO_CHECK) break;
    
    // Find associated channel
    const channel = channels.find(c => c.id === stream.channel);
    if (!channel) continue;

    checked++;
    const isValid = await checkStream(stream.url);
    if (isValid) {
      verified.push({
        id: channel.id,
        name: channel.name,
        logo: channel.logo,
        url: stream.url,
        group: channel.categories?.[0] || 'Uncategorized',
        isRegional: false
      });
      console.log(`✅ Valid: ${channel.name}`);
    } else {
      console.log(`❌ Invalid/No-CORS: ${channel.name}`);
    }
  }

  console.log(`\nValidation complete. Found ${verified.length} working streams.`);
  
  // Write to output file
  fs.writeFileSync('./verified_streams.json', JSON.stringify(verified, null, 2));
  console.log("Saved to verified_streams.json. You can use this for your Paid Tier!");
}

validateStreams().catch(console.error);
