import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { MockUser } from '../shared/lib/mock-auth-service';
import { ContentStrings, Page } from '@/shared/types/types';
import { DynamicBrandLogo } from '../shared/ui/DynamicBrandLogo';
import { getAvatarUrl } from '../shared/lib/avatar-service';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';
import {
    AlertCircle,
    CheckCircle2,
    User,
    Mail,
    Phone,
    ArrowLeft,
    Camera,
    Loader2,
    LayoutDashboard,
    Calendar,
    Crown,
    DollarSign,
    Layers,
    UserCheck,
    ExternalLink
} from 'lucide-react';

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
        maxSizeBytes: 2 * 1024 * 1024, // 2 MB
        maxSizeMB: 2,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExt: 'JPG, PNG, WebP',
        minDimension: 100,
        maxDimension: 2000,
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        // 1. Validate file extension
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
        } catch (err: unknown) {
            console.error('Avatar upload error:', err);
            const errMessage = err instanceof Error ? err.message : String(err);
            toast.error(isRTL ? `فشل رفع الصورة: ${errMessage}` : `Failed to upload avatar: ${errMessage}`);
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const checkConfirmation = async () => {
            if (user) {
                const { data: { session } } = await supabase.auth.getSession();
                const confirmed = !!(session?.user.email_confirmed_at || session?.user.confirmed_at);
                setIsConfirmed(confirmed);
            }
        };
        checkConfirmation();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const confirmed = !!(session.user.email_confirmed_at || session.user.confirmed_at);
                setIsConfirmed(confirmed);

                if (confirmed && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
                    refreshUser();
                }
            } else {
                setIsConfirmed(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [user, refreshUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-gold-500">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    if (!user) {
        navigateTo(Page.LOGIN);
        return null;
    }

    const userData = user.user_metadata || {};
    const hasPaid = profileData?.has_paid || false;

    // Profile display values
    const displayName = profileData?.full_name
        || userData.full_name
        || userData.name
        || profileData?.user_name
        || userData.user_name
        || user.email?.split('@')[0]
        || 'User';

    const username = profileData?.user_name
        || userData.user_name
        || userData.username
        || '-';

    const email = profileData?.email || user.email || '-';

    const phoneNumber = profileData?.phone_number
        || userData.phone_number
        || userData.phone
        || (isRTL ? 'غير مسجل' : 'Not provided');

    const role = profileData?.role
        || userData.role
        || 'user';

    const roleLabel = role === 'admin'
        ? (isRTL ? 'مدير النظام 🛡️' : 'Administrator 🛡️')
        : role === 'representative'
            ? (isRTL ? 'مندوب معتمد 💼' : 'Representative 💼')
            : (isRTL ? 'عضو عادي 👤' : 'Member 👤');

    const currency = profileData?.currency || userData.currency || 'USD';

    const planTier = profileData?.subscription_tier
        || profileData?.plan_tier
        || (hasPaid ? 'Premium' : 'Free');

    const profilePic = getAvatarUrl({
        email: email,
        provider: 'app_metadata' in user ? user.app_metadata?.provider : undefined,
        providerAvatarUrl: profileData?.avatar_url || userData.avatar_url || userData.picture,
    });

    const isEmailConfirmed = isConfirmed;

    const createdDate = profileData?.created_at
        || user.created_at
        ? new Date(profileData?.created_at || user.created_at!).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : (isRTL ? 'غير معروف' : 'Unknown');

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
                if (error.message.includes('rate limit')) {
                    toast.error(
                        isRTL
                            ? 'لقد حاولت كثيراً. يرجى الانتظار ساعة ثم المحاولة مرة أخرى.'
                            : 'Too many attempts. Please wait an hour and try again.'
                    );
                } else {
                    toast.error(isRTL ? 'فشل إعادة إرسال البريد' : 'Failed to resend email');
                }
            } else {
                toast.success(
                    isRTL
                        ? '✅ تم إرسال رابط التأكيد إلى بريدك الإلكتروني.'
                        : '✅ Confirmation link sent to your email.'
                );
            }
        } catch (err) {
            console.error('Resend confirmation exception:', err);
            toast.error(isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-20 bg-black text-white selection:bg-gold-500 selection:text-black relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 max-w-5xl space-y-6">

                {/* Top Action Buttons (Back Home + Go to Dashboard) */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <motion.button
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigateTo(Page.HOME)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-gold-400 transition-colors group font-bold text-sm"
                    >
                        <ArrowLeft className={`w-4 h-4 transition-transform group-hover:scale-110 ${isRTL ? 'rotate-180' : ''}`} />
                        {content.backToHome || (isRTL ? 'الرئيسية' : 'Home')}
                    </motion.button>

                    {/* Direct Link to Dashboard Page */}
                    <motion.button
                        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigateTo(Page.DASHBOARD)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-yellow-400 hover:from-gold-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl shadow-lg transition-all hover:scale-105"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{isRTL ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </motion.button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">

                    {/* ── Sidebar / Photo ───────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-1"
                    >
                        <div className="bg-zinc-900/90 border border-gold-500/30 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600"></div>

                            {/* Avatar + Camera Button */}
                            <div className="relative inline-block mb-4 mt-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                                <div className="w-32 h-32 rounded-full border-4 border-gold-500/40 p-1 flex items-center justify-center bg-zinc-950 overflow-hidden shadow-2xl">
                                    <img
                                        src={localAvatarUrl || profilePic}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <button
                                    aria-label={isRTL ? 'تغيير الصورة الشخصية' : 'Change Profile Picture'}
                                    title={isRTL ? 'تغيير الصورة الشخصية' : 'Change Profile Picture'}
                                    disabled={isUploadingAvatar}
                                    onClick={() => setShowAvatarSpecs(prev => !prev)}
                                    className="absolute bottom-0 end-0 p-2.5 bg-gold-500 text-black rounded-full shadow-xl hover:scale-110 transition-transform border-4 border-zinc-900 disabled:opacity-60"
                                >
                                    {isUploadingAvatar
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Camera className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Avatar Specs Card */}
                            <AnimatePresence>
                                {showAvatarSpecs && !isUploadingAvatar && (
                                    <motion.div
                                        key="avatar-specs"
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.2 }}
                                        className="mb-5 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4 text-start shadow-xl"
                                    >
                                        <p className="text-xs font-black text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Camera className="w-3.5 h-3.5" />
                                            {isRTL ? 'متطلبات الصورة' : 'Photo Requirements'}
                                        </p>
                                        <ul className="space-y-1 mb-3 text-[11px] text-zinc-300">
                                            <li>• {isRTL ? 'الصيغ: JPG، PNG، WebP' : 'Formats: JPG, PNG, WebP'}</li>
                                            <li>• {isRTL ? 'الحجم الأقصى: 2 ميجابايت' : 'Max size: 2 MB'}</li>
                                            <li>• {isRTL ? 'الشكل المقبول: مربع (1:1)' : 'Recommended: Square (1:1)'}</li>
                                        </ul>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setShowAvatarSpecs(false); fileInputRef.current?.click(); }}
                                                className="flex-1 py-1.5 px-3 rounded-xl bg-gold-500 text-black text-xs font-black hover:bg-gold-400 transition-colors"
                                            >
                                                {isRTL ? '📂 اختر صورة' : '📂 Choose Photo'}
                                            </button>
                                            <button
                                                onClick={() => setShowAvatarSpecs(false)}
                                                className="py-1.5 px-3 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800"
                                            >
                                                {isRTL ? 'إلغاء' : 'Cancel'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <h2 className="text-lg font-black text-white mb-0.5">{displayName}</h2>
                            <p className="text-xs text-gold-400 font-bold tracking-wide">@{username}</p>
                            <p className="text-[11px] text-zinc-500 font-medium mt-2">
                                {isRTL ? `عضو منذ: ${createdDate}` : `Member since: ${createdDate}`}
                            </p>

                            {/* Direct Dashboard Link Card */}
                            <div className="mt-6 pt-6 border-t border-zinc-800">
                                <button
                                    onClick={() => navigateTo(Page.DASHBOARD)}
                                    className="w-full py-3 bg-zinc-800 hover:bg-gold-500 hover:text-black border border-gold-500/30 text-gold-400 font-black text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-gold-500 group-hover:text-black transition-colors" />
                                    <span>{isRTL ? 'لوحة التحكم والأدوات' : 'Dashboard & Tools'}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Main Profile Info Grid ────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 space-y-6"
                    >
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">

                            <div className="flex flex-row items-center justify-between border-b border-zinc-800 pb-4">
                                <h1 className="text-xl font-black text-white flex items-center gap-2">
                                    {isRTL ? 'بيانات ملف المستخدِم' : 'User Account Profile'}
                                    <DynamicBrandLogo variant="full" inline />
                                </h1>
                            </div>

                            {/* Verification Banner */}
                            {!isEmailConfirmed ? (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-amber-400 mb-1">
                                            {isRTL ? 'لم يتم تأكيد بريدك الإلكتروني بعد.' : 'Your email is not confirmed yet.'}
                                        </p>
                                        <button
                                            onClick={handleResendConfirmation}
                                            disabled={isResending || !user.email}
                                            className="text-xs bg-amber-500 text-black px-3 py-1 rounded-lg font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                                        >
                                            {isResending
                                                ? (isRTL ? 'جاري الإرسال...' : 'Sending...')
                                                : (isRTL ? 'إعادة إرسال رابط التأكيد' : 'Resend Confirmation Link')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <p className="text-xs font-bold text-emerald-400">
                                        {isRTL ? 'البريد الإلكتروني مفعل ومؤكد بنجاح ✅' : 'Email address verified successfully ✅'}
                                    </p>
                                </div>
                            )}

                            {/* Complete Credentials Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Full Name */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <User className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'الاسم الكامل' : 'Full Name'}</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{displayName}</p>
                                </div>

                                {/* Username */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <UserCheck className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'اسم المستخدم' : 'Username'}</span>
                                    </div>
                                    <p className="text-sm font-black text-gold-400">@{username}</p>
                                </div>

                                {/* Email */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <Mail className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</span>
                                    </div>
                                    <p className="text-sm font-black text-white truncate" title={email}>{email}</p>
                                </div>

                                {/* Phone */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <Phone className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'رقم الهاتف المحمول' : 'Mobile Phone'}</span>
                                    </div>
                                    <p className="text-sm font-black text-white" dir="ltr">{phoneNumber}</p>
                                </div>

                                {/* Role */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <Layers className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'الصفة / الدور' : 'User Role'}</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{roleLabel}</p>
                                </div>

                                {/* Subscription */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <Crown className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'حالة الاشتراك' : 'Subscription Tier'}</span>
                                    </div>
                                    <p className={`text-sm font-black ${hasPaid ? 'text-green-400' : 'text-amber-400'}`}>
                                        {planTier} ({hasPaid ? (isRTL ? 'مفعل' : 'Active') : (isRTL ? 'مجاني' : 'Free')})
                                    </p>
                                </div>

                                {/* Join Date */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'تاريخ الانضمام' : 'Member Since'}</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{createdDate}</p>
                                </div>

                                {/* Currency */}
                                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                        <DollarSign className="w-3.5 h-3.5 text-gold-500" />
                                        <span>{isRTL ? 'العملة' : 'Currency'}</span>
                                    </div>
                                    <p className="text-sm font-black text-white">{currency}</p>
                                </div>

                            </div>
                        </div>

                        {/* Navigation CTA Card to Dashboard */}
                        <div className="bg-gradient-to-r from-gold-500/10 via-zinc-900 to-gold-500/10 border border-gold-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gold-500 text-black rounded-2xl shrink-0 font-black">
                                    <LayoutDashboard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gold-400 text-sm">
                                        {isRTL ? 'الانتقال إلى لوحة التحكم' : 'Access Your Dashboard'}
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        {isRTL ? 'استخدم حاسبات السعرات، فارماسيم™، والكتب الذهبية الحصرية' : 'Access Macro tools, PharmaSim™, and golden e-books'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
                            >
                                <span>{isRTL ? 'فتح لوحة التحكم' : 'Open Dashboard'}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
