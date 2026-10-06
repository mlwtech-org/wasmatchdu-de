const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.main = 'electron/main.js';
p.scripts['electron:dev'] = 'concurrently "vite" "electron ."';
p.scripts['electron:build'] = 'vite build && electron-builder';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
