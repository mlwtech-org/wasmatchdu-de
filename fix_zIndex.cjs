const fs = require('fs');

// 1. Dashboard
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
d = d.replace(
  'className="w-full max-w-[1600px] mx-auto pt-24 px-4 z-[90] relative"',
  'className="w-full max-w-[1600px] mx-auto mt-20 px-4 relative z-10"'
);
fs.writeFileSync('src/components/Dashboard.tsx', d);

// 2. HeroBanner
let h = fs.readFileSync('src/components/HeroBanner.tsx', 'utf8');

// Add import if not present
if (!h.includes('useTranslation')) {
  h = h.replace(
    'import { Play, PlayCircle, Loader2, Volume2, VolumeX, Maximize, Radio, Plus, Check } from "lucide-react";',
    'import { Play, PlayCircle, Loader2, Volume2, VolumeX, Maximize, Radio, Plus, Check } from "lucide-react";\nimport { useTranslation } from "react-i18next";'
  );
  
  // Add hook
  h = h.replace(
    'const [isVideoPlaying, setIsVideoPlaying] = useState(false);',
    'const [isVideoPlaying, setIsVideoPlaying] = useState(false);\n  const { t } = useTranslation();'
  );
  
  // Replace {headline}
  h = h.replace(/{headline}/g, '{t(`categories.${headline}`, { defaultValue: headline })}');
}

fs.writeFileSync('src/components/HeroBanner.tsx', h);
