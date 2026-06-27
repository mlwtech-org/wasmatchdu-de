import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { Trash2, ArrowLeft } from "lucide-react";
import { AVATARS } from "../lib/avatars";

export const ManageProfiles: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, removeProfile } = usePlayerStore();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center py-20 font-sans px-4">
      <div className="w-full max-w-4xl flex items-center justify-between mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Manage Profiles
        </h1>
        <button
          onClick={() => navigate("/profile-selection")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold bg-slate-900 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          Done
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-4xl">
        {profiles.map((profile) => {
          const avatar = AVATARS.find((a) => a.id === profile.avatarUrl) || AVATARS[0];
          const Icon = avatar.icon;
          
          return (
            <div
              key={profile.id}
              className="flex items-center justify-between bg-slate-900 p-6 rounded-[2rem] border border-slate-800"
            >
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-10 h-10 text-white/90" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
                  <p className="text-slate-400 font-medium">
                    {profile.isKidsMode ? "Kids Mode Enabled" : "Standard Profile"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${profile.name}?`)) {
                    removeProfile(profile.id);
                  }
                }}
                className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 group"
              >
                <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          );
        })}

        {profiles.length === 0 && (
          <div className="text-center text-slate-500 py-12 text-xl font-bold">
            No profiles found.
          </div>
        )}
      </div>
    </div>
  );
};
