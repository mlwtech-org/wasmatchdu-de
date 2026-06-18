import React, { useEffect, useMemo, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { parseM3U } from '../utils/m3uParser';
import { VideoPlayer } from './VideoPlayer';
import { Tv, PlayCircle, Menu, LogOut, Search, MapPin, Heart, Info, ShieldCheck, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

const cn = (...inputs: (string | undefined | null | false)[]) => {
  return twMerge(clsx(inputs));
}

const DEFAULT_M3U_URL = 'https://iptv-org.github.io/iptv/countries/de.m3u';

const GEMEINWOHL_CATEGORIES = [
  'All',
  'Wissen & Kultur',
  'Kinder & Familie',
  'Lokal & Regional',
  'Nachrichten & Gesellschaft',
  'Gemeinsame Unterhaltung'
];

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const {
    channels,
    currentChannel,
    searchQuery,
    selectedGroup,
    showOnlyRegional,
    showOnlyFavorites,
    favorites,
    isTheaterMode,
    accessibilityMode,
    kidsMode,
    isLoading,
    error,
    setChannels,
    setCurrentChannel,
    setSearchQuery,
    setSelectedGroup,
    setShowOnlyRegional,
    setShowOnlyFavorites,
    toggleFavorite,
    setAccessibilityMode,
    setKidsMode,
    setIsLoading,
    setError,
    setUser,
  } = usePlayerStore();

  const handleLogout = () => setUser(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchM3U = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(DEFAULT_M3U_URL);
        if (!response.ok) throw new Error('Failed to fetch playlist');
        const text = await response.text();
        const parsedChannels = parseM3U(text);
        setChannels(parsedChannels);
      } catch (err) {
        setError('Error loading M3U playlist. Please check your network connection.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchM3U();
  }, [setChannels, setError, setIsLoading]);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      if (kidsMode && channel.gemeinwohlCategory !== 'Kinder & Familie') return false;

      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === 'All' || channel.gemeinwohlCategory === selectedGroup;
      const matchesRegional = showOnlyRegional ? channel.isRegional : true;
      const matchesFavorite = showOnlyFavorites ? favorites.includes(channel.id) : true;
      
      return matchesSearch && matchesGroup && matchesRegional && matchesFavorite;
    });
  }, [channels, searchQuery, selectedGroup, showOnlyRegional, showOnlyFavorites, favorites, kidsMode]);

  const baseText = accessibilityMode ? "text-lg" : "text-sm";
  const iconSize = accessibilityMode ? "w-8 h-8" : "w-5 h-5";
  const logoSize = kidsMode ? "w-16 h-16" : (accessibilityMode ? "w-14 h-14" : "w-10 h-10");

  return (
    <div className={cn(
      "flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300",
      kidsMode && "bg-blue-950 text-blue-50"
    )}>
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={cn("absolute top-4 left-4 z-50 bg-card rounded-md border border-border text-primary shadow-lg hover:bg-primary/10 transition-colors", accessibilityMode ? "p-4" : "p-2")}
        >
          <Menu className={iconSize} />
        </button>
      )}

      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 lg:w-96 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative flex flex-col shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isTheaterMode && "lg:absolute",
          kidsMode && "bg-blue-900 border-blue-800"
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Tv className="w-6 h-6" />
            <span>Das Gemeinwohl TV</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-400 hover:text-primary transition-colors">
            <X className={iconSize} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 border-b border-border">
          {!kidsMode && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('dashboard.searchChannels')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium tv-focus",
                  accessibilityMode ? "h-16 text-xl" : "h-12"
                )}
              />
            </div>
          )}

          {!kidsMode && (
            <div className="relative">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={cn(
                  "w-full bg-slate-900 border border-slate-800 rounded-xl px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium appearance-none tv-focus cursor-pointer",
                  accessibilityMode ? "h-16 text-xl" : "h-12"
                )}
              >
                {GEMEINWOHL_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
          
          {!kidsMode && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button
                tabIndex={0}
                onClick={() => setShowOnlyRegional(!showOnlyRegional)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border tv-focus cursor-pointer",
                  showOnlyRegional 
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/50" 
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                )}
              >
                <MapPin className="w-4 h-4" />
                {t('dashboard.regionalOnly')}
              </button>
              <button
                tabIndex={0}
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border tv-focus cursor-pointer",
                  showOnlyFavorites 
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50" 
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                )}
              >
                <Heart className="w-4 h-4" />
                {t('dashboard.favoritesOnly')}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : error ? (
            <div className={cn("text-center p-8 text-red-500 font-medium", baseText)}>{error}</div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t('dashboard.noChannelsFound')}</p>
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isFav = favorites.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-foreground/5 group",
                    currentChannel?.id === channel.id ? "bg-primary/20 border border-primary/40 shadow-inner" : "border border-transparent"
                  )}
                >
                  {!kidsMode && (
                    <button 
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(channel.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                          toggleFavorite(channel.id);
                        }
                      }}
                      className="p-2 rounded-full hover:bg-slate-800 transition-colors tv-focus"
                    >
                      <Heart className={cn("w-5 h-5 transition-colors", isFav ? "fill-red-500 text-red-500" : "text-slate-500")} />
                    </button>
                  )}
                  <div 
                    tabIndex={0}
                    className="flex-1 flex items-center gap-4 min-w-0 cursor-pointer tv-focus rounded-xl p-1"
                    onClick={() => setCurrentChannel(channel)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setCurrentChannel(channel);
                    }}
                  >
                    <div className={cn("rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm p-1", logoSize)}>
                      {channel.logo ? (
                        <img src={channel.logo} alt={channel.name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                      ) : (
                        <Tv className="w-8 h-8 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-bold text-white truncate", accessibilityMode || kidsMode ? "text-xl" : "text-base")}>{channel.name}</div>
                      {!kidsMode && <div className={cn("opacity-70 truncate font-medium", baseText)}>{channel.gemeinwohlCategory}</div>}
                    </div>
                    {currentChannel?.id === channel.id && (
                      <PlayCircle className="w-8 h-8 text-primary shrink-0 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={cn(
        "flex-1 flex flex-col relative transition-all duration-300",
        isTheaterMode ? "w-full absolute inset-0 z-30 bg-background" : ""
      )}>
        {!isTheaterMode && (
          <header className="p-6 flex justify-between items-center border-b border-slate-800">
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
              <Tv className="text-blue-500" />
              <span className="hidden sm:inline">{t('dashboard.defaultTitle')}</span>
            </h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="hidden lg:flex items-center gap-4 bg-slate-900 rounded-full p-1 border border-slate-800">
                <button
                  tabIndex={0}
                  onClick={() => setAccessibilityMode(!accessibilityMode)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all text-sm tv-focus",
                    accessibilityMode ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t('dashboard.seniorSafe')}
                </button>
                <button
                  tabIndex={0}
                  onClick={() => setKidsMode(!kidsMode)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all text-sm tv-focus",
                    kidsMode ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Heart className="w-4 h-4" />
                  {t('dashboard.kidsMode')}
                </button>
              </div>
              <button 
                tabIndex={0}
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-3 py-2 font-bold text-sm tv-focus"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t('dashboard.signOut')}</span>
              </button>
            </div>
          </header>
        )}
          
        <main className="flex-1 flex flex-col">
          <VideoPlayer />
            
          {currentChannel ? (
            <div className={cn("p-6 sm:p-8 bg-slate-900", isTheaterMode && "hidden")}>
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-3">
                    {currentChannel.name}
                    {currentChannel.isRegional && (
                      <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold border border-purple-500/30 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {t('dashboard.regionalBroadcast')}
                      </span>
                    )}
                  </h2>
                  <p className="text-slate-400 text-lg font-medium flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    {t('dashboard.liveBroadcasting')}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 text-slate-400 mb-2 font-bold">
                    <Info className="w-5 h-5 text-blue-500" />
                    {t('dashboard.streamDetails')}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {t('dashboard.youAreWatching')} <strong className="text-white">{currentChannel.name}</strong>. {t('dashboard.providedForCommonGood')}
                  </p>
                </div>
                
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 text-slate-400 mb-4 font-bold">
                    <Tv className="w-5 h-5 text-blue-500" />
                    {t('dashboard.programGuide')}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                      <span className="text-slate-400 font-medium">{t('dashboard.category')}</span>
                      <span className="text-white font-bold px-3 py-1 bg-slate-800 rounded-lg">{currentChannel.gemeinwohlCategory}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium">{t('dashboard.community')}</span>
                      <span className="text-blue-400 font-bold">{currentChannel.isRegional ? 'Lokal' : 'National'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800 m-6">
              <Tv className="w-24 h-24 mb-6 opacity-20" />
              <p className="text-2xl font-bold">{t('dashboard.selectChannel')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
