import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { AVATARS } from "../lib/avatars";
import { Check, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { addProfile, profiles, setActiveProfile, user } = usePlayerStore();
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [isKidsMode, setIsKidsMode] = useState(false);
  const [pin, setPin] = useState("");
  const [showError, setShowError] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setShowError(true);
      nameInputRef.current?.focus();
      // Optional: scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newProfile = {
      id: `profile-${Date.now()}`,
      name: name.trim(),
      avatarUrl: selectedAvatar,
      isKidsMode,
      pin: !isKidsMode && pin.length === 4 ? pin : undefined,
    };

    addProfile(newProfile);
    setActiveProfile(newProfile.id);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center py-20 px-4 font-sans text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black mb-10 text-center tracking-tight">
          Add Profile
        </h1>

        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start border-t border-slate-800 border-b py-12">
          
          {/* Avatar Preview */}
          <div className="flex-shrink-0 relative">
            {(() => {
              const avatar = AVATARS.find(a => a.id === selectedAvatar)!;
              const Icon = avatar.icon;
              return (
                <div className={`w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-2xl ring-4 ring-white/10`}>
                  <Icon className="w-20 h-20 md:w-24 md:h-24 text-white/90" />
                </div>
              );
            })()}
          </div>

          <div className="flex-grow w-full max-w-xl space-y-8">
            <div>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (showError) setShowError(false);
                }}
                placeholder="Profile Name"
                className={`w-full bg-slate-900 border ${showError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'} rounded-xl px-6 py-4 text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500`}
              />
              {showError && (
                <p className="text-red-500 font-medium mt-2 ml-2 animate-pulse">
                  Please enter a name for this profile.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-300">Choose an Avatar</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {AVATARS.map((avatar) => {
                  const Icon = avatar.icon;
                  const isSelected = selectedAvatar === avatar.id;
                  return (
                    <div
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`relative aspect-square rounded-2xl bg-gradient-to-br ${avatar.color} flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected ? 'ring-4 ring-white scale-105' : 'opacity-60 hover:opacity-100 ring-2 ring-transparent'}`}
                    >
                      <Icon className="w-1/2 h-1/2 text-white/90" />
                      {isSelected && (
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                          <Check className="w-4 h-4 text-black font-bold" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <div className="flex-grow">
                <h3 className="text-xl font-bold">Kids Mode</h3>
                <p className="text-slate-400 mt-1">Show only family-friendly content and simplified UI.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isKidsMode}
                  onChange={(e) => setIsKidsMode(e.target.checked)}
                />
                <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {!isKidsMode && (
              <div className="flex items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">Profile PIN (Optional)</h3>
                  <p className="text-slate-400 mt-1">Require a 4-digit PIN to access this profile.</p>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0000"
                  className="w-24 text-center bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-bold tracking-[0.25em] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-6">
          <button
            onClick={() => navigate(profiles.length === 0 ? "/" : "/profile-selection")}
            className="px-8 py-4 rounded-full border-2 border-slate-700 font-bold text-lg hover:border-slate-500 hover:bg-slate-800 transition-all text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-12 py-4 rounded-full bg-white text-black font-black text-lg hover:bg-slate-200 transition-all flex items-center gap-2 shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
