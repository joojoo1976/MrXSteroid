import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, CheckCircle, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ContentStrings, Page } from '../types';

interface SignupPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
    isRTL: boolean;
}

export default function SignupPage({ content, navigateTo, isRTL }: SignupPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            setSuccess(true);
            toast.success(content.signupSuccess || "Account created! Check your email.");

            // Optional: Redirect after delay or let them see success message
            setTimeout(() => navigateTo(Page.LOGIN), 3000);

        } catch (error: any) {
            toast.error(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-10 text-center"
                >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">{content.signupTitle}</h2>
                    <p className="text-zinc-500 mb-8 leading-relaxed">
                        {content.signupSuccess || "Account created! Please check your email to confirm."}
                    </p>
                    <button
                        onClick={() => navigateTo(Page.LOGIN)}
                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                        {content.loginBtn}
                    </button>
                </motion.div>
            </div>
        );
    }

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
                            <UserPlus className="w-8 h-8 text-gold-500" />
                        </motion.div>
                        <h1 className="text-3xl font-black mb-2">{content.signupTitle}</h1>
                        <p className="text-zinc-500">{content.navAiTools}</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                                {content.nameLabel}
                            </label>
                            <div className="relative">
                                <User className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-zinc-400`} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-4 ${isRTL ? 'pr-12' : 'pl-12'} focus:ring-2 focus:ring-gold-500 outline-none transition-all font-medium`}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                            className="w-full bg-zinc-900 dark:bg-gold-500 hover:bg-zinc-800 dark:hover:bg-gold-400 text-white dark:text-black font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    {content.signupBtn}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <p className="text-zinc-500 mb-4">{content.haveAccount}</p>
                        <button
                            onClick={() => navigateTo(Page.LOGIN)}
                            className="text-gold-500 font-bold hover:text-gold-400 transition-colors"
                        >
                            {content.loginBtn}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
