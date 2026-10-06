const fs = require('fs');
let h = fs.readFileSync('src/components/Homepage.tsx', 'utf8');

// The hero section has this button:
// <button onClick={promptInstall} className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 tv-focus">
//   <Download className="w-5 h-5" />
//   {t('homepage.installDesktopApp')}
// </button>

h = h.replace(
  /<button\s+onClick=\{promptInstall\}\s+className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 tv-focus">([\s\S]*?)<\/button>/,
  '<Link to="/download" className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-slate-600 tv-focus">$1</Link>'
);

fs.writeFileSync('src/components/Homepage.tsx', h);
