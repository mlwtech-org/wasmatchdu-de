import { useState, useEffect } from 'react';
import { parseM3U } from '../utils/m3uParser';
import { Play, MapPin, Tv, Loader2, Globe, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNavigate } from 'react-router-dom';

import { Channel } from '../types';

export function SportsHub() {
  const setCurrentChannel = usePlayerStore((state) => state.setCurrentChannel);
  const navigate = useNavigate();
  
  const initialRegion = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Europe') ? 'Europe' : 'US';
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(initialRegion);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegionalSports() {
      try {
        setLoading(true);
        const response = await fetch(`https://getregionalsports-o35qwjbb7q-uc.a.run.app?region=${region}`);
        
        if (!response.ok) {
          throw new Error('Failed to load regional streams');
        }

        const m3uData = await response.text();
        const parsedChannels = parseM3U(m3uData);
        setChannels(parsedChannels);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading regional sports.');
      } finally {
        setLoading(false);
      }
    }

    fetchRegionalSports();
  }, [region]);

  return (
    <div className="p-6 md:p-8 space-y-8 min-h-[calc(100vh-4rem)] pt-24 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-xl w-fit"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-bold">Back to Dashboard</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
            <Tv className="w-10 h-10 text-blue-400" />
            Live Near You
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Dynamically generated live sports streams for your region.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-medium border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative hover:bg-blue-500/20 transition-colors cursor-pointer">
          <MapPin className="w-4 h-4 animate-pulse" />
          <span className="pr-6 z-0 pointer-events-none">
            {region === "US" ? "North America 🇺🇸" : region === "Europe" ? "European Union 🇪🇺" : region === "Asia" ? "Asia Pacific 🌏" : "Global Trending 🌍"}
          </span>
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          >
            <option value="US">North America 🇺🇸</option>
            <option value="Europe">European Union 🇪🇺</option>
            <option value="Asia">Asia Pacific 🌏</option>
            <option value="Global">Global Trending 🌍</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-0">▼</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Scanning regional broadcasting towers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-2xl mx-auto">
          <Globe className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels.map((channel, idx) => (
            <div 
              key={`${channel.id}-${idx}`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
              onClick={() => {
                usePlayerStore.getState().setCurrentPlaylist(channels);
                setCurrentChannel(channel);
                navigate(`/live/${channel.id}`);
              }}
            >
              <div className="aspect-video bg-black/40 p-6 flex flex-col items-center justify-center relative">
                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg shadow-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  LIVE
                </div>
                
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name}
                    className="h-20 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tv_icon.svg/200px-Tv_icon.svg.png';
                      (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop if fallback fails
                    }}
                  />
                ) : (
                  <Tv className="w-16 h-16 text-gray-600" />
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-blue-600 text-white rounded-full p-4 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300 delay-75">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-white/5">
                <div className="text-xs text-blue-400 font-bold mb-1 tracking-wider uppercase">
                  {channel.group || 'Sports'}
                </div>
                <h3 className="font-semibold text-lg text-gray-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {channel.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
