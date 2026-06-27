import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const JOBS = [
  {
    name: 'Live TV (DE)',
    sources: ['https://iptv-org.github.io/iptv/countries/de.m3u'],
    outputFile: path.join(__dirname, '../public/verified/verified_streams.m3u')
  },
  {
    name: 'Radio (DE)',
    sources: ['https://iptv-org.github.io/iptv/categories/radio.m3u'],
    outputFile: path.join(__dirname, '../public/verified/verified_radio.m3u')
  }
];

const TIMEOUT_MS = 5000; // 5 seconds max per stream
const CONCURRENCY = 20; // Check 20 streams at a time

// Helper to check if a URL is reachable and supports CORS
async function checkStream(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    // We send a fetch request with Origin header to test CORS
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Origin': 'https://wasmatch-du.web.app'
      },
      signal: controller.signal
    });
    
    const isOk = response.ok;
    const cors = response.headers.get('access-control-allow-origin');
    
    // Abort body download immediately to save bandwidth
    controller.abort();
    clearTimeout(timeoutId);
    
    if (isOk && (cors === '*' || cors === 'https://wasmatch-du.web.app')) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function validateStreams() {
  console.log('Starting stream validation...');
  
  const OUTPUT_DIR = path.join(__dirname, '../public/verified');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const job of JOBS) {
    console.log(`\n=== Starting Job: ${job.name} ===`);
    let allVerifiedLines = ['#EXTM3U'];
    let totalChecked = 0;
    let totalWorking = 0;

    for (const source of job.sources) {
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

    fs.writeFileSync(job.outputFile, allVerifiedLines.join('\n'));
    console.log(`\nJob ${job.name} complete!`);
    console.log(`Total streams checked: ${totalChecked}`);
    console.log(`Total working streams: ${totalWorking}`);
    console.log(`Output saved to: ${job.outputFile}`);
  }
}

validateStreams().catch(console.error);
