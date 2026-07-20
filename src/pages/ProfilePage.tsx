import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { MockUser } from '../shared/lib/mock-auth-service';
import { ContentStrings, Page } from '@/shared/types/types';
import { DynamicBrandLogo } from '../shared/ui/DynamicBrandLogo';
import { getAvatarUrl } from '../shared/lib/avatar-service';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, User, Mail, Shield, ArrowLeft, Camera, Loader2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

interface ProfilePageProps {
    user: SupabaseUser | MockUser | null;
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const { loading, profileData, refreshUser } = useAuth();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
    const [showAvatarSpecs, setShowAvatarSpecs] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Avatar upload rules ───────────────────────────────────────────────
    const AVATAR_RULES = {
        maxSizeBytes: 2 * 1024 * 1024,           // 2 MB
        maxSizeMB: 2,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExt: 'JPG, PNG, WebP',
        minDimension: 100,
        maxDimension: 2000,
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        // 1. Validate file extension (strict check on file name)
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
        if (!fileExt || !allowedExts.includes(fileExt)) {
            toast.error(
                isRTL
                    ? `❌ صيغة غير مدعومة. الصيغ المقبولة: ${AVATAR_RULES.allowedExt}`
                    : `❌ Unsupported format. Allowed: ${AVATAR_RULES.allowedExt}`
            );
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // 2. Validate file size (max 2 MB)
        if (file.size > AVATAR_RULES.maxSizeBytes) {
            toast.error(
                isRTL
                    ? `❌ حجم الصورة يتجاوز ${AVATAR_RULES.maxSizeMB} ميجابايت. يرجى ضغط الصورة أولاً.`
                    : `❌ Image exceeds ${AVATAR_RULES.maxSizeMB}MB. Please compress it first.`
            );
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setShowAvatarSpecs(false);
        setIsUploadingAvatar(true);
        try {
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile in DB
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setLocalAvatarUrl(publicUrl);
            await refreshUser();
            toast.success(isRTL ? '✅ تم تحديث الصورة الشخصية بنجاح!' : '✅ Profile picture updated successfully!');
        } catch (err: any) {
            console.error('Avatar upload error:', err);
            toast.error(isRTL ? `فشل رفع الصورة: ${err.message}` : `Failed to upload avatar: ${err.message}`);
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        // Check if user has confirmed their email on mount
        const checkConfirmation = async () => {
            if (user) {
                const { data: { session } } = await supabase.auth.getSession();
                const confirmed = !!(session?.user.email_confirmed_at || session?.user.confirmed_at);
                setIsConfirmed(confirmed);
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
            } else {
                // Reset confirmation state if no session
                setIsConfirmed(false);
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
    // Priority: DB profile (full_name) → DB profile (user_name) → user_metadata → email fallback
    const displayName = profileData?.full_name
        || userData.full_name
        || profileData?.user_name
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
        email: profileData?.email || user.email || undefined,
        provider: (user as any).app_metadata?.provider,
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
                let pollCount = 0;
                const maxPolls = 120; // 10 minutes max (120 * 5 seconds)
                const pollInterval = setInterval(async () => {
                    pollCount++;
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user.email_confirmed_at || session?.user.confirmed_at) {
                        setIsConfirmed(true);
                        clearInterval(pollInterval);
                        toast.success(isRTL ? 'تم تأكيد الحساب بنجاح! ✅' : 'Account verified successfully! ✅');
                        refreshUser();
                    } else if (pollCount >= maxPolls) {
                        clearInterval(pollInterval);
                        console.log('Polling timeout reached');
                    }
                }, 5000); // Check every 5 seconds

                // Store interval ID for cleanup
                return () => clearInterval(pollInterval);
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

                            {/* Avatar + Camera Button */}
                            <div className="relative inline-block mb-4">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                                <div className="w-32 h-32 rounded-full border-4 border-gold-500/20 p-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 overflow-hidden shadow-inner">
                                    <img
                                        src={localAvatarUrl || profilePic}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <button
                                    aria-label={isRTL ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
                                    title={isRTL ? "تغيير الصورة الشخصية" : "Change Profile Picture"}
                                    disabled={isUploadingAvatar}
                                    onClick={() => setShowAvatarSpecs(prev => !prev)}
                                    className="absolute bottom-0 right-0 p-2 bg-gold-500 text-black rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white dark:border-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isUploadingAvatar
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Camera className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* ─── Avatar Specs Card (bilingual) ─── */}
                            <AnimatePresence>
                                {showAvatarSpecs && !isUploadingAvatar && (
                                    <motion.div
                                        key="avatar-specs"
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.2 }}
                                        className="mb-5 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-4 text-start shadow-sm"
                                    >
                                        {/* Title */}
                                        <p className="text-xs font-black text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <Camera className="w-3.5 h-3.5" />
                                            {isRTL ? 'متطلبات الصورة' : 'Photo Requirements'}
                                        </p>

                                        {/* Rules list */}
                                        <ul className="space-y-1.5 mb-4">
                                            {[
                                                {
                                                    ar: '📁 الصيغ المقبولة: JPG، PNG، WebP',
                                                    en: '📁 Formats: JPG, PNG, WebP'
                                                },
                                                {
                                                    ar: '📦 الحجم الأقصى: 2 ميجابايت',
                                                    en: '📦 Max size: 2 MB'
                                                },
                                                {
                                                    ar: '📐 الأبعاد: 100×100 كحد أدنى',
                                                    en: '📐 Min dimensions: 100×100 px'
                                                },
                                                {
                                                    ar: '📐 الأبعاد: 2000×2000 كحد أقصى',
                                                    en: '📐 Max dimensions: 2000×2000 px'
                                                },
                                                {
                                                    ar: '⬛ الشكل المُوصى به: مربع (1:1)',
                                                    en: '⬛ Recommended: square (1:1)'
                                                },
                                            ].map((rule, i) => (
                                                <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                                    {isRTL ? rule.ar : rule.en}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setShowAvatarSpecs(false); fileInputRef.current?.click(); }}
                                                className="flex-1 py-2 px-3 rounded-xl bg-gold-500 text-black text-xs font-black hover:bg-gold-600 transition-colors"
                                            >
                                                {isRTL ? '📂 اختر صورة' : '📂 Choose Photo'}
                                            </button>
                                            <button
                                                onClick={() => setShowAvatarSpecs(false)}
                                                className="py-2 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                {isRTL ? 'إلغاء' : 'Cancel'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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

                            {/* Verification Status Banner - Conditionally rendered based on email confirmation state */}
                            {!isEmailConfirmed ? (
                                <div key="unverified-banner" className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-500 mb-2">
                                            {isRTL ? "لم يتم تأكيد بريدك الإلكتروني بعد." : "Your email is not confirmed yet."}
                                        </p>
                                        <button
                                            onClick={handleResendConfirmation}
                                            disabled={isResending || !user.email}
                                            className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isResending
                                                ? (isRTL ? "جاري الإرسال..." : "Sending...")
                                                : (isRTL ? "إعادة إرسال رابط التأكيد" : "Resend Confirmation Link")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div key="verified-banner" className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
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
