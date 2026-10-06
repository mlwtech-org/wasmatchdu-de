import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Crown, ExternalLink } from 'lucide-react';

export const AdBanner: React.FC = () => {
  const user = usePlayerStore(state => state.user);

  // If the user is premium, DO NOT SHOW ADS
  if (user?.isPremium) {
    return null;
  }

  // Otherwise, show the simulated Ad network block
  return (
    <div className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-4 my-4 relative overflow-hidden group">
      <div className="absolute top-2 right-2 flex gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Advertisement</span>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
            <ExternalLink className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Exclusive Deals from our Sponsors</h4>
            <p className="text-xs text-slate-400 mt-1">Support JanataTv by visiting our sponsors.</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            // Use existing trigger logic to show the Subscribe Overlay
            // You can replace this with a direct call to handleUpgradeClick from Dashboard if passed as a prop
            // For now, we will just alert, but in Dashboard we will inject the overlay trigger
            const upgradeBtn = document.getElementById('trigger-pro-upgrade');
            if (upgradeBtn) upgradeBtn.click();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Crown className="w-4 h-4" /> Remove Ads (₹99/mo)
        </button>
      </div>
    </div>
  );
};
