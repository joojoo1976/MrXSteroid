import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck, Loader2, ArrowLeft, Github, ShieldAlert, KeyRound, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ContentStrings, Page } from '../types';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

// Design System Components
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Security - Brute Force Protection Constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30000; // 30 seconds

interface LoginPageProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
  isRTL: boolean;
}

export default function LoginPage({ content, navigateTo, isRTL }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Brute Force Protection State
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Validation Schema
  const loginSchema = z.object({
    email: z.string().email({ message: isRTL ? "بريد إلكتروني غير صحيح" : "Invalid email address" }),
    password: z.string().min(6, { message: isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters" }),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Brute Force Lockout Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocked && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, countdown]);

  const onSubmit = async (values: LoginFormValues) => {
    if (isLocked) {
      toast.error(isRTL ? `محاولة تسجيل الدخول محظورة مؤقتاً. انتظر ${countdown} ثانية.` : `Too many attempts. Try again in ${countdown}s.`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        // Increment attempts on failure
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setCountdown(LOCKOUT_DURATION / 1000);
          throw new Error(isRTL ? "تم تجاوز عدد المحاولات. تم قفل الحساب مؤقتاً." : "Too many attempts. Account temporary locked.");
        }

        throw error;
      }

      toast.success(content.loginSuccess || "Logged in successfully!");
      setAttempts(0);
      navigateTo(Page.HOME);
    } catch (error) {
      const err = error as Error;
      // Security: use generic error message if not localized specifically to avoid leaking account existence
      const displayError = attempts >= MAX_ATTEMPTS - 1
        ? err.message
        : (content.invalidCredentials || (isRTL ? "البيانات المدخلة غير صحيحة" : "Invalid credentials"));

      toast.error(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error(isRTL ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }

    setIsResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/?page=reset_password`,
      });

      if (error) throw error;

      toast.success(content.emailSentSuccess || "Reset link sent! Please check your inbox.");
      setShowForgot(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || (isRTL ? "فشل إرسال الرابط" : "Failed to send reset link"));
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-black dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-sm bg-zinc-900/80 dark:bg-black/80">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold-500/20"
            >
              {isLocked ? (
                <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              ) : (
                <KeyRound className="w-8 h-8 text-gold-500" />
              )}
            </motion.div>
            <CardTitle className="text-3xl font-black mb-2">{content.loginTitle}</CardTitle>
            <CardDescription className="text-zinc-500 font-medium">
              {isLocked
                ? (isRTL ? `محاولة تسجيل دخول مريبة. يرجى الانتظار ${countdown} ثانية.` : `Locked due to security. Wait ${countdown}s.`)
                : content.navAiTools}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                        {content.emailLabel}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 group-focus-within:text-gold-500 transition-colors`} />
                          <Input
                            {...field}
                            type="email"
                            disabled={loading || isLocked}
                            className={`h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 placeholder:text-zinc-400 font-medium transition-all`}
                            placeholder="name@example.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="font-bold text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <FormLabel className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                          {content.passwordLabel}
                        </FormLabel>
                        <button
                          type="button"
                          onClick={() => setShowForgot(true)}
                          className="text-[10px] font-black uppercase text-gold-500 hover:text-gold-400 transition-colors"
                        >
                          {content.forgotPassword}
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 group-focus-within:text-gold-500 transition-colors`} />
                          <Input
                            {...field}
                            type="password"
                            disabled={loading || isLocked}
                            className={`h-14 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 placeholder:text-zinc-400 font-medium transition-all`}
                            placeholder="••••••••"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="font-bold text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading || isLocked}
                  className={cn(
                    "w-full h-14 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                    isLocked && "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 shadow-none cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      {content.loginBtn}
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <AnimatePresence>
              {!isLocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="my-8 flex items-center gap-4">
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">{content.orDivider || "OR"}</span>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
                      }}
                      className="h-14 border-2 border-zinc-100 dark:border-zinc-800 hover:border-gold-500 hover:bg-gold-500/5 rounded-xl flex items-center justify-center gap-3 transition-all"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="font-bold text-sm tracking-tight">{content.loginWithGoogle || "Google"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        supabase.auth.signInWithOAuth({ provider: 'azure', options: { redirectTo: window.location.origin } });
                      }}
                      className="h-14 border-2 border-zinc-100 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-500/5 rounded-xl flex items-center justify-center gap-3 transition-all"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                      <span className="font-bold text-sm tracking-tight">{content.loginWithMicrosoft || "Microsoft"}</span>
                    </Button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-zinc-500 font-medium mb-4">{content.noAccount}</p>
                    <button
                      onClick={() => navigateTo(Page.SIGNUP)}
                      className="text-gold-500 font-bold hover:text-gold-400 transition-colors underline underline-offset-4"
                    >
                      {content.signupBtn}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden bg-zinc-900 dark:bg-zinc-950">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold-500/20">
                    <Mail className="w-8 h-8 text-gold-500" />
                  </div>
                  <CardTitle className="text-2xl font-black">{content.forgotPassword}</CardTitle>
                  <CardDescription className="text-zinc-500 font-medium">
                    {isRTL ? "أدخل بريدك الإلكتروني لتلقي رابط إكمال إعادة التعيين" : "Enter your email to receive a password reset link"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-wider text-zinc-500 ml-1">
                        {content.emailLabel}
                      </label>
                      <div className="relative">
                        <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400`} />
                        <Input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={isResetLoading}
                          className={`h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium`}
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForgot(false)}
                        className="flex-1 h-12 rounded-xl font-bold"
                      >
                        {isRTL ? "إلغاء" : "Cancel"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isResetLoading}
                        className="flex-[2] h-12 bg-gold-500 hover:bg-gold-400 text-black font-black rounded-xl shadow-lg transition-all"
                      >
                        {isResetLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : content.sendResetLink}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
