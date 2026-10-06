const fs = require('fs');
let c = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

c = c.replace(/MonitorPlay, Download, Smartphone, Monitor,/g, 'MonitorPlay, Smartphone, Monitor,');

fs.writeFileSync('src/components/Dashboard.tsx', c);
