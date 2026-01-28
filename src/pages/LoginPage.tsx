import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Design System
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createLoginSchema, LoginFormValues } from '../lib/schemas';

interface LoginPageProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 30000; // 30 seconds

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo, content }) => {
  const { isRTL } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Rate Limiting Logic
  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) {
      setIsLocked(true);
      setLockoutTimer(LOCKOUT_TIME / 1000);
      const interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attempts]);

  // Zod Schema
  const loginSchema = createLoginSchema(isRTL);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error((error as Error).message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (values: LoginFormValues) => {
    if (isLocked) {
      toast.error(isRTL ? `حاول مرة أخرى بعد ${lockoutTimer} ثانية` : `Too many attempts. Try again in ${lockoutTimer}s`);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAttempts((prev) => prev + 1);
        throw error;
      }

      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      navigateTo(Page.DASHBOARD);
    } catch (error) {
      toast.error((error as Error).message || (isRTL ? 'فشل تسجيل الدخول' : 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error('Please enter a phone number');

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success('OTP sent! Check your phone.');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');

    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      toast.success('Login successful!');
      navigateTo(Page.DASHBOARD);
    } catch (error) {
      toast.error((error as Error).message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-gold-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold-500 mb-2 tracking-tight">Gatekeeper</h1>
          <p className="text-zinc-400 text-sm">Create your legacy or identify yourself.</p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading || isLocked}
          className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-800/80 text-white font-medium py-3 px-4 rounded-xl transition-all border border-zinc-700 hover:border-zinc-600 mb-8 group"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-300" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{isRTL ? 'سجل الدخول عبر Google' : 'Continue with Google'}</span>
            </>
          )}
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="px-3 bg-zinc-900 text-zinc-600 font-bold">{isRTL ? 'أو' : 'OR'}</span>
          </div>
        </div>

        {/* Locked State Warning */}
        {isLocked && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              {isRTL
                ? `تم قفل الحساب مؤقتاً. حاول بعد ${lockoutTimer} ثانية.`
                : `Account temporarily locked. Try again in ${lockoutTimer}s.`}
            </p>
          </div>
        )}

        {/* Email Login Form (Zod) */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4 mb-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-4 h-4 text-zinc-500 group-focus-within:text-gold-500 transition-colors`} />
                      <Input
                        {...field}
                        disabled={loading || isLocked}
                        className={`bg-zinc-950/50 border-zinc-800 focus-visible:ring-gold-500 h-12 ${isRTL ? 'pr-11' : 'pl-11'} transition-all`}
                        placeholder="john@example.com"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">{isRTL ? 'كلمة المرور' : 'Password'}</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-4 h-4 text-zinc-500 group-focus-within:text-gold-500 transition-colors`} />
                      <Input
                        {...field}
                        type="password"
                        disabled={loading || isLocked}
                        className={`bg-zinc-950/50 border-zinc-800 focus-visible:ring-gold-500 h-12 ${isRTL ? 'pr-11' : 'pl-11'} transition-all`}
                        placeholder="••••••••"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading || isLocked}
              className="w-full h-12 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isRTL ? 'الدخول للنظام' : 'Access Terminal'}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Divider for Phone */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="px-2 bg-zinc-900 text-zinc-500 font-bold">{isRTL ? 'خيارات أخرى' : 'Alternate Access'}</span>
          </div>
        </div>

        {/* Phone Login (Simplified) */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div className="relative group">
              <Phone className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-4 h-4 text-zinc-500 group-focus-within:text-gold-500 transition-colors`} />
              <input
                type="tel"
                placeholder={isRTL ? "رقم الهاتف (+966...)" : "Phone Number (+1...)"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading || isLocked}
                className={`w-full bg-zinc-950/30 border border-zinc-800 text-white rounded-xl px-4 py-3 h-11 focus:ring-1 focus:ring-gold-500 focus:outline-none focus:border-gold-500 transition-all ${isRTL ? 'pr-11' : 'pl-11'} text-sm`}
              />
            </div>
            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full text-xs text-zinc-500 hover:text-gold-500 font-bold transition-colors uppercase tracking-wider py-2"
            >
              {loading ? 'Sending...' : (isRTL ? 'إرسال رمز التفعيل SMS' : 'Authenticate via SMS')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-xs font-bold text-gold-500 mb-2 text-center uppercase tracking-widest">Enter Security Code</label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-zinc-950 border border-gold-500/50 text-gold-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500 focus:outline-none tracking-[0.5em] text-center text-xl font-mono"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl"
            >
              {loading ? 'Verifying...' : 'Verify Identity'}
            </Button>
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-xs text-zinc-500 hover:text-zinc-300 mt-2"
            >
              {isRTL ? 'تغيير الرقم' : 'Change Phone Number'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
