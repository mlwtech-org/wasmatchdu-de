import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Users, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { FALLBACK_CHANNELS } from "../lib/constants";

export const Homepage: React.FC = () => {
  const { t } = useTranslation();
  const { isInstallable, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white">
          <img
            src="/logo.png"
            alt="WMD Streams Logo"
            className="h-8 w-auto drop-shadow-[0_0_15px_rgba(255,20,147,0.8)]"
          />
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

      {/* Live Channels Marquee Preview */}
      <section className="relative -mt-20 z-20 pb-20 overflow-hidden">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="flex w-[200%] animate-marquee">
          {/* Double the array for seamless infinite scrolling */}
          {[...FALLBACK_CHANNELS, ...FALLBACK_CHANNELS].map((channel, i) => (
            <div key={i} className="flex-none w-72 mx-3 group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-transform hover:scale-105 hover:z-30">
              <div className="aspect-video relative bg-black">
                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  LIVE
                </div>
              </div>
              <div className="p-4 absolute bottom-0 left-0 w-full">
                <h4 className="font-bold text-white truncate">{channel.name}</h4>
                <p className="text-xs text-slate-400 truncate">{channel.currentProgram}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Watch Anywhere - Device Ecosystem */}
      <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Watch Anywhere</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">One seamless experience across all your screens. Pick up right where you left off.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            {/* Devices Mockup Visual */}
            <div className="relative w-full max-w-2xl">
              <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              
              {/* Fake UI Image representing Dashboard */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl shadow-blue-900/50">
                <div className="bg-slate-800 h-6 w-full flex items-center px-4 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <img src="/mockup-ui.png" alt="Platform UI Mockup" className="w-full h-auto" />
              </div>
            </div>
            
            <div className="space-y-8 flex-1 max-w-md">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 flex-shrink-0">
                  <Monitor className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Smart TVs</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Built with a 10-foot spatial navigation system. Full remote control support.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 flex-shrink-0">
                  <Tablet className="text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Tablets</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Touch-optimized grids and PiP (Picture in Picture) for true multitasking.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 flex-shrink-0">
                  <Smartphone className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Mobile Native</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Install as a PWA directly to your home screen for an app-like experience without the App Store.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Our Mission Section */}
      <section id="about" className="container mx-auto px-6 py-24 border-t border-slate-800/50 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Our Mission: Best-In-Class Community Service
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-12 font-light">
            We believe that free, open access to high-quality information and entertainment is a fundamental digital right. Our platform is built on the principle of <span className="font-bold text-white">democratizing broadcasting</span>.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Verified & Safe</h3>
              <p className="text-slate-400 leading-relaxed">
                We combat broken links and misinformation by aggressively curating and validating public streams. Our built-in Kids Mode and Senior-Safe UI ensure a secure environment for every generation.
              </p>
            </div>
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Global & Regional</h3>
              <p className="text-slate-400 leading-relaxed">
                From local news broadcasts to the NASA ISS live feed, we bridge the gap between global events and your local community without hidden fees, subscriptions, or invasive tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 text-center text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img
            src="/logo.png"
            alt="WMD Streams Logo"
            className="h-6 w-auto drop-shadow-[0_0_15px_rgba(255,20,147,0.8)] grayscale hover:grayscale-0 transition-all duration-300"
          />
        </div>
        <p>© 2026 Wasmatch-du Open Source Project. All rights reserved.</p>
      </footer>
    </div>
  );
};
