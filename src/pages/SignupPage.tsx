import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, CheckCircle, Loader2, UserPlus, ShieldCheck, AtSign, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { errorHandler } from '../lib/error-handler';
import { ContentStrings, Page } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignupSchema, SignupFormValues } from "../lib/schemas";
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

interface SignupPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

export default function SignupPage({ content, navigateTo }: SignupPageProps) {
    const { isRTL } = usePreferences();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Registration Schema with complexity and matching password
    const signupSchema = createSignupSchema(isRTL);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setLoading(true);

        try {
            // Using the precise keys for metadata to match the Database Trigger: full_name and user_name
            const signupOptions = {
                data: {
                    full_name: values.fullName,
                    user_name: values.username,
                },
                emailRedirectTo: window.location.origin + '/dashboard',
            };

            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: signupOptions,
            });

            if (error) throw error;

            if (data.user) {
                setSuccess(true);
                toast.success(content.signupSuccess || (isRTL ? "تم إنشاء الحساب! افحص بريدك الإلكتروني." : "Account created! Check your email."));

                // Auto-redirect to login after 5 seconds
                setTimeout(() => navigateTo(Page.LOGIN), 5000);
            }
        } catch (error) {
            errorHandler.handle(error, 'Signup');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-zinc-50/50 dark:bg-background/50">
                <motion.div
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
                        <CardDescription className="text-zinc-500 mb-8 leading-relaxed text-lg font-medium">
                            {content.signupSuccess || (isRTL
                                ? "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب."
                                : "Account created successfully! Please check your email to verify your account.")}
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {isRTL
                                    ? "هام: يرجى فحص صندوق البريد المزعج (Junk / Spam) إذا لم تجد الرسالة."
                                    : "Important: Please check your Junk / Spam folder if you don't see the email."}
                            </div>
                        </CardDescription>
                        <Button
                            onClick={() => navigateTo(Page.LOGIN)}
                            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xl rounded-xl shadow-xl transition-all hover:scale-[1.02]"
                        >
                            {content.loginBtn}
                        </Button>
                        <p className="mt-6 text-sm text-zinc-400 font-bold animate-pulse">
                            {isRTL ? "سيتم توجيهك تلقائياً خلال ثوانٍ..." : "Redirecting automatically in a few seconds..."}
                        </p>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-8 px-4 bg-black dark:bg-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-sm bg-zinc-900/90 dark:bg-black/90">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600"></div>

                    <CardHeader className="text-center pb-0 pt-6 px-6">
                        <div className="flex flex-row items-center justify-center gap-3 mb-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center border border-gold-500/20"
                            >
                                <UserPlus className="w-5 h-5 text-gold-500" />
                            </motion.div>
                            <CardTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">{content.signupTitle}</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-500 font-medium text-xs">
                            {content.gatekeeperSubtitle || (isRTL ? "اصنع إرثك أو أثبت هويتك" : "Create your legacy or identify yourself.")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                {content.nameLabel || (isRTL ? "الاسم الكامل" : "Full Name")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        disabled={loading}
                                                        className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-10' : 'ps-10'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder={content.fullNamePlaceholder || "John Doe"}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                {content.usernameLabel || (isRTL ? "اسم المستخدم" : "Username")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <AtSign className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        disabled={loading}
                                                        className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-10' : 'ps-10'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder={content.usernamePlaceholder || "johndoe123"}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                {content.emailLabel || (isRTL ? "البريد الإلكتروني" : "Email Address")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        disabled={loading}
                                                        className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-10' : 'ps-10'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder={content.emailPlaceholder || "name@example.com"}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                {content.passwordLabel || (isRTL ? "كلمة المرور" : "Password")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        disabled={loading}
                                                        className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-10' : 'ps-10'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder={content.passwordPlaceholder || "••••••••"}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ms-1">
                                                {content.confirmPasswordLabel || (isRTL ? "تأكيد كلمة المرور" : "Confirm Password")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <ShieldCheck className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'end-3' : 'start-3'} w-4 h-4 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        disabled={loading}
                                                        className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-lg ${isRTL ? 'pe-10' : 'ps-10'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder={content.passwordPlaceholder || "••••••••"}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="font-bold text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 mt-2 group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            {content.signupBtn}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
                            <p className="text-zinc-500 font-medium mb-2 text-xs">{content.haveAccount}</p>
                            <button
                                onClick={() => navigateTo(Page.LOGIN)}
                                className="text-gold-500 font-black hover:text-gold-400 transition-colors underline underline-offset-4"
                            >
                                {content.loginBtn}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
