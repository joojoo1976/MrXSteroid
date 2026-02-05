import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { errorHandler } from '../lib/error-handler';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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

const LoginPage: React.FC<LoginPageProps> = ({ content, navigateTo }) => {
  const { isRTL } = usePreferences();

  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Check for verified parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success(isRTL ? "تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول." : "Account verified successfully! You can now log in.");
    }
  }, [isRTL]);

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
      errorHandler.handle(error, 'Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-black p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/90 backdrop-blur-md border border-gold-500/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        {/* Decorative Top Bar */}
        <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-70"></div>

        <div className="flex flex-row items-center justify-center gap-3 mb-6 mt-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
            <Lock className="w-4 h-4 text-gold-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-0.5">{content.gatekeeperTitle || 'Gatekeeper'}</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-none">{content.gatekeeperSubtitle || 'Create your legacy or identify yourself.'}</p>
          </div>
        </div>

        {/* Locked State Warning */}
        {isLocked && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-bold">
              {content.loginLockoutMessage
                ? content.loginLockoutMessage.replace('{seconds}', lockoutTimer.toString())
                : (isRTL
                  ? `تم قفل الحساب مؤقتاً. حاول بعد ${lockoutTimer} ثانية.`
                  : `Account locked. Retry in ${lockoutTimer}s.`)}
            </p>
          </div>
        )}

        {/* Email Login Form (Zod) */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-3 mb-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ms-1">
                    {content.emailLabel || (isRTL ? 'البريد الإلكتروني' : 'Email Address')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-4' : 'start-4'} w-4 h-4 text-zinc-500 group-focus-within:text-gold-500 transition-colors`} />
                      <Input
                        {...field}
                        disabled={loading || isLocked}
                        className={`bg-zinc-950/50 border-zinc-700/50 focus-visible:ring-gold-500 h-10 text-sm ${isRTL ? 'pe-10' : 'ps-10'} transition-all`}
                        placeholder={content.emailPlaceholder || "john@example.com"}
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
                  <FormLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ms-1">
                    {content.passwordLabel || (isRTL ? 'كلمة المرور' : 'Password')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-4' : 'start-4'} w-4 h-4 text-zinc-500 group-focus-within:text-gold-500 transition-colors`} />
                      <Input
                        {...field}
                        type="password"
                        disabled={loading || isLocked}
                        className={`bg-zinc-950/50 border-zinc-700/50 focus-visible:ring-gold-500 h-10 text-sm ${isRTL ? 'pe-10' : 'ps-10'} transition-all`}
                        placeholder={content.passwordPlaceholder || "••••••••"}
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
              className="w-full h-11 bg-gold-500 hover:bg-gold-400 text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {content.gatekeeperBtn || (isRTL ? 'الدخول للنظام' : 'Access Terminal')}
                  <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
