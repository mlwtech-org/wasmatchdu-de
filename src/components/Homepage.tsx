import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Users, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download } from "lucide-react";

export const Homepage: React.FC = () => {
  const { t } = useTranslation();
  const { isInstallable, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-blue-500/40 blur-lg rounded-full"></div>
            <img
              src="/icon.png"
              alt="WasMatchDu Logo"
              className="relative z-10 w-full h-full object-cover rounded-lg shadow-lg ring-1 ring-white/10"
            />
          </div>
          <span>{t("app.title")}</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            {t("homepage.features")}
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            {t("homepage.mission")}
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-full font-bold transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Install App
            </button>
          )}
          <Link
            to="/login"
            className="font-bold hover:text-blue-400 transition-colors"
          >
            {t("homepage.login")}
          </Link>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            {t("homepage.signup")}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40 mix-blend-screen">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {t("homepage.nowAvailable")}
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            {t("homepage.heroTitle")}
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t("homepage.heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white text-slate-950 px-8 py-4 rounded-full font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10"
            >
              {t("homepage.startWatching")} <PlayCircle className="w-6 h-6" />
            </Link>
            {isInstallable && (
              <button
                onClick={promptInstall}
                className="w-full sm:w-auto bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-full font-black text-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                <Download className="w-6 h-6" /> Install Desktop App
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section
        id="features"
        className="container mx-auto px-6 py-24 border-t border-slate-800/50"
      >
        <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
          {t("homepage.designedForEveryone")}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <ShieldCheck className="w-12 h-12 text-green-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              {t("homepage.seniorSafeTitle")}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {t("homepage.seniorSafeDesc")}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <Heart className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              {t("homepage.kidsModeTitle")}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {t("homepage.kidsModeDesc")}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <Users className="w-12 h-12 text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              {t("homepage.localRegionalTitle")}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {t("homepage.localRegionalDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 text-center text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="relative w-6 h-6 grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="/icon.png"
              alt="WasMatchDu Logo"
              className="relative z-10 w-full h-full object-cover rounded-md shadow-md"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-300">
            {t("app.title")}
          </span>
        </div>
        <p>© 2026 Wasmatch-du Open Source Project. All rights reserved.</p>
      </footer>
    </div>
  );
};
