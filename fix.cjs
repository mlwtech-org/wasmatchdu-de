const fs = require('fs');
let c = fs.readFileSync('src/lib/constants.ts', 'utf8');
c = c.replace(/    region: "India",\r?\n/g, '');
fs.writeFileSync('src/lib/constants.ts', c);
