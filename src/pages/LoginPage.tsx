import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Page, ContentStrings } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo, content }) => {
  const { isRTL } = usePreferences();
  const [loading, setLoading] = useState(false);
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
          <form onSubmit={form.handleSubmit(handleEmailLogin)} className="space-y-4 mb-4">
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
      </motion.div>
    </div>
  );
};

export default LoginPage;
