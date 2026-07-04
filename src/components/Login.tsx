import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Loader2, Info, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserRole } from "../types";

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const setUser = usePlayerStore((state) => state.setUser);
  const addProfile = usePlayerStore((state) => state.addProfile);
  const setActiveProfile = usePlayerStore((state) => state.setActiveProfile);
  const loadUserDataFromFirebase = usePlayerStore((state) => state.loadUserDataFromFirebase);

  // Handle returning from a magic link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem("emailForSignIn");
      if (!savedEmail) {
        // Fallback for when they open the link on a different device
        savedEmail = window.prompt(
          "Please provide your email for confirmation",
        );
      }

      if (savedEmail) {
        setStatus("loading");
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem("emailForSignIn");
            setUser({ email: result.user.email || "", uid: result.user.uid, role: "user" });
            
            // Sync cross-device watch history and premium status
            await loadUserDataFromFirebase(result.user.uid);
            
            navigate("/dashboard");
          })
          .catch((error) => {
            console.error(error);
            setStatus("error");
            setErrorMessage("Invalid or expired link. Please try again.");
          });
      }
    }
  }, [navigate, setUser]);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const actionCodeSettings = {
      url: window.location.origin + "/login",
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/invalid-api-key") {
        setErrorMessage(
          "Firebase is not configured yet. Using Dev Mode bypass...",
        );
        setTimeout(() => {
          simulateLogin("user");
        }, 1500);
      } else {
        setErrorMessage(
          error.message || "Something went wrong. Please try again.",
        );
      }
    }
  };

  const simulateLogin = (role: UserRole, isPremium: boolean = false) => {
    setUser({ email: `${role}@example.com`, uid: `dev-${role}`, role, isPremium });
    
    // Auto-create a profile to bypass the Create Profile screen
    const profileId = `profile-${Date.now()}`;
    addProfile({
      id: profileId,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} Profile`,
      avatarUrl: "cat", // fallback avatar id
      isKidsMode: false,
    });
    setActiveProfile(profileId);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/30 relative">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-10 mt-4">
          <div className="flex justify-center mb-8">
            <div className="p-3 md:p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.3)] hover:bg-white/10 transition-colors flex items-center gap-4">
              <img
                src="/logo.png"
                alt="WasMatchDu Icon"
                className="w-16 md:w-20 h-16 md:h-20 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] object-contain"
              />
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-white drop-shadow-md pr-4">
                WasMatch<span className="text-cyan-400 font-light">Du</span>
              </span>
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold text-white tracking-tight">
          Log in or sign up
        </h2>
        <p className="mt-4 text-center text-[15px] text-slate-300 font-medium px-4 leading-relaxed">
          Get access to live sports, highlights, shows,
          <br />
          News, Scores and much more.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4">
        <div className="bg-transparent py-4">
          {status === "success" ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                {t("login.checkEmail")}
              </h3>
              <p className="text-slate-300 text-lg">
                {t("login.magicLinkSent")}{" "}
                <strong className="text-white bg-slate-800 px-2 py-1 rounded-md ml-1">
                  {email}
                </strong>
                .
              </p>
              <p className="text-slate-400 mt-2">{t("login.clickToSignIn")}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-8 text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {t("login.tryDifferentEmail")}
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-[18px] bg-transparent border border-slate-700 rounded text-white focus:outline-none focus:border-white sm:text-base transition-colors"
                  placeholder="Email"
                />
              </div>

              {errorMessage && (
                <div className="text-red-400 text-sm font-medium bg-red-950/30 p-3 rounded flex items-start gap-2 border border-red-900/50">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full flex justify-center items-center py-[14px] px-4 rounded text-[15px] font-bold text-black bg-white hover:bg-slate-200 focus:outline-none transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#0a0a0a] text-slate-500 font-medium">
                  or
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Developer Toolkit</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => simulateLogin("user")}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-700 rounded-lg text-sm font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none"
                  >
                    <span>👤 User</span>
                  </button>
                  <button
                    onClick={() => simulateLogin("user", true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-amber-900/50 rounded-lg text-sm font-bold text-amber-400 bg-amber-950/30 hover:bg-amber-900/50 hover:text-amber-300 transition-colors focus:outline-none"
                  >
                    <span>👑 Premium</span>
                  </button>
                  <button
                    onClick={() => simulateLogin("operator")}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-indigo-900/50 rounded-lg text-sm font-bold text-indigo-400 bg-indigo-950/30 hover:bg-indigo-900/50 hover:text-indigo-300 transition-colors focus:outline-none"
                  >
                    <span>⚙️ Operator</span>
                  </button>
                  <button
                    onClick={() => simulateLogin("admin")}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-emerald-900/50 rounded-lg text-sm font-bold text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50 hover:text-emerald-300 transition-colors focus:outline-none"
                  >
                    <span>🛡️ Admin</span>
                  </button>
                  <button
                    onClick={() => simulateLogin("dev")}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-rose-900/50 rounded-lg text-sm font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/50 hover:text-rose-300 transition-colors focus:outline-none"
                  >
                    <span>🧑‍💻 Dev</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/legal" className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
              Legal & DMCA Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
