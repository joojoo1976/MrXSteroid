import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, CheckCircle, Loader2, UserPlus, ShieldCheck, AtSign, AlertTriangle } from 'lucide-react';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import { useSignup } from '../features/auth/hooks/useSignup';
import { Button } from '../shared/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../shared/ui/form';
import { Input } from '../shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../shared/ui/card';

interface SignupPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

export default function SignupPage({ content, navigateTo }: SignupPageProps) {
    const { isRTL } = usePreferences();

    const { form, loading, success, usedMockAuth, onSubmit } = useSignup({
        content,
        isRTL,
        navigateTo
    });

    // Set SP_FORM_ID only while the signup page (with the registration form) is mounted
    useEffect(() => {
        (window as any).SP_FORM_ID = "registration-form";
        return () => {
            delete (window as any).SP_FORM_ID;
        };
    }, []);

    if (success) {
        return (
            <AnimatePresence mode="wait">
                <div key="success-container" className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-zinc-50/50 dark:bg-background/50">
                    <motion.div
                        key="success-view"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-2xl p-10 text-center backdrop-blur-sm bg-zinc-900/80 dark:bg-black/80 overflow-hidden relative">
                            <div className="absolute top-0 start-0 w-full h-2 bg-green-500"></div>
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <CardTitle className="text-3xl font-black mb-4">{content.signupTitle}</CardTitle>
                            <CardDescription className="text-zinc-400 mb-8 leading-relaxed text-lg font-medium">
                                {usedMockAuth ? (
                                    isRTL
                                        ? "✅ تم إنشاء الحساب بنجاح في وضع الاختبار! يمكنك تسجيل الدخول فوراً."
                                        : "✅ Account created successfully in test mode! You can log in immediately."
                                ) : (
                                    isRTL
                                        ? "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتنشيط حسابك قبل تسجيل الدخول."
                                        : "Account created successfully! Please check your email and click the confirmation link before logging in."
                                )}
                                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm font-bold flex items-center justify-center gap-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-start">
                                        {usedMockAuth ? (
                                            isRTL
                                                ? "ملاحظة: هذا حساب تجريبي. البيانات قد تضيع عند إعادة تشغيل التطبيق."
                                                : "Note: This is a test account. Data may be lost when the app restarts."
                                        ) : (
                                            isRTL
                                                ? "تنبيه: إذا لم تجد الرسالة، افحص صندوق البريد المزعج (Junk / Spam)."
                                                : "Note: If you don't see the email, please check your Junk / Spam folder."
                                        )}
                                    </span>
                                </div>
                            </CardDescription>
                            <Button
                                onClick={() => navigateTo(Page.LOGIN)}
                                className="w-full h-14 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-xl shadow-xl transition-all hover:scale-[1.02]"
                            >
                                {content.loginBtn}
                            </Button>
                            <p className="mt-6 text-sm text-zinc-500 font-bold">
                                {isRTL ? "ستقوم بتسجيل الدخول بعد التفعيل." : "You will be able to log in after verification."}
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <div key="form-container" className="flex flex-col items-center justify-center min-h-[60vh] py-8 px-4 bg-black dark:bg-black">
                <motion.div
                    key="form-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-sm bg-zinc-900/90 dark:bg-black/90 px-1">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 opacity-70"></div>

                        <CardHeader className="text-center pb-0 pt-4 px-4">
                            <div className="flex flex-row items-center justify-center gap-2 mb-1">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                    className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center border border-gold-500/20"
                                >
                                    <UserPlus className="w-4 h-4 text-gold-500" />
                                </motion.div>
                                <CardTitle className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 leading-none">{content.signupTitle}</CardTitle>
                            </div>
                            <CardDescription className="text-zinc-500 font-medium text-[10px] leading-none">
                                {content.gatekeeperSubtitle || (isRTL ? "اصنع إرثك أو أثبت هويتك" : "Create your legacy or identify yourself.")}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 pt-3">
                            <Form {...form}>
                                <form id="registration-form" onSubmit={onSubmit} className="space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0.5">
                                                    <FormLabel className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                        {content.nameLabel || (isRTL ? "الاسم الكامل" : "Full Name")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-3.5 h-3.5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                            <Input
                                                                {...field}
                                                                dir="ltr"
                                                                inputMode="text"
                                                                lang="en"
                                                                disabled={loading}
                                                                autoComplete="name"
                                                                className={`h-9 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-9' : 'ps-9'} focus-visible:ring-gold-500 font-medium transition-all text-left`}
                                                                placeholder={content.fullNamePlaceholder || "John Doe"}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="font-bold text-[9px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0.5">
                                                    <FormLabel className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                        {content.usernameLabel || (isRTL ? "اسم المستخدم" : "Username")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <AtSign className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-3.5 h-3.5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                            <Input
                                                                {...field}
                                                                dir="ltr"
                                                                inputMode="text"
                                                                lang="en"
                                                                disabled={loading}
                                                                autoComplete="username"
                                                                className={`h-9 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-9' : 'ps-9'} focus-visible:ring-gold-500 font-medium transition-all text-left`}
                                                                placeholder={content.usernamePlaceholder || "johndoe123"}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="font-bold text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-0.5">
                                                <FormLabel className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                    {content.emailLabel || (isRTL ? "البريد الإلكتروني" : "Email Address")}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-3.5 h-3.5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                        <Input
                                                            {...field}
                                                            type="email"
                                                            dir="ltr"
                                                            inputMode="email"
                                                            lang="en"
                                                            disabled={loading}
                                                            autoComplete="email"
                                                            className={`h-9 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-9' : 'ps-9'} focus-visible:ring-gold-500 font-medium transition-all text-left`}
                                                            placeholder={content.emailPlaceholder || "name@example.com"}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="font-bold text-[9px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0.5">
                                                    <FormLabel className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                        {content.passwordLabel || (isRTL ? "كلمة المرور" : "Password")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-3.5 h-3.5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                            <Input
                                                                {...field}
                                                                type="password"
                                                                dir="ltr"
                                                                inputMode="text"
                                                                lang="en"
                                                                disabled={loading}
                                                                autoComplete="new-password"
                                                                className={`h-9 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-9' : 'ps-9'} focus-visible:ring-gold-500 font-medium transition-all text-left`}
                                                                placeholder={content.passwordPlaceholder || "••••••••"}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="font-bold text-[9px]" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0.5">
                                                    <FormLabel className="text-[9px] font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                        {content.confirmPasswordLabel || (isRTL ? "تأكيد كلمة المرور" : "Confirm Password")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <ShieldCheck className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-3.5 h-3.5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                            <Input
                                                                {...field}
                                                                type="password"
                                                                dir="ltr"
                                                                inputMode="text"
                                                                lang="en"
                                                                disabled={loading}
                                                                autoComplete="new-password"
                                                                className={`h-9 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-9' : 'ps-9'} focus-visible:ring-gold-500 font-medium transition-all text-left`}
                                                                placeholder={content.passwordPlaceholder || (isRTL ? "••••••••" : "••••••••")}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="font-bold text-[9px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-10 bg-gold-500 hover:bg-gold-400 text-black font-black text-sm rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 mt-2 group overflow-hidden relative"
                                    >
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.div
                                                    key="loading-spinner"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="absolute inset-0 flex items-center justify-center"
                                                >
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="submit-content"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute inset-0 flex items-center justify-center gap-2"
                                                >
                                                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    <span>{content.signupBtn}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        {/* Invisible placeholder to maintain button height/width during animation */}
                                        <div className="opacity-0 flex items-center justify-center gap-2 pointer-events-none">
                                            <UserPlus className="w-4 h-4" />
                                            <span>{content.signupBtn}</span>
                                        </div>
                                    </Button>
                                </form>
                            </Form>

                            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
                                <p className="text-zinc-500 font-medium mb-1 text-[10px]">{content.haveAccount}</p>
                                <button
                                    onClick={() => navigateTo(Page.LOGIN)}
                                    className="text-gold-500 font-black text-xs hover:text-gold-400 transition-colors underline underline-offset-4"
                                >
                                    {content.loginBtn}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
