import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, CheckCircle, Loader2, UserPlus, ShieldCheck, AtSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { errorHandler } from '../lib/error-handler';
import { ContentStrings, Page } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSignupSchema, SignupFormValues } from '../lib/schemas';
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
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                        username: values.username,
                    },
                    emailRedirectTo: 'https://mrxsteroid.vercel.app/dashboard',
                },
            });

            if (error) throw error;

            setSuccess(true);
            toast.success(content.signupSuccess || "Account created! Check your email.");

            // Auto-redirect to login after 5 seconds
            setTimeout(() => navigateTo(Page.LOGIN), 5000);
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
                        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <CardTitle className="text-3xl font-black mb-4">{content.signupTitle}</CardTitle>
                        <CardDescription className="text-zinc-500 mb-8 leading-relaxed text-lg font-medium">
                            {content.signupSuccess || "Account created successfully! Please check your email to verify your account."}
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
                            <UserPlus className="w-8 h-8 text-gold-500" />
                        </motion.div>
                        <CardTitle className="text-3xl font-black mb-2">{content.signupTitle}</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            {content.navAiTools}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ml-1">
                                                {content.nameLabel}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder="John Doe"
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
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ml-1">
                                                {content.usernameLabel}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <AtSign className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder="johndoe123"
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
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ml-1">
                                                {content.emailLabel}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder="name@example.com"
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
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ml-1">
                                                {content.passwordLabel}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder="••••••••"
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
                                            <FormLabel className="text-xs font-black uppercase tracking-wider text-zinc-500 ml-1">
                                                {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <ShieldCheck className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400 transition-colors group-focus-within:text-gold-500`} />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium transition-all`}
                                                        placeholder="••••••••"
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
                                    className="w-full h-14 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-3 mt-4 group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            {content.signupBtn}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                            <p className="text-zinc-500 font-medium mb-4">{content.haveAccount}</p>
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
