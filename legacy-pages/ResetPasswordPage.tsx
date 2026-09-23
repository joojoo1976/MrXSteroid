'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import {
    usePasswordReset,
    ResetPasswordFormValues,
} from '../features/auth/hooks/usePasswordReset';

// Design System
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

interface ResetPasswordProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

export default function ResetPasswordPage({ content, navigateTo }: ResetPasswordProps) {
    const { isRTL } = usePreferences();

    const { form, loading, success, runReset } = usePasswordReset({
        isRTL,
        successMessage: content.passwordResetSuccess || 'Password updated successfully!',
    });

    const onSubmit = async (values: ResetPasswordFormValues) => {
        const ok = await runReset(values);
        if (ok) setTimeout(() => navigateTo(Page.LOGIN), 3000);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-2xl p-10 text-center bg-white dark:bg-background h-full">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-black mb-4">{content.resetPasswordTitle}</CardTitle>
                        <CardDescription className="text-zinc-500 mb-8 leading-relaxed">
                            {content.passwordResetSuccess || "Your password has been updated. You will be redirected to login."}
                        </CardDescription>
                        <Button
                            onClick={() => navigateTo(Page.LOGIN)}
                            className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg transition-all"
                        >
                            {content.loginBtn}
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden bg-white dark:bg-background">
                    <CardHeader className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold-500/20"
                        >
                            <Lock className="w-8 h-8 text-gold-500" />
                        </motion.div>
                        <CardTitle className="text-2xl font-black mb-2">{content.resetPasswordTitle}</CardTitle>
                        <CardDescription className="text-zinc-500">
                            {content.resetPasswordDesc}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">
                                                {content.newPassword}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400`} />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium`}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">
                                                {content.confirmNewPassword}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <ShieldCheck className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400`} />
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        disabled={loading}
                                                        className={`h-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl ${isRTL ? 'pr-12' : 'pl-12'} focus-visible:ring-gold-500 font-medium`}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-zinc-900 dark:bg-gold-500 hover:bg-zinc-800 dark:hover:bg-gold-400 text-white dark:text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            {content.resetPassword}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => navigateTo(Page.LOGIN)}
                                className="text-zinc-500 hover:text-gold-500 transition-colors flex items-center gap-2 mx-auto font-bold"
                            >
                                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                                {content.backToLogin}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
