'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Page } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import { getAvatarUrl } from '../shared/lib/avatar-service';
import { getCalculatorHistory, deleteCalculatorHistory } from '../shared/lib/calculator-history';
import { downloadSecureBook } from '../shared/lib/secure-download';
import {
    ChevronDown,
    BookOpen,
    Calculator,
    FileText,
    Download,
    Lock,
    Unlock,
    Crown,
    User,
    Mail,
    Phone,
    ShieldCheck,
    Calendar,
    LogOut,
    ExternalLink,
    DollarSign,
    Sparkles,
    Activity,
    Layers,
    UserCheck,
    Sliders,
    History,
    Trash2,
    Syringe,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
    navigateTo: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateTo }) => {
    const { isRTL } = usePreferences();
    const { user, loading, signOut, profileData } = useAuth();

    const [history, setHistory] = useState<Array<{ id: string; tool: string; title: string | null; inputs: Record<string, unknown>; result: Record<string, unknown>; created_at: string }>>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [downloading, setDownloading] = useState<'en' | 'ar' | null>(null);

    // Protection Logic
    useEffect(() => {
        if (!loading && !user) {
            navigateTo(Page.LOGIN);
        }
    }, [user, loading, navigateTo]);

    const loadHistory = async () => {
        if (!user) return;
        setHistoryLoading(true);
        const rows = await getCalculatorHistory(40);
        setHistory(rows as Array<{ id: string; tool: string; title: string | null; inputs: Record<string, unknown>; result: Record<string, unknown>; created_at: string }>);
        setHistoryLoading(false);
    };

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        Promise.resolve()
            .then(() => {
                if (cancelled) return;
                setHistoryLoading(true);
                return getCalculatorHistory(40);
            })
            .then(rows => {
                if (cancelled) return;
                setHistory(rows as Array<{ id: string; tool: string; title: string | null; inputs: Record<string, unknown>; result: Record<string, unknown>; created_at: string }>);
                setHistoryLoading(false);
            })
            .catch(() => {
                if (!cancelled) setHistoryLoading(false);
            });
        return () => { cancelled = true; };
    }, [user]);

    const handleDeleteHistory = async (id: string) => {
        const ok = await deleteCalculatorHistory(id);
        if (ok) {
            setHistory(prev => prev.filter(h => h.id !== id));
            toast.success(isRTL ? 'تم حذف السجل' : 'History entry deleted');
        } else {
            toast.error(isRTL ? 'فشل حذف السجل' : 'Failed to delete entry');
        }
    };

    const handleSecureDownload = async (file: 'en' | 'ar') => {
        setDownloading(file);
        const res = await downloadSecureBook(file);
        setDownloading(null);
        if (res.ok) {
            toast.success(isRTL ? 'بدأ تحميل الكتاب الآمن' : 'Secure download started');
        } else if (res.error === 'auth') {
            toast.error(isRTL ? 'جلسة منتهية، يرجى تسجيل الدخول مجدداً' : 'Session expired. Please log in again.');
        } else if (res.error === 'subscription') {
            toast.error(isRTL ? 'الاشتراك المدفوع مطلوب لهذا التحميل' : 'Active subscription required for this download.');
        } else {
            toast.error(isRTL ? 'فشل التحميل، حاول مرة أخرى' : 'Download failed. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gold-500">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-gold-500 mb-4"></div>
                <p className="font-bold text-sm text-zinc-400">
                    {isRTL ? 'جاري تحميل لوحة التحكم...' : 'Loading Dashboard...'}
                </p>
            </div>
        );
    }

    if (!user) return null;

    const handleLogout = async () => {
        await signOut();
        navigateTo(Page.HOME);
    };

    // User metadata & fallback logic
    const userData = user.user_metadata || {};
    const hasPaid = profileData?.has_paid || false;

    const fullName = profileData?.full_name
        || userData.full_name
        || userData.name
        || (isRTL ? 'مستخدم مستر إكس' : 'Mr. X User');

    const username = profileData?.user_name
        || userData.user_name
        || userData.username
        || user.email?.split('@')[0]
        || 'user';

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
            : (isRTL ? 'عضو مميز 👤' : 'Member 👤');

    const currency = profileData?.currency || userData.currency || 'USD';

    const planTier = profileData?.subscription_tier
        || profileData?.plan_tier
        || (hasPaid ? 'Premium' : 'Free');

    const createdDate = profileData?.created_at
        || user.created_at
        ? new Date(profileData?.created_at || user.created_at!).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : (isRTL ? 'غير معروف' : 'Unknown');

    const avatarUrl = getAvatarUrl({
        email: email,
        provider: (user as unknown as { app_metadata?: { provider?: string } }).app_metadata?.provider,
        providerAvatarUrl: profileData?.avatar_url || userData.avatar_url || userData.picture,
    });

    // Free content items - available to all logged-in users
    const freeContentItems = [
        {
            icon: Calculator,
            label: isRTL ? 'حاسبة السعرات والماكروز' : 'Macro & Calorie Calculator',
            desc: isRTL ? 'حساب الاحتياجات اليومية بدقة' : 'Calculate daily energy needs',
            page: Page.MACRO
        },
        {
            icon: Calculator,
            label: isRTL ? 'حاسبة نسبة الدهون' : 'Body Fat Percentage',
            desc: isRTL ? 'تقدير نسبة الدهون في الجسم' : 'Estimate total body fat',
            page: Page.BODYFAT
        },
        {
            icon: FileText,
            label: isRTL ? 'خريطة مواضع الحقن' : 'Intramuscular Injection Map',
            desc: isRTL ? 'دليل بصري وتوجيه حركي' : 'Visual guide & rotation map',
            page: Page.INJECTION
        },
        {
            icon: Activity,
            label: isRTL ? 'فارماسيم™ (المحاكي الحركي لنصف العمر)' : 'PharmaSim™ Half-Life Simulator',
            desc: isRTL ? 'تتبع تركيز الجرعات بالدم في الوقت الفعلي' : 'Track blood drug concentrations',
            page: Page.HALFLIFE
        },
    ];

    // Paid content items - available after payment
    const paidContentItems = [
        {
            icon: BookOpen,
            label: isRTL ? 'الكتاب الإلكتروني الذهبي الكامل' : 'Full Golden E-Book Guide',
            download: 'en' as 'en' | 'ar'
        },
        {
            icon: Sliders,
            label: isRTL ? 'الحاسبة الشاملة والجداول المتقدمة' : 'Master Calculator & Advanced Tables',
            page: Page.MASTER_CALCULATOR
        },
        {
            icon: Crown,
            label: isRTL ? 'محتوى الجينات والمصادر الحصرية' : 'Genetic & Exclusive Research',
            page: Page.GENETIC
        },
    ];

    // Tool icon/label metadata for the assessment history section
    const historyToolMeta: Record<string, { icon: typeof Calculator; label: string }> = {
        macro: { icon: Calculator, label: isRTL ? 'حاسبة الماكروز' : 'Macro Calculator' },
        bodyfat: { icon: Activity, label: isRTL ? 'حاسبة نسبة الدهون' : 'Body Fat' },
        injection: { icon: Syringe, label: isRTL ? 'خريطة الحقن' : 'Injection Map' },
        halflife: { icon: Activity, label: isRTL ? 'نصف العمر' : 'Half-Life' },
        genetic: { icon: Sparkles, label: isRTL ? 'الإمكانات الجينية' : 'Genetic' },
    };

    const formatHistorySummary = (entry: { tool: string; inputs: Record<string, unknown>; result: Record<string, unknown> }): string => {
        const r = entry.result || {};
        const i = entry.inputs || {};
        switch (entry.tool) {
            case 'macro':
                return `${r.calories ?? '?'} ${isRTL ? 'سعرة' : 'kcal'} · P ${r.protein ?? '?'}/C ${r.carbs ?? '?'}/F ${r.fats ?? '?'}`;
            case 'bodyfat':
                return `${isRTL ? 'نسبة الدهون' : 'Body Fat'} ${r.bodyFatPercentage ?? '?'}% · BMI ${r.bmi ?? '?'}`;
            case 'injection':
                return `${String(i.siteName ?? '')} · ${String(r.riskLevel ?? '')}`;
            case 'halflife':
                return `${isRTL ? 'عدد المركبات' : 'Compounds'}: ${Array.isArray(r.stack) ? r.stack.length : 0}`;
            case 'genetic':
                return `${isRTL ? 'طبيعي' : 'Natural'} ${r.natural ?? '?'} kg · ${isRTL ? 'معزز' : 'Enhanced'} ${r.enhanced ?? '?'} kg`;
            default:
                return JSON.stringify(r).slice(0, 120);
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 bg-black text-white selection:bg-gold-500 selection:text-black relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Ambient Background Glows */}
            <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-gold-500/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-0 start-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Top Header Bar ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/90 backdrop-blur-2xl border border-gold-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600"></div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group">
                            <div className="w-16 h-16 rounded-2xl border-2 border-gold-500 p-0.5 overflow-hidden bg-zinc-950 shadow-lg">
                                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <span className="absolute -bottom-1 -end-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" title="Online" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black text-white tracking-tight">{fullName}</h1>
                                <span className="text-xs bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                    @{username}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-2">
                                <span>{email}</span>
                                <span>•</span>
                                <span className="text-gold-400 font-bold">{roleLabel}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {/* Direct Link to Profile Page */}
                        <button
                            onClick={() => navigateTo(Page.PROFILE)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-gold-500/30 text-gold-400 hover:text-white font-bold text-xs rounded-xl transition-all shadow-md group"
                        >
                            <User className="w-4 h-4 text-gold-500 group-hover:scale-110 transition-transform" />
                            <span>{isRTL ? 'الملف الشخصي' : 'User Profile'}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all shadow-md hover:border-red-500/50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
                        </button>
                    </div>
                </motion.div>

                {/* ── Subscription Status Banner ────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${hasPaid
                            ? 'bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border-gold-500/40 text-gold-300'
                        }`}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl border ${hasPaid
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                                }`}>
                                {hasPaid ? <Crown className="w-8 h-8 animate-pulse" /> : <Lock className="w-8 h-8" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-black tracking-wide text-white">
                                        {hasPaid
                                            ? (isRTL ? 'اشتراكك المميز نشط (Premium VIP)' : 'Premium VIP Active')
                                            : (isRTL ? 'حساب مجاني (Free Access)' : 'Free Tier Account')
                                        }
                                    </h2>
                                    <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded-md ${hasPaid ? 'bg-emerald-500 text-black' : 'bg-gold-500 text-black'
                                        }`}>
                                        {planTier}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">
                                    {hasPaid
                                        ? (isRTL ? 'تمتلك وصولاً شاملاً لجميع الحاسبات المتقدمة والكتب والدراسات الحصرية.' : 'You have full unlimited access to all calculators, books, and exclusive tools.')
                                        : (isRTL ? 'يمكنك الترقية للاستفادة من الحاسبة الشاملة، الكتب الحصرية، والموارد الذهبية.' : 'Upgrade to unlock the Master Calculator, e-books, and exclusive resources.')
                                    }
                                </p>
                            </div>
                        </div>

                        {!hasPaid && (
                            <button
                                onClick={() => navigateTo(Page.CHECKOUT)}
                                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gold-500 to-yellow-400 hover:from-gold-400 hover:to-yellow-300 text-black font-black text-sm rounded-xl shadow-xl shadow-gold-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2 shrink-0"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{isRTL ? 'ترقية الحساب الآن' : 'Upgrade to Premium'}</span>
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* ── Complete Account Information Grid ────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
                >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gold-500/10 rounded-xl border border-gold-500/20 text-gold-500">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">{isRTL ? 'بيانات الحساب الكاملة' : 'Complete Account Information'}</h2>
                                <p className="text-xs text-zinc-400">{isRTL ? 'التفاصيل والبيانات المسجلة في النظام' : 'Registered user credentials and status'}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigateTo(Page.PROFILE)}
                            className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1.5 underline underline-offset-4"
                        >
                            <span>{isRTL ? 'تعديل البيانات' : 'Edit Profile'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Full Name */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <User className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'الاسم الكامل' : 'Full Name'}</span>
                            </div>
                            <p className="text-sm font-black text-white truncate">{fullName}</p>
                        </div>

                        {/* 2. Username */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <UserCheck className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'اسم المستخدم' : 'Username'}</span>
                            </div>
                            <p className="text-sm font-black text-gold-400 truncate">@{username}</p>
                        </div>

                        {/* 3. Email */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <Mail className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</span>
                            </div>
                            <p className="text-sm font-black text-white truncate" title={email}>{email}</p>
                        </div>

                        {/* 4. Phone Number */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <Phone className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</span>
                            </div>
                            <p className="text-sm font-black text-white truncate" dir="ltr">{phoneNumber}</p>
                        </div>

                        {/* 5. Role / Account Type */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <Layers className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'الصفة / الدور' : 'User Role'}</span>
                            </div>
                            <p className="text-sm font-black text-white truncate">{roleLabel}</p>
                        </div>

                        {/* 6. Join Date */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'تاريخ الانضمام' : 'Member Since'}</span>
                            </div>
                            <p className="text-sm font-black text-white truncate">{createdDate}</p>
                        </div>

                        {/* 7. Currency */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <DollarSign className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'العملة المعتمَدة' : 'Preferred Currency'}</span>
                            </div>
                            <p className="text-sm font-black text-white truncate">{currency}</p>
                        </div>

                        {/* 8. Subscription Status */}
                        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 hover:border-gold-500/30 transition-colors space-y-1">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                                <Crown className="w-3.5 h-3.5 text-gold-500" />
                                <span>{isRTL ? 'حالة الاشتراك' : 'Subscription'}</span>
                            </div>
                            <p className={`text-sm font-black truncate ${hasPaid ? 'text-green-400' : 'text-amber-400'}`}>
                                {hasPaid ? (isRTL ? 'مفعل (Premium VIP)' : 'Active (Premium)') : (isRTL ? 'مجاني (Free Plan)' : 'Free Plan')}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Tools & Content Dropdowns ────────────────────────────── */}
                <div className="space-y-6">

                    {/* Free Tools */}
                    <details className="group bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden transition-all shadow-xl" open>
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none bg-zinc-900 hover:bg-zinc-850">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20 text-green-500">
                                    <Unlock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">
                                        {isRTL ? 'الأدوات والمحتوى المجاني' : 'Free Tools & Content'}
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        {isRTL ? 'متاحة لجميع الأعضاء المسجلين' : 'Available for all registered members'}
                                    </p>
                                </div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gold-400 group-open:rotate-180 transition-transform" />
                        </summary>

                        <div className="p-6 pt-2 border-t border-zinc-800/60">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {freeContentItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigateTo(item.page)}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-gold-500/50 hover:bg-zinc-900 transition-all text-start group"
                                    >
                                        <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500 group-hover:scale-110 transition-transform shrink-0">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">{item.label}</h4>
                                            <p className="text-xs text-zinc-500">{item.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </details>

                    {/* Premium Content */}
                    <details className={`group border rounded-3xl overflow-hidden transition-all shadow-xl ${hasPaid ? 'bg-zinc-900/90 border-gold-500/40' : 'bg-zinc-900/50 border-zinc-800'}`} open={hasPaid}>
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none bg-zinc-900 hover:bg-zinc-850">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl border ${hasPaid ? 'bg-gold-500/20 border-gold-500/40 text-gold-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                    {hasPaid ? <Crown className="w-5 h-5 text-gold-500 animate-pulse" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className={`text-base font-black ${hasPaid ? 'text-gold-400' : 'text-zinc-400'}`}>
                                        {isRTL ? 'المحتوى والخدمات الحصرية (Premium)' : 'Premium Content & Services'}
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        {hasPaid
                                            ? (isRTL ? 'محتوى مخصص للمشتركين فقط' : 'Exclusive VIP content unlocked')
                                            : (isRTL ? 'يتطلب الترقية للحساب المدفوع' : 'Requires active VIP subscription')
                                        }
                                    </p>
                                </div>
                            </div>
                            {hasPaid && <ChevronDown className="w-5 h-5 text-gold-400 group-open:rotate-180 transition-transform" />}
                        </summary>

                        {hasPaid ? (
                            <div className="p-6 pt-2 border-t border-gold-500/20">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {paidContentItems.map((item, index) => (
                                        item.download ? (
                                            <button
                                                key={index}
                                                onClick={() => handleSecureDownload(item.download)}
                                                disabled={downloading !== null}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-gold-500/30 hover:border-gold-400 hover:bg-zinc-900 transition-all text-start group"
                                            >
                                                <div className="p-3 rounded-xl bg-gold-500/20 text-gold-400 group-hover:scale-110 transition-transform shrink-0">
                                                    {downloading === item.download ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Download className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">{item.label}</h4>
                                                    <p className="text-xs text-zinc-500">{isRTL ? 'تحميل آمن ومشفر' : 'Secure authenticated download'}</p>
                                                </div>
                                            </button>
                                        ) : (
                                            <button
                                                key={index}
                                                onClick={() => item.page && navigateTo(item.page)}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-gold-500/30 hover:border-gold-400 hover:bg-zinc-900 transition-all text-start group"
                                            >
                                                <div className="p-3 rounded-xl bg-gold-500/20 text-gold-400 group-hover:scale-110 transition-transform shrink-0">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">{item.label}</h4>
                                                    <p className="text-xs text-zinc-500">{isRTL ? 'أداة حصرية VIP' : 'VIP Exclusive Tool'}</p>
                                                </div>
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 pt-4 text-center space-y-4">
                                <p className="text-xs text-zinc-400 font-medium">
                                    {isRTL
                                        ? 'قم بالترقية الآن لفتح الكتاب الإلكتروني الكامل والحاسبة الشاملة وجداول المحترفين.'
                                        : 'Upgrade now to unlock the full e-book, master calculator, and pro tables.'}
                                </p>
                                <button
                                    onClick={() => navigateTo(Page.CHECKOUT)}
                                    className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-black font-black text-xs rounded-xl shadow-lg transition-all"
                                >
                                    {isRTL ? 'ترقية الحساب الآن' : 'Upgrade Account Now'}
                                </button>
                            </div>
                        )}
                    </details>
                </div>

                {/* ── Assessment & Calculator History ──────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
                >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gold-500/10 rounded-xl border border-gold-500/20 text-gold-500">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">{isRTL ? 'سجل التقييمات والحاسبات' : 'Assessment & Calculator History'}</h2>
                                <p className="text-xs text-zinc-400">{isRTL ? 'آخر النتائج المحفوظة من أدواتك تلقائياً' : 'Your latest auto-saved tool results'}</p>
                            </div>
                        </div>
                        <button
                            onClick={loadHistory}
                            className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                            <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
                        </button>
                    </div>

                    {historyLoading && history.length === 0 ? (
                        <div className="flex items-center justify-center gap-3 py-10 text-zinc-500">
                            <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
                            <p className="text-sm font-bold">{isRTL ? 'جاري تحميل السجل...' : 'Loading history...'}</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                            <History className="w-10 h-10 text-zinc-700 mx-auto" />
                            <p className="text-sm font-bold text-zinc-500">
                                {isRTL ? 'لا توجد نتائج محفوظة بعد' : 'No saved results yet'}
                            </p>
                            <p className="text-xs text-zinc-600">
                                {isRTL ? 'استخدم أي حاسبة وستُحفظ نتائجك هنا تلقائياً.' : 'Run any calculator and your results will be saved here automatically.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {history.map(entry => {
                                const meta = historyToolMeta[entry.tool] || { icon: Calculator, label: entry.tool };
                                const IconComp = meta.icon;
                                return (
                                    <div
                                        key={entry.id}
                                        className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-gold-500/30 transition-colors"
                                    >
                                        <div className="p-3 rounded-xl bg-gold-500/10 text-gold-500 shrink-0">
                                            <IconComp className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-sm font-bold text-white truncate">{entry.title || meta.label}</h4>
                                                <span className="text-[10px] text-zinc-500 font-bold shrink-0 uppercase">
                                                    {new Date(entry.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1 truncate">{formatHistorySummary(entry)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteHistory(entry.id)}
                                            aria-label={isRTL ? 'حذف السجل' : 'Delete entry'}
                                            className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
};

export default Dashboard;
