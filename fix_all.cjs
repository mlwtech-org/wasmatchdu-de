const fs = require('fs');

// Fix Header z-index in Homepage.tsx
let h = fs.readFileSync('src/components/Homepage.tsx', 'utf8');
h = h.replace('header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10"', 'header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-50"');
fs.writeFileSync('src/components/Homepage.tsx', h);

// Generate missing translations
const en = {
    features: "Features",
    mission: "Our Mission",
    login: "Log In",
    signup: "Sign Up Free",
    installApp: "Install App",
    nowAvailable: "Now Available Globally",
    heroTitle: "Free Live TV for Everyone.",
    heroSubtitle: "Experience high-quality regional and international television channels on any device. No subscriptions, no hidden fees.",
    startWatching: "Start Watching Now",
    installDesktopApp: "Install Desktop App",
    designedForEveryone: "Designed for Everyone.",
    seniorSafeTitle: "Senior Safe Mode",
    seniorSafeDesc: "We prioritize accessibility.",
    kidsModeTitle: "Kids Mode",
    kidsModeDesc: "Instantly lock the platform.",
    localRegionalTitle: "Local & Regional",
    localRegionalDesc: "Stay connected to your roots.",
    missionTitle: "Our Mission",
    missionDesc: "Democratizing broadcasting.",
    verifiedSafeTitle: "Verified & Safe",
    verifiedSafeDesc: "We combat broken links.",
    globalRegionalTitle: "Global & Regional",
    globalRegionalDesc: "From local news to global events."
};

const translations = {
  'bn': { ...en, heroTitle: "সবার জন্য বিনামূল্যে লাইভ টিভি।" },
  'ta': { ...en, heroTitle: "அனைவருக்கும் இலவச நேரலை டிவி." },
  'mr': { ...en, heroTitle: "सर्वांसाठी मोफत लाईव्ह टीव्ही." },
  'ml': { ...en, heroTitle: "എല്ലാവർക്കും സൗജന്യ ലൈവ് ടിവി." },
  'kn': { ...en, heroTitle: "ಎಲ್ಲರಿಗೂ ಉಚಿತ ಲೈವ್ ಟಿವಿ." },
  'gu': { ...en, heroTitle: "બધા માટે મફત લાઇવ ટીવી." },
  'ur': { ...en, heroTitle: "سب کے لیے مفت لائیو ٹی وی۔" }
};

for (const [lang, trans] of Object.entries(translations)) {
  const p = `src/locales/${lang}.ts`;
  if(fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    if(!c.includes('homepage: {')) {
      const j = JSON.stringify(trans, null, 4).replace(/^/gm, '      ').trim();
      c = c.replace('translation: {', `translation: {\n    homepage: ${j},`);
      fs.writeFileSync(p, c);
    } else {
      // replace if exists
      const j = JSON.stringify(trans, null, 4).replace(/^/gm, '      ').trim();
      c = c.replace(/homepage:\s*{[\s\S]*?},/, `homepage: ${j},`);
      fs.writeFileSync(p, c);
    }
  }
}
