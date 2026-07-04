import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { Trash2, ArrowLeft, Edit2, Lock, Check, Globe, KeyRound } from "lucide-react";
import { AVATARS } from "../lib/avatars";
import { cn } from "../utils/cn";

export const ManageProfiles: React.FC = () => {
  const navigate = useNavigate();
  const { profiles, removeProfile, updateProfile } = usePlayerStore();

  // Editing state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editIsKidsMode, setEditIsKidsMode] = useState(false);
  const [editPin, setEditPin] = useState("");
  const [editRegionLock, setEditRegionLock] = useState("none");
  const [editContentRating, setEditContentRating] = useState("all");

  // Parental PIN Gate state
  const [pinPromptProfileId, setPinPromptProfileId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const startEdit = (profile: any) => {
    // If profile has a PIN, require verification before editing
    if (profile.pin) {
      setPinPromptProfileId(profile.id);
      setPinInput("");
      setPinError(false);
    } else {
      openEditPanel(profile);
    }
  };

  const verifyPinAndEdit = () => {
    const profile = profiles.find((p) => p.id === pinPromptProfileId);
    if (profile && profile.pin === pinInput) {
      setPinPromptProfileId(null);
      openEditPanel(profile);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const openEditPanel = (profile: any) => {
    setEditingProfileId(profile.id);
    setEditName(profile.name);
    setEditAvatarUrl(profile.avatarUrl);
    setEditIsKidsMode(profile.isKidsMode);
    setEditPin(profile.pin || "");
    setEditRegionLock(profile.regionLock || "none");
    setEditContentRating(profile.contentRating || "all");
  };

  const handleSave = () => {
    if (!editName.trim()) return;

    updateProfile(editingProfileId!, {
      name: editName.trim(),
      avatarUrl: editAvatarUrl,
      isKidsMode: editIsKidsMode,
      pin: editPin.length === 4 ? editPin : undefined,
      regionLock: editRegionLock,
      contentRating: editContentRating,
    });

    setEditingProfileId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center py-20 font-sans px-4 text-white">
      <div className="w-full max-w-4xl flex items-center justify-between mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
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

      {/* Main List */}
      {!editingProfileId && !pinPromptProfileId && (
        <div className="flex flex-col gap-4 w-full max-w-4xl">
          {profiles.map((profile) => {
            const avatar = AVATARS.find((a) => a.id === profile.avatarUrl) || AVATARS[0];
            const Icon = avatar.icon;

            return (
              <div
                key={profile.id}
                className="flex items-center justify-between bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-xl transition-all hover:border-slate-700/60 group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${avatar.color} flex items-center justify-center shadow-lg relative`}>
                    <Icon className="w-10 h-10 text-white/90" />
                    {profile.pin && (
                      <div className="absolute -top-2 -right-2 bg-slate-950 p-1.5 rounded-full border border-slate-800 text-cyan-400 shadow-md">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      {profile.name}
                      {profile.isKidsMode && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/35 uppercase tracking-widest font-black">
                          Kids Lock
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                        Rating: {profile.isKidsMode ? "Kids Friendly" : "All Access"}
                      </span>
                      {profile.regionLock && profile.regionLock !== "none" && (
                        <span className="text-xs bg-cyan-950/40 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-medium flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Region Lock: {profile.regionLock.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(profile)}
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all duration-300"
                    title="Edit Profile Settings"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${profile.name}?`)) {
                        removeProfile(profile.id);
                      }
                    }}
                    className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 group/trash"
                  >
                    <Trash2 className="w-5 h-5 group-hover/trash:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}

          {profiles.length === 0 && (
            <div className="text-center text-slate-500 py-12 text-xl font-bold">
              No profiles found.
            </div>
          )}
        </div>
      )}

      {/* Parental PIN Prompt Gate */}
      {pinPromptProfileId && (
        <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col items-center gap-6 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-2">Parental Verification</h2>
            <p className="text-slate-400 text-sm">Enter the PIN to edit this profile's restriction policy.</p>
          </div>

          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0000"
            className={cn(
              "w-40 text-center bg-slate-950 border rounded-xl px-4 py-3 text-3xl font-bold tracking-[0.25em] focus:outline-none transition-all placeholder:text-slate-800 text-white",
              pinError ? "border-red-500 animate-shake" : "border-slate-800 focus:border-cyan-500"
            )}
          />

          {pinError && <p className="text-red-500 text-sm font-bold animate-pulse">Incorrect PIN</p>}

          <div className="flex gap-4 w-full mt-2">
            <button
              onClick={() => setPinPromptProfileId(null)}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={verifyPinAndEdit}
              disabled={pinInput.length !== 4}
              className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Edit Panel Form */}
      {editingProfileId && (
        <div className="w-full max-w-3xl bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-xl animate-fade-in">
          <h2 className="text-3xl font-black mb-8 border-b border-slate-800 pb-4 text-cyan-400">
            Edit Profile Policy
          </h2>

          <div className="space-y-8">
            {/* Profile Name */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Profile Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-lg font-bold focus:outline-none focus:border-cyan-500 transition-all text-white placeholder-slate-700"
                placeholder="Enter Profile Name"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {AVATARS.map((avatar) => {
                  const Icon = avatar.icon;
                  const isSelected = editAvatarUrl === avatar.id;
                  return (
                    <div
                      key={avatar.id}
                      onClick={() => setEditAvatarUrl(avatar.id)}
                      className={cn(
                        `relative aspect-square rounded-2xl bg-gradient-to-br ${avatar.color} flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105`,
                        isSelected ? "ring-4 ring-white scale-105" : "opacity-60 hover:opacity-100 ring-2 ring-transparent"
                      )}
                    >
                      <Icon className="w-1/2 h-1/2 text-white/90" />
                      {isSelected && (
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                          <Check className="w-3.5 h-3.5 text-black font-black" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strict Global Kids Mode Filter */}
            <div className="flex items-center gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex-grow">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Kids Safety Lock
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Global Policy</span>
                </h3>
                <p className="text-slate-400 text-sm mt-0.5">Filter out all non-kids content globally, simplified visual mode.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={editIsKidsMode}
                  onChange={(e) => setEditIsKidsMode(e.target.checked)}
                />
                <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            {/* Strict Regional/Language Access Lock */}
            <div className="flex flex-col gap-3 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Geographic / Regional Lock
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Regional Policy</span>
                </h3>
                <p className="text-slate-400 text-sm mt-0.5">Restrict profile to load streams strictly from a specific country or language.</p>
              </div>
              <select
                value={editRegionLock}
                onChange={(e) => setEditRegionLock(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="none">No Lock (Global Access)</option>
                <option value="tel">Telugu Only (India)</option>
                <option value="tam">Tamil Only (India)</option>
                <option value="hin">Hindi Only (India)</option>
                <option value="pan">Punjabi Only (India)</option>
                <option value="ben">Bengali Only (India)</option>
                <option value="pl">Poland Only</option>
                <option value="de">Germany Only</option>
                <option value="us">United States Only</option>
              </select>
            </div>

            {/* Parental Security PIN */}
            {!editIsKidsMode && (
              <div className="flex items-center gap-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    Security PIN (Parental Lock)
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">Require 4-digit PIN to login or switch out of this profile.</p>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="None"
                  className="w-24 text-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xl font-bold tracking-[0.25em] focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700 text-white"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end gap-4">
            <button
              onClick={() => setEditingProfileId(null)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editName.trim()}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
