import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { ContentStrings, Page } from '../types';
import { DynamicBrandLogo } from '../shared/ui/DynamicBrandLogo';
import { getAvatarUrl } from '../shared/lib/avatar-service';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, User, Mail, Shield, ArrowLeft, Camera } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

interface ProfilePageProps {
    user: SupabaseUser | null;
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const { loading, profileData, refreshUser } = useAuth();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        // Check if user has confirmed their email
        const checkConfirmation = async () => {
            if (user) {
                const { data: { session } } = await supabase.auth.getSession();
                setIsConfirmed(!!(session?.user.email_confirmed_at || session?.user.confirmed_at));
            }
        };
        checkConfirmation();

        // Listen for auth state changes (e.g., email confirmation)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const confirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);
                setIsConfirmed(confirmed);

                // If just confirmed, refresh profile data
                if (confirmed && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
                    refreshUser();
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [user, refreshUser]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
        </div>;
    }

    if (!user) {
        navigateTo(Page.LOGIN);
        return null;
    }

    const userData = user.user_metadata || {};

    // Fix: Use proper display name with DB priority
    // Priority: DB profile → user_metadata → email fallback
    const displayName = profileData?.full_name
        || userData.full_name
        || userData.user_name
        || userData.username
        || user.email?.split('@')[0]
        || 'User';

    const username = profileData?.user_name
        || userData.user_name
        || userData.username
        || '-';

    // Fix: Use centralized avatar service for auto-fetching
    const profilePic = getAvatarUrl({
        email: user.email || undefined,
        provider: user.app_metadata?.provider,
        providerAvatarUrl: profileData?.avatar_url || userData.avatar_url || userData.picture,
    });

    // Fix: Use only the real-time state for verification status
    const isEmailConfirmed = isConfirmed;

    // Calculate member since year
    const memberSince = user.created_at
        ? new Date(user.created_at).getFullYear()
        : new Date().getFullYear();

    const handleResendConfirmation = async () => {
        if (isEmailConfirmed) {
            toast.info(isRTL ? 'تم تأكيد بريدك الإلكتروني بالفعل' : 'Your email is already confirmed');
            return;
        }

        if (!user.email) {
            toast.error(isRTL ? 'البريد الإلكتروني غير موجود' : 'Email not found');
            return;
        }

        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });

            if (error) {
                console.error('Resend confirmation error:', error);

                // Handle specific error cases
                if (error.message.includes('rate limit')) {
                    toast.error(
                        isRTL
                            ? 'لقد حاولت كثيراً. يرجى الانتظار ساعة ثم المحاولة مرة أخرى.'
                            : 'Too many attempts. Please wait an hour and try again.'
                    );
                } else if (error.message.includes('User not found') || error.message.includes('not found')) {
                    toast.error(
                        isRTL
                            ? 'المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى.'
                            : 'User not found. Please log in again.'
                    );
                } else {
                    toast.error(isRTL ? 'فشل إعادة إرسال البريد' : 'Failed to resend email');
                }
            } else {
                toast.success(
                    isRTL
                        ? '✅ تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد ومجلد البريد المزعج.'
                        : '✅ Confirmation link sent to your email. Please check your inbox and spam folder.'
                );

                // Start polling to detect confirmation after resend
                const pollInterval = setInterval(async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user.email_confirmed_at || session?.user.confirmed_at) {
                        setIsConfirmed(true);
                        clearInterval(pollInterval);
                        toast.success(isRTL ? 'تم تأكيد الحساب بنجاح! ✅' : 'Account verified successfully! ✅');
                        refreshUser();
                    }
                }, 5000); // Check every 5 seconds

                // Stop polling after 10 minutes
                setTimeout(() => clearInterval(pollInterval), 600000);
            }
        } catch (err) {
            console.error('Resend confirmation exception:', err);
            toast.error(isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-zinc-50 dark:bg-background overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full -z-10" />

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigateTo(Page.HOME)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-gold-500 transition-colors mb-8 group font-bold"
                >
                    <ArrowLeft className={`w-5 h-5 transition-transform group-hover:scale-110 ${isRTL ? 'rotate-180' : ''}`} />
                    {content.backToHome}
                </motion.button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar / Photo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-1"
                    >
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-xl shadow-zinc-200/50 dark:shadow-none">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-full border-4 border-gold-500/20 p-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 overflow-hidden shadow-inner">
                                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                </div>
                                <button
                                    aria-label={isRTL ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
                                    title={isRTL ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
                                    className="absolute bottom-0 right-0 p-2 bg-gold-500 text-black rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-zinc-900"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-1">{displayName}</h2>
                            <p className="text-sm text-gold-600 dark:text-gold-500 font-bold uppercase tracking-wider">
                                {isRTL ? `عضو منذ ${memberSince}` : `Member Since ${memberSince}`}
                            </p>
                        </div>
                    </motion.div>

                    {/* Main Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 space-y-6"
                    >
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                            <h1 className="text-2xl font-black mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4 flex items-center gap-3">
                                {isRTL ? "صفحة مستخدم " : "Profile of "}
                                <DynamicBrandLogo variant="full" inline />
                            </h1>

                            {!isEmailConfirmed && (
                                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-500 mb-2">
                                            {isRTL ? "لم يتم تأكيد بريدك الإلكتروني بعد." : "Your email is not confirmed yet."}
                                        </p>
                                        <button
                                            onClick={handleResendConfirmation}
                                            disabled={isResending}
                                            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isResending
                                                ? (isRTL ? "جاري الإرسال..." : "Sending...")
                                                : (isRTL ? "إعادة إرسال رابط التأكيد" : "Resend Confirmation Link")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isEmailConfirmed && (
                                <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-500">
                                        {isRTL ? "تم تأكيد الحساب بنجاح ✅" : "Account verified successfully ✅"}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">{content.fullName}</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                            {profileData?.full_name || userData.full_name || displayName || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">{content.usernameLabel}</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{username}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">{content.emailLabel}</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badge / Achievement Area (Decorative) */}
                        <div className="bg-gold-500/5 border border-gold-500/20 rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-black shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-gold-700 dark:text-gold-500">
                                    {isRTL ? 'الوصول المتميز نشط' : 'Elite Access Active'}
                                </h3>
                                <p className="text-sm text-gold-600/80 dark:text-gold-400/80">
                                    {isRTL
                                        ? 'لديك وصول كامل لجميع أدوات الذكاء الاصطناعي والأدلة المتميزة.'
                                        : 'You have full access to all AI tools and premium guides.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
