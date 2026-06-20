import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Tv, Loader2, Info, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const setUser = usePlayerStore((state) => state.setUser);

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
          .then((result) => {
            window.localStorage.removeItem("emailForSignIn");
            setUser({ email: result.user.email || "", uid: result.user.uid });
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
          simulateLogin();
        }, 1500);
      } else {
        setErrorMessage(
          error.message || "Something went wrong. Please try again.",
        );
      }
    }
  };

  const simulateLogin = () => {
    setUser({ email: email || "senior@gemeinwohl.de", uid: "dev-user-123" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/30 relative">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white flex items-center justify-center">
            <Tv className="w-10 h-10 text-black" />
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
              <button
                onClick={simulateLogin}
                className="w-full flex items-center justify-center relative py-[14px] px-4 border border-slate-800 rounded text-[15px] font-bold text-white bg-transparent hover:bg-slate-900/50 transition-colors focus:outline-none"
              >
                <span className="absolute left-4 font-black">FIFA</span>
                <span>Continue with FIFA ID</span>
              </button>

              <button
                onClick={simulateLogin}
                className="w-full flex items-center justify-center relative py-[14px] px-4 border border-slate-800 rounded text-[15px] font-bold text-white bg-transparent hover:bg-slate-900/50 transition-colors focus:outline-none"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="absolute left-4 w-5 h-5"
                />
                <span>Continue with Google</span>
              </button>

              <button
                onClick={simulateLogin}
                className="w-full flex items-center justify-center relative py-[14px] px-4 border border-slate-800 rounded text-[15px] font-bold text-white bg-transparent hover:bg-slate-900/50 transition-colors focus:outline-none"
              >
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  className="absolute left-4 w-5 h-5"
                />
                <span>Continue with Facebook</span>
              </button>

              <button
                onClick={simulateLogin}
                className="w-full flex items-center justify-center relative py-[14px] px-4 border border-slate-800 rounded text-[15px] font-bold text-white bg-transparent hover:bg-slate-900/50 transition-colors focus:outline-none"
              >
                <img
                  src="https://www.svgrepo.com/show/511330/apple-173.svg"
                  alt="Apple"
                  className="absolute left-4 w-5 h-5 invert"
                />
                <span>Continue with Apple</span>
              </button>

              <button
                onClick={simulateLogin}
                className="w-full flex items-center justify-center relative py-[14px] px-4 border border-slate-800 border-dashed rounded text-[15px] font-bold text-slate-400 bg-transparent hover:bg-slate-900/50 hover:text-white transition-colors focus:outline-none mt-2"
              >
                <span>Dev Login (Bypass Auth)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
