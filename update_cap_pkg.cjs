const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.scripts['cap:sync'] = 'vite build && cap sync';
p.scripts['cap:android'] = 'cap open android';
p.scripts['cap:ios'] = 'cap open ios';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
