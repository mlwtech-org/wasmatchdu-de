import React, { useEffect, useMemo, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { parseM3U } from '../utils/m3uParser';
import { VideoPlayer } from './VideoPlayer';
import { Search, Tv, MapPin, Menu, X, PlayCircle, Loader2, Heart, Moon, Sun, Info } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_M3U_URL = 'https://iptv-org.github.io/iptv/countries/de.m3u';

export const Dashboard: React.FC = () => {
  const {
    channels,
    groups,
    currentChannel,
    searchQuery,
    selectedGroup,
    showOnlyRegional,
    showOnlyFavorites,
    favorites,
    isTheaterMode,
    isLoading,
    error,
    setChannels,
    setCurrentChannel,
    setSearchQuery,
    setSelectedGroup,
    setShowOnlyRegional,
    setShowOnlyFavorites,
    toggleFavorite,
    setIsLoading,
    setError,
  } = usePlayerStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync theme with HTML document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--background', '240 10% 3.9%');
      document.documentElement.style.setProperty('--foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--card', '240 10% 3.9%');
      document.documentElement.style.setProperty('--border', '240 3.7% 15.9%');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--background', '0 0% 100%');
      document.documentElement.style.setProperty('--foreground', '240 10% 3.9%');
      document.documentElement.style.setProperty('--card', '0 0% 98%');
      document.documentElement.style.setProperty('--border', '240 5.9% 90%');
    }
  }, [theme]);

  // Auto-hide sidebar in theater mode
  useEffect(() => {
    if (isTheaterMode) setIsSidebarOpen(false);
  }, [isTheaterMode]);

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
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === 'All' || channel.group === selectedGroup;
      const matchesRegional = showOnlyRegional ? channel.isRegional : true;
      const matchesFavorite = showOnlyFavorites ? favorites.includes(channel.id) : true;
      return matchesSearch && matchesGroup && matchesRegional && matchesFavorite;
    });
  }, [channels, searchQuery, selectedGroup, showOnlyRegional, showOnlyFavorites, favorites]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar Overlay for Mobile / Theater Mode */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 p-2 bg-card rounded-md border border-border text-primary shadow-lg hover:bg-primary/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative flex flex-col shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isTheaterMode && "lg:absolute" // Detach sidebar from flex flow in theater mode
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Tv className="w-6 h-6" />
            <span>OpenIPTV NRW</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-400 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          
          <select 
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
          >
            {groups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <div className="flex flex-col gap-2 mt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
              <input 
                type="checkbox" 
                checked={showOnlyRegional}
                onChange={(e) => setShowOnlyRegional(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary bg-background"
              />
              <MapPin className="w-4 h-4" />
              <span>Regional Only</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
              <input 
                type="checkbox" 
                checked={showOnlyFavorites}
                onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary bg-background"
              />
              <Heart className="w-4 h-4" />
              <span>Favorites Only</span>
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="text-center p-8 text-red-500 text-sm font-medium">{error}</div>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center p-8 text-gray-500 text-sm">No channels found.</div>
          ) : (
            filteredChannels.map((channel) => {
              const isFav = favorites.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-md transition-all duration-200 hover:bg-foreground/5 group",
                    currentChannel?.id === channel.id ? "bg-primary/10 border border-primary/20" : "border border-transparent"
                  )}
                >
                  <button
                    onClick={() => toggleFavorite(channel.id)}
                    className="p-1.5 rounded-full hover:bg-background shrink-0 transition-colors"
                  >
                    <Heart className={cn("w-4 h-4", isFav ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-400")} />
                  </button>
                  <div 
                    className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => setCurrentChannel(channel)}
                  >
                    <div className="w-10 h-10 rounded bg-background flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {channel.logo ? (
                        <img src={channel.logo} alt={channel.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Tv className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{channel.name}</div>
                      <div className="text-xs opacity-60 truncate">{channel.group}</div>
                    </div>
                    {currentChannel?.id === channel.id && (
                      <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col relative transition-all duration-300",
        isTheaterMode ? "w-full absolute inset-0 z-30 bg-background" : ""
      )}>
        <div className={cn(
          "flex-1 flex flex-col w-full mx-auto transition-all duration-300",
          isTheaterMode ? "max-w-none p-0" : "max-w-6xl p-4 lg:p-8"
        )}>
          {!isTheaterMode && (
            <header className="mb-6 lg:ml-0 ml-12 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentChannel ? currentChannel.name : 'Dashboard'}
                </h1>
                <p className="text-sm opacity-60">
                  {currentChannel ? `${currentChannel.group} ${currentChannel.isRegional ? '• Regional' : ''}` : 'Select a channel from the sidebar to begin streaming.'}
                </p>
              </div>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </header>
          )}
          
          <main className="flex-1 flex flex-col">
            <VideoPlayer />
            
            {/* EPG / Info Section */}
            {currentChannel && !isTheaterMode && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stream Info */}
                <div className="lg:col-span-1 p-6 rounded-xl bg-card border border-border shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Stream Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60">Category</div>
                      <div className="text-sm font-medium mt-1">{currentChannel.group}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60">Type</div>
                      <div className="text-sm font-medium mt-1">
                        {currentChannel.isRegional ? (
                           <span className="inline-flex items-center gap-1 text-primary"><MapPin className="w-3 h-3"/> Regional Broadcast</span>
                        ) : 'National / International'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60">Source</div>
                      <div className="text-sm font-medium mt-1 truncate" title={currentChannel.url}>
                        HLS Playlist (.m3u8)
                      </div>
                    </div>
                  </div>
                </div>

                {/* EPG Placeholder */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border shadow-md flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">Program Guide (EPG)</h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-lg bg-background/50">
                    <Tv className="w-10 h-10 text-primary/50 mb-3" />
                    <h4 className="font-medium text-lg">No EPG Data Available</h4>
                    <p className="text-sm opacity-60 max-w-md mt-2">
                      XMLTV schedule data is not currently loaded for <strong>{currentChannel.name}</strong>. 
                      Connecting an EPG provider would display "Now Playing" and "Up Next" information here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
