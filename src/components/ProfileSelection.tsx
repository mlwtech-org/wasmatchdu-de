import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { PlusCircle, Lock, X, ArrowLeft } from "lucide-react";
import { AVATARS } from "../lib/avatars";
import { useEffect, useState } from "react";

export const ProfileSelection: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, setActiveProfile, user } = usePlayerStore();
  const [lockedProfileId, setLockedProfileId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSelectProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile?.pin) {
      setLockedProfileId(id);
      setPinInput("");
      setPinError(false);
    } else {
      setActiveProfile(id);
      navigate("/dashboard");
    }
  };

  const handlePinSubmit = () => {
    const profile = profiles.find(p => p.id === lockedProfileId);
    if (profile && profile.pin === pinInput) {
      setActiveProfile(profile.id);
      navigate("/dashboard");
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-sans relative">
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold bg-slate-900/50 hover:bg-slate-800 px-4 py-2 rounded-xl backdrop-blur-md"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
          Who's watching?
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-8 max-w-4xl px-4">
        {profiles.map((profile) => {
          const avatar = AVATARS.find((a) => a.id === profile.avatarUrl) || AVATARS[0];
          const Icon = avatar.icon;
          
          return (
            <div
              key={profile.id}
              className="flex flex-col items-center gap-4 group cursor-pointer"
              onClick={() => handleSelectProfile(profile.id)}
            >
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300 ring-4 ring-transparent group-hover:ring-white/20`}>
                <Icon className="w-16 h-16 md:w-20 md:h-20 text-white/90" />
                {profile.pin && (
                  <div className="absolute -bottom-3 -right-3 bg-slate-900 rounded-full p-2 shadow-lg border border-slate-700">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
              <span className="text-slate-400 font-bold text-xl group-hover:text-white transition-colors">
                {profile.name}
              </span>
            </div>
          );
        })}

        {profiles.length < 5 && (
          <div
            className="flex flex-col items-center gap-4 group cursor-pointer"
            onClick={() => navigate("/create-profile")}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-slate-900 border-2 border-slate-800 flex items-center justify-center group-hover:scale-105 group-hover:border-slate-600 transition-all duration-300">
              <PlusCircle className="w-16 h-16 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <span className="text-slate-500 font-bold text-xl group-hover:text-slate-300 transition-colors">
              Add Profile
            </span>
          </div>
        )}
      </div>
      
      {profiles.length > 0 && (
        <button
          className="mt-16 px-8 py-3 rounded-full border border-slate-700 text-slate-400 font-bold hover:border-slate-500 hover:text-white transition-colors"
          onClick={() => navigate("/manage-profiles")}
        >
          Manage Profiles
        </button>
      )}

      {/* PIN Entry Modal */}
      {lockedProfileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-sm w-full border border-slate-800 shadow-2xl relative">
            <button 
              onClick={() => setLockedProfileId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Profile Locked</h2>
              <p className="text-slate-400">Enter your 4-digit PIN to access.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                  setPinError(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                autoFocus
                className={`w-32 text-center bg-slate-950 border ${pinError ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 text-3xl font-bold tracking-[0.25em] focus:outline-none focus:border-blue-500 transition-all text-white placeholder-slate-700`}
                placeholder="••••"
              />
              {pinError && <p className="text-red-500 text-sm font-medium animate-pulse">Incorrect PIN</p>}
              <button 
                onClick={handlePinSubmit}
                disabled={pinInput.length !== 4}
                className="w-full mt-4 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
