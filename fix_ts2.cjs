const fs = require('fs');
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

c = c.replace(/Search, Mic,/g, '');
c = c.replace(/Menu,/g, '');

fs.writeFileSync('src/components/Dashboard.tsx', c);
