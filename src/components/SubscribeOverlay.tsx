import React, { useState } from 'react';
import { Lock, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export const SubscribeOverlay: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const setUser = usePlayerStore(state => state.setUser);
  const user = usePlayerStore(state => state.user);

  const handleSubscribe = () => {
    setIsProcessing(true);
    // Simulate Stripe Checkout Redirect or Firebase Extension webhook delay
    setTimeout(() => {
      // Mock successful subscription
      if (user) {
        setUser({ ...user, isPremium: true });
      }
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl rounded-2xl overflow-hidden">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 text-center relative overflow-hidden m-4">
        {/* Decorative background */}
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50 rotate-3">
            <Lock className="w-10 h-10 text-white -rotate-3" />
          </div>
          
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">JanataTv Premium</h2>
          <p className="text-slate-400 mb-8 font-medium text-lg leading-relaxed">Subscribe to unlock live broadcasting and exclusive premium channels.</p>
          
          <div className="space-y-4 mb-8 text-left bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
            {[
              'Unlimited HD Streaming',
              'Access to 500+ Global Channels',
              'Ad-free experience',
              'Cancel anytime via Stripe'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isProcessing ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Preparing Checkout...</>
            ) : (
              <><CreditCard className="w-6 h-6" /> Subscribe for ₹99/mo</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
