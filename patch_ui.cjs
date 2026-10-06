const fs = require('fs');

// 1. Patch Dashboard.tsx
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!d.includes('Smartphone')) {
  d = d.replace(/MonitorPlay,/, 'MonitorPlay, Download, Smartphone, Monitor,');
}

const liveTvBtnRegex = /<button[\s\S]*?title="Live TV Mode"[\s\S]*?<\/button>/;
const downloadAppHTML = `
            {/* Download App Dropdown */}
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

if (d.match(liveTvBtnRegex)) {
  d = d.replace(liveTvBtnRegex, downloadAppHTML);
  fs.writeFileSync('src/components/Dashboard.tsx', d);
}

// 2. Patch LanguageSwitcher.tsx
let ls = fs.readFileSync('src/components/LanguageSwitcher.tsx', 'utf8');
const newLangArray = `const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'ur', label: 'Urdu (اردو)' }
];`;

ls = ls.replace(/const LANGUAGES = \[[\s\S]*?\];/, newLangArray);
fs.writeFileSync('src/components/LanguageSwitcher.tsx', ls);
