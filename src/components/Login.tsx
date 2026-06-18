import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Tv, Mail, ArrowRight, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const setUser = usePlayerStore(state => state.setUser);

  // Handle returning from a magic link
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) {
        // Fallback for when they open the link on a different device
        savedEmail = window.prompt('Please provide your email for confirmation');
      }
      
      if (savedEmail) {
        setStatus('loading');
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            setUser({ email: result.user.email || '', uid: result.user.uid });
            navigate('/dashboard');
          })
          .catch((error) => {
            console.error(error);
            setStatus('error');
            setErrorMessage('Invalid or expired link. Please try again.');
          });
      }
    }
  }, [navigate, setUser]);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const actionCodeSettings = {
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      // Graceful fallback for missing config
      if (error.code === 'auth/invalid-api-key') {
        setErrorMessage('Firebase is not configured yet. Using Dev Mode bypass...');
        setTimeout(() => {
          simulateLogin();
        }, 1500);
      } else {
        setErrorMessage(error.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const simulateLogin = () => {
    setUser({ email: email || 'senior@gemeinwohl.de', uid: 'dev-user-123' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-2 text-3xl font-black tracking-tighter text-white mb-8 hover:opacity-80 transition-opacity drop-shadow-lg">
          <Tv className="w-10 h-10 text-blue-500" />
          <span>{t('app.title')}</span>
        </Link>
        <h2 className="mt-6 text-center text-4xl font-black text-white tracking-tight">
          {t('login.welcomeBack')}
        </h2>
        <p className="mt-3 text-center text-lg text-slate-400 font-medium">
          {t('login.signInSecurely')}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl py-10 px-6 sm:rounded-3xl sm:px-10 border border-slate-700/50 shadow-2xl shadow-black/50">
          
          <div className="bg-blue-950/50 border border-blue-500/30 rounded-2xl p-5 flex gap-4 mb-8 text-blue-200 text-sm leading-relaxed shadow-inner">
            <Info className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <p className="font-medium">{t('login.seniorFriendly')}</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">{t('login.checkEmail')}</h3>
              <p className="text-slate-300 text-lg">{t('login.magicLinkSent')} <strong className="text-white bg-slate-800 px-2 py-1 rounded-md ml-1">{email}</strong>.</p>
              <p className="text-slate-400 mt-2">{t('login.clickToSignIn')}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {t('login.tryDifferentEmail')}
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleMagicLinkSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                  {t('login.emailAddress')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-12 px-4 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl shadow-inner placeholder-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base font-medium transition-all"
                    placeholder="opa@beispiel.de"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="text-red-400 text-sm font-medium bg-red-950/50 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-lg font-black text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {status === 'loading' ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> {t('login.sendingLink')}</>
                  ) : (
                    <>{t('login.sendMagicLink')} <ArrowRight className="w-6 h-6" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-500 font-bold uppercase tracking-wider">{t('login.orForDevelopers')}</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={simulateLogin}
                className="w-full flex justify-center py-4 px-4 border-2 border-slate-700 rounded-2xl shadow-sm text-base font-bold text-slate-300 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
              >
                {t('login.bypassLogin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
