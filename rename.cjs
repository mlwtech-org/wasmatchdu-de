const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{tsx,ts,html}', { nodir: true });
files.push('index.html');
files.push('vite.config.ts');
files.push('capacitor.config.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/WasMatchDu/g, 'JanataTv');
  content = content.replace(/WasMatch<span className="text-cyan-400 font-light">Du<\/span>/g, 'Janata<span className="text-cyan-400 font-light">Tv</span>');
  content = content.replace(/wasmatchdu\.de/g, 'janatatv.in'); // just in case
  
  // Specific to SubscribeOverlay
  content = content.replace(/Subscribe for \$9\.99\/mo/g, 'Subscribe for ₹99/mo');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
