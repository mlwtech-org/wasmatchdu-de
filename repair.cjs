const fs = require('fs');

let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Add Lucide imports
if (!d.includes('Smartphone')) {
  d = d.replace(/MonitorPlay,/, 'MonitorPlay, Download, Smartphone, Monitor,');
}

// 2. Add AdBanner import
if (!d.includes('import { AdBanner }')) {
  d = d.replace(
    'import { SubscribeOverlay } from "./SubscribeOverlay";',
    'import { SubscribeOverlay } from "./SubscribeOverlay";\nimport { AdBanner } from "./AdBanner";'
  );
}

// 3. Replace the EXACT Live TV Mode button HTML
const liveTvHTML = `            <button
              data-focusable="true"
              onClick={() => {
                const liveChannel =
                  liveEventsChannels[0] || channels[0] || FALLBACK_CHANNELS[0];
                if (liveChannel) {
                  navigate(\`/live/\${liveChannel.id}\`);
                }
              }}
              className="hidden sm:flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-3 py-1.5 md:px-4 rounded-full font-bold transition-all text-sm border border-blue-500/20 whitespace-nowrap shrink-0"
              title="Live TV Mode"
            >
              <MonitorPlay className="w-4 h-4" />
              <span className="hidden md:inline">Live TV Mode</span>
            </button>`;

const downloadAppHTML = `            {/* Download App Dropdown */}
            <div className="relative group inline-block">
              <button
                data-focusable="true"
                className="hidden sm:flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-3 py-1.5 md:px-4 rounded-full font-bold transition-all text-sm border border-emerald-500/20 whitespace-nowrap shrink-0"
                title="Download App"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Download App</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <a href="/JanataTv-Setup.exe" className="w-full text-left px-4 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-800 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Windows (.exe)
                </a>
                <a href="/JanataTv.apk" className="w-full text-left px-4 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-slate-800 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Android (.apk)
                </a>
              </div>
            </div>`;

if (d.includes('title="Live TV Mode"')) {
  d = d.replace(liveTvHTML, downloadAppHTML);
}

// 4. Inject AdBanner and hidden trigger
if (!d.includes('id="trigger-pro-upgrade"')) {
  d = d.replace(
    '</header>',
    `</header>\n\n        {/* Hidden trigger for AdBanner to open Stripe Checkout */}\n        <button id="trigger-pro-upgrade" onClick={handleUpgradeClick} className="hidden"></button>\n\n        {/* Top Ad Banner */}\n        <div className="px-6 lg:px-8 max-w-7xl mx-auto"><AdBanner /></div>`
  );
}

fs.writeFileSync('src/components/Dashboard.tsx', d);
