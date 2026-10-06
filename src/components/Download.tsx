import { Download as DownloadIcon, Smartphone, Monitor, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Download = () => {
  const { isInstallable, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow">
            <Monitor className="w-6 h-6 text-white absolute" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Janata<span className="text-blue-500">Tv</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-20 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Download JanataTv
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Take your entertainment anywhere. JanataTv is available across all your favorite devices. Choose your platform below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Windows EXE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500/50 transition-colors group">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Monitor className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Windows</h3>
            <p className="text-slate-400 mb-8 text-sm">Download the native desktop application (.exe) for Windows 10/11.</p>
            <a 
              href="/JanataTv-Setup.exe" 
              download
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
              Download .exe
            </a>
          </div>

          {/* Android APK */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center hover:border-emerald-500/50 transition-colors group">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Android</h3>
            <p className="text-slate-400 mb-8 text-sm">Download the raw package file (.apk) to sideload on Android devices.</p>
            <a 
              href="/JanataTv.apk" 
              download
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
              Download .apk
            </a>
          </div>

          {/* Web / PWA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center hover:border-purple-500/50 transition-colors group relative overflow-hidden">
            {isInstallable && (
              <div className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </div>
            )}
            <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Web App</h3>
            <p className="text-slate-400 mb-8 text-sm">Install directly through your browser without downloading any files.</p>
            <button 
              onClick={promptInstall}
              disabled={!isInstallable}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
              {isInstallable ? 'Install Now' : 'Not Supported Here'}
            </button>
          </div>
        </div>

        <div className="mt-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-2 text-slate-300">Developer Note on App Updates:</h4>
          <p className="text-slate-400 text-sm">
            To ensure these .exe and .apk files stay up-to-date automatically, the best approach is to configure a <strong>GitHub Actions CI/CD pipeline</strong>. 
            GitHub Actions provides cloud-based build servers with pre-installed Android SDKs (Java 17) and Windows C++ build tools, which bypasses local machine environment limitations. 
            Currently, these download buttons provide placeholder files until the automated cloud build pipeline is activated.
          </p>
        </div>
      </main>
    </div>
  );
};
