const fs = require('fs');
let lines = fs.readFileSync('src/components/Dashboard.tsx', 'utf8').split('\n');

// 1. Move AdBanner from underneath </header> to inside the main content area (right below HeroBanner)
let adBannerLineIndex = -1;
let adBannerContent = '';
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<AdBanner />')) {
    adBannerLineIndex = i;
    adBannerContent = lines[i];
    break;
  }
}

if (adBannerLineIndex !== -1) {
  lines.splice(adBannerLineIndex, 1); // remove from old spot
  
  // Find where to insert it: Look for <HeroBanner />
  let heroBannerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<HeroBanner />')) {
      heroBannerIndex = i;
      break;
    }
  }
  
  if (heroBannerIndex !== -1) {
    // Insert AdBanner right after HeroBanner's closing div
    lines.splice(heroBannerIndex + 2, 0, adBannerContent);
  }
}

// 2. Replace Live TV Mode with Download App safely
let startIndex = -1;
let endIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title="Live TV Mode"')) {
    // The button starts a few lines up and ends a few lines down
    for (let j = i; j >= 0; j--) {
      if (lines[j].includes('<button')) {
        startIndex = j;
        break;
      }
    }
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('</button>')) {
        endIndex = j;
        break;
      }
    }
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
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
  
  lines.splice(startIndex, endIndex - startIndex + 1, downloadAppHTML);
}

fs.writeFileSync('src/components/Dashboard.tsx', lines.join('\n'));
