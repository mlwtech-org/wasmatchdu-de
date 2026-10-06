const fs = require('fs');

let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Fix lucide imports
d = d.replace(/MonitorPlay, Download, Smartphone, Monitor,/g, 'MonitorPlay, Smartphone, Monitor,');

// Import AdBanner right before SubscribeOverlay or around it
if (!d.includes('import { AdBanner }')) {
  // Try to find a good spot, e.g. after LanguageSwitcher
  d = d.replace(
    'import { LanguageSwitcher } from "./LanguageSwitcher";',
    'import { LanguageSwitcher } from "./LanguageSwitcher";\nimport { AdBanner } from "./AdBanner";\nimport { SubscribeOverlay } from "./SubscribeOverlay";'
  );
}

fs.writeFileSync('src/components/Dashboard.tsx', d);
