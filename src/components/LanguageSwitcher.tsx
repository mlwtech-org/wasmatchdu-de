import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '../utils/cn';
import { usePlayerStore } from '../store/usePlayerStore';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'ur', label: 'Urdu (اردو)' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const accessibilityMode = usePlayerStore(state => state.accessibilityMode);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative group inline-block">
      <button 
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full font-bold transition-all border border-slate-700/50 hover:bg-slate-800 bg-slate-900/80 backdrop-blur-sm tv-focus",
          accessibilityMode ? "px-6 py-3 text-lg" : "px-4 py-2 text-sm"
        )}
        title="Change Language"
      >
        <Globe className={accessibilityMode ? "w-8 h-8" : "w-5 h-5"} />
        <span className="hidden sm:inline uppercase">{i18n.language?.substring(0, 2) || 'en'}</span>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[40]" onClick={() => setIsOpen(false)} />
      )}
      <div className={cn(
        "absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl transition-all duration-200 z-50 overflow-hidden",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            tabIndex={0}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              "w-full text-left px-4 transition-colors hover:bg-slate-800 flex items-center justify-between tv-focus outline-none",
              accessibilityMode ? "py-4 text-xl" : "py-3 text-sm",
              i18n.language?.startsWith(lang.code) ? "font-black text-blue-500 bg-blue-500/10" : "font-medium text-foreground"
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};
