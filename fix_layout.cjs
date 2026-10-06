const fs = require('fs');
const path = require('path');

// 1. Fix Dashboard Layout
let d = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Remove AdBanner from current bad spot
const badAdHTML = '<div className="px-6 lg:px-8 max-w-7xl mx-auto"><AdBanner /></div>';
if (d.includes(badAdHTML)) {
  d = d.replace(badAdHTML, '');
}

// Find HeroBanner
const heroBannerTarget = `{/* Premium Hero Banner */}
          <div className="relative w-full z-40 bg-black mt-16 max-w-[1600px] mx-auto shadow-2xl">
            <HeroBanner />
          </div>`;

const newAdBannerTarget = `{/* Top Ad Banner */}
          <div className="w-full max-w-[1600px] mx-auto pt-20 px-4 z-[90] relative">
            <AdBanner />
          </div>

          {/* Premium Hero Banner */}
          <div className="relative w-full z-40 bg-black mt-4 max-w-[1600px] mx-auto shadow-2xl">
            <HeroBanner />
          </div>`;

d = d.replace(heroBannerTarget, newAdBannerTarget);
fs.writeFileSync('src/components/Dashboard.tsx', d);


// 2. Fix i18n
const langs = ['bn', 'te', 'ta', 'mr', 'ml', 'kn', 'gu', 'ur'];

langs.forEach(l => {
  if (!fs.existsSync(`src/locales/${l}.ts`)) {
    let en = fs.readFileSync('src/locales/en.ts', 'utf8');
    en = en.replace('export const en =', `export const ${l} =`);
    fs.writeFileSync(`src/locales/${l}.ts`, en);
  }
});

// Rewrite i18n.ts
const i18nContent = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from '../locales/en';
import { de } from '../locales/de';
import { es } from '../locales/es';
import { fr } from '../locales/fr';
import { hi } from '../locales/hi';
import { bn } from '../locales/bn';
import { te } from '../locales/te';
import { ta } from '../locales/ta';
import { mr } from '../locales/mr';
import { ml } from '../locales/ml';
import { kn } from '../locales/kn';
import { gu } from '../locales/gu';
import { ur } from '../locales/ur';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en, de, es, fr, hi, bn, te, ta, mr, ml, kn, gu, ur
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
  });

export default i18n;
`;

fs.writeFileSync('src/lib/i18n.ts', i18nContent);
