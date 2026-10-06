import i18n from 'i18next';
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
