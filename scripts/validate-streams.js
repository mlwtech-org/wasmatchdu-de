const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const SOURCES = [
  'https://iptv-org.github.io/iptv/countries/de.m3u',
  // You can add more regional or global playlists here
];
const OUTPUT_DIR = path.join(__dirname, '../public/verified');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'verified_streams.m3u');
const TIMEOUT_MS = 5000; // 5 seconds max per stream
const CONCURRENCY = 20; // Check 20 streams at a time

// Helper to check if a URL is reachable
function checkStream(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: TIMEOUT_MS }, (res) => {
      // 200 OK or 3xx Redirects are usually good signs
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve(true);
      } else {
        resolve(false);
      }
      res.destroy(); // Abort downloading the actual video stream
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function validateStreams() {
  console.log('Starting stream validation...');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let allVerifiedLines = ['#EXTM3U'];
  let totalChecked = 0;
  let totalWorking = 0;

  for (const source of SOURCES) {
    console.log(`\nFetching source: ${source}`);
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      
      const lines = text.split('\n');
      const channels = [];
      
      let currentMetadata = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF')) {
          currentMetadata = line;
        } else if (line && !line.startsWith('#')) {
          if (currentMetadata) {
            channels.push({ metadata: currentMetadata, url: line });
            currentMetadata = '';
          }
        }
      }

      console.log(`Found ${channels.length} channels in source. Validating...`);

      // Process in chunks to limit concurrency
      for (let i = 0; i < channels.length; i += CONCURRENCY) {
        const chunk = channels.slice(i, i + CONCURRENCY);
        const results = await Promise.all(
          chunk.map(async (c) => {
            const isWorking = await checkStream(c.url);
            return { ...c, isWorking };
          })
        );

        for (const res of results) {
          totalChecked++;
          if (res.isWorking) {
            totalWorking++;
            allVerifiedLines.push(res.metadata);
            allVerifiedLines.push(res.url);
          }
        }
        
        process.stdout.write(`\rProgress: ${totalChecked}/${channels.length} (Working: ${totalWorking})`);
      }
      console.log(); // Newline after progress
    } catch (err) {
      console.error(`Failed to process ${source}:`, err);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, allVerifiedLines.join('\n'));
  console.log(`\nValidation complete!`);
  console.log(`Total streams checked: ${totalChecked}`);
  console.log(`Total working streams: ${totalWorking}`);
  console.log(`Output saved to: ${OUTPUT_FILE}`);
}

validateStreams().catch(console.error);
