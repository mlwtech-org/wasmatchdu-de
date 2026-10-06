const fs = require('fs');
let f = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
f = f.replace(/import \{ SubscribeOverlay \} from ['"].\/SubscribeOverlay['"];?\s*/, '');
fs.writeFileSync('src/components/Dashboard.tsx', f);
