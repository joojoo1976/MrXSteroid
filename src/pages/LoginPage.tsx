import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ContentStrings, Page } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
  isRTL: boolean;
}

export default function LoginPage({ content, navigateTo, isRTL }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(content.loginSuccess || "Logged in successfully!");
      navigateTo(Page.HOME);
    } catch (error: any) {
      toast.error(error.message || content.invalidCredentials || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold-500/20"
            >
              <Lock className="w-8 h-8 text-gold-500" />
            </motion.div>
            <h1 className="text-3xl font-black mb-2">{content.loginTitle}</h1>
            <p className="text-zinc-500">{content.navAiTools}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                {content.emailLabel}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-4 ${isRTL ? 'pr-12' : 'pl-12'} focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium`}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                {content.passwordLabel}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400`} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-4 ${isRTL ? 'pr-12' : 'pl-12'} focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  {content.loginBtn}
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
            <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">{content.orDivider || "OR"}</span>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
              }}
              className="py-4 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 hover:border-gold-500 dark:hover:border-gold-500 rounded-xl flex items-center justify-center gap-3 transition-all group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-bold text-sm">{content.loginWithGoogle || "Google"}</span>
            </button>
            <button
              onClick={() => {
                supabase.auth.signInWithOAuth({ provider: 'azure', options: { redirectTo: window.location.origin } });
              }}
              className="py-4 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl flex items-center justify-center gap-3 transition-all group"
            >
              <svg className="w-6 h-6" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span className="font-bold text-sm">{content.loginWithMicrosoft || "Microsoft"}</span>
            </button>
          </div>


          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-zinc-500 mb-4">{content.noAccount}</p>
            <button
              onClick={() => navigateTo(Page.SIGNUP)}
              className="text-gold-500 font-bold hover:text-gold-400 transition-colors"
            >
              {content.signupBtn}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
