'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, BookOpen, ShieldCheck, Truck, Sparkles, MapPin, Check } from 'lucide-react';
import { Button } from '../shared/ui/button';
import { Card, CardContent } from '../shared/ui/card';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import { supabase } from '../shared/lib/supabase';
import { toast } from 'sonner';

interface SuccessPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ navigateTo }) => {
    const { isRTL } = usePreferences();
    const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Shipping state for physical/bundle orders
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        city: '',
        address: '',
        notes: '',
    });
    const [shippingSubmitted, setShippingSubmitted] = useState(false);
    const [savingShipping, setSavingShipping] = useState(false);

    useEffect(() => {
        console.debug("Payment Success Page Mounted");

        // ─── READ URL PARAMS FOR DIRECT PAYMENT PAGES (Kashier) ───────────
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const planFromUrl = urlParams.get('plan_id');
            if (planFromUrl) {
                setSubscriptionTier(planFromUrl);
            }
        } catch {
            // URL search params might fail in non-browser env
        }

        // ─── CLEAN LOCAL STATE ────────────────────────────────────────────
        try {
            sessionStorage.removeItem('checkout_state');
            sessionStorage.removeItem('payment_intent');
            sessionStorage.removeItem('spaceremit_code');
            localStorage.removeItem('pending_payment');
            localStorage.removeItem('checkout_form_data');
        } catch {
            // Storage might not be available
        }

        // ─── FETCH FRESH PROFILE FROM SUPABASE ───────────────────────────
        let pollAttempts = 0;
        const MAX_POLL_ATTEMPTS = 6;
        const POLL_INTERVAL_MS = 1500;
        let stopPolling = false;

        const fetchFreshProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setUserEmail(user.email || null);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_tier, has_paid, plan_tier, subscription_status, full_name, phone, shipping_address')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const activeTier = profile.subscription_tier || profile.plan_tier;
                    if (activeTier) {
                        setSubscriptionTier(activeTier);
                    }
                    if (profile.shipping_address) {
                        setShippingSubmitted(true);
                    } else if (profile.full_name || profile.phone) {
                        setShippingAddress(prev => ({
                            ...prev,
                            fullName: profile.full_name || '',
                            phone: profile.phone || '',
                        }));
                    }

                    if (profile.subscription_status === 'active' || profile.has_paid === true) {
                        stopPolling = true;
                    }
                }
            } catch (error) {
                console.warn('⚠️ [SuccessPage] Could not fetch fresh profile:', error);
            }
        };

        fetchFreshProfile();
        const pollTimer = setInterval(() => {
            pollAttempts += 1;
            if (stopPolling || pollAttempts >= MAX_POLL_ATTEMPTS) {
                clearInterval(pollTimer);
                return;
            }
            fetchFreshProfile();
        }, POLL_INTERVAL_MS);

        return () => {
            stopPolling = true;
            clearInterval(pollTimer);
        };
    }, []);

    const requiresShipping = subscriptionTier === 'bundle' || subscriptionTier === 'coaching' || subscriptionTier?.includes('bundle') || subscriptionTier?.includes('coaching');

    const handleSaveShipping = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
            toast.error(isRTL ? 'يرجى إكمال جميع حقول العنوان الأساسية' : 'Please complete all required shipping fields');
            return;
        }

        setSavingShipping(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('profiles')
                    .update({
                        shipping_address: shippingAddress,
                        full_name: shippingAddress.fullName,
                        phone: shippingAddress.phone,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.id);
            }
            setShippingSubmitted(true);
            toast.success(isRTL ? 'تم حفظ عنوان الشحن بنجاح! سيتم التواصل معك عبر الواتساب لتأكيد الشحن.' : 'Shipping address saved! You will receive a WhatsApp confirmation.');
        } catch (err) {
            console.error('Error saving shipping address:', err);
            toast.error(isRTL ? 'حدث خطأ أثناء حفظ العنوان، يمكنك إرساله للدعم الفني.' : 'Failed to save address, please contact support.');
        } finally {
            setSavingShipping(false);
        }
    };

    return (
        <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-black overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-2xl w-full relative z-10"
            >
                <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-2xl border-2 overflow-hidden shadow-2xl">
                    <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 animate-shimmer" />
                    <CardContent className="p-8 md:p-12 text-center space-y-8">
                        <motion.div
                            initial={{ rotate: -10, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20"
                        >
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </motion.div>

                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                {isRTL ? "تم بنجاح! تم تأكيد طلبك" : "PAYMENT CONFIRMED!"}
                            </h1>
                            <p className="text-zinc-300 font-medium leading-relaxed">
                                {isRTL
                                    ? `تهانينا! تم تفعيل اشتراكك في بروتوكول مستر إكس${subscriptionTier ? ` (${subscriptionTier.toUpperCase()})` : ''} بنجاح.`
                                    : `Congratulations! Your subscription to Mr. X protocols${subscriptionTier ? ` (${subscriptionTier.toUpperCase()})` : ''} is active.`}
                            </p>
                        </div>

                        {/* خطوة جمع عنوان الشحن إذا كانت الباقة تتضمن شحناً */}
                        {requiresShipping && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-black/60 border border-amber-500/30 text-start space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white">
                                            {isRTL ? "📦 تأكيد بيانات شحن النسخة المطبوعة" : "📦 Physical Book Shipping Details"}
                                        </h3>
                                        <p className="text-xs text-zinc-400 font-bold">
                                            {isRTL ? "باقاتك تشمل نسخة مطبوعة فاخرة. يرجى تزويدنا بعنوان التوصيل داخل مصر:" : "Your tier includes the physical edition. Provide delivery address in Egypt:"}
                                        </p>
                                    </div>
                                </div>

                                {shippingSubmitted ? (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm font-bold">
                                        <Check className="w-5 h-5 shrink-0" />
                                        <span>{isRTL ? "تم استلام عنوان الشحن بنجاح، جاري تحضير الشحنة للتسليم." : "Shipping address confirmed, package is being prepared for dispatch."}</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSaveShipping} className="space-y-3 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                                                    {isRTL ? "الاسم الكامل للمستلم" : "Full Name"}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingAddress.fullName}
                                                    onChange={e => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-gold-500 outline-none"
                                                    placeholder={isRTL ? "الاسم ثلاثي" : "Recipient Full Name"}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                                                    {isRTL ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={shippingAddress.phone}
                                                    onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-gold-500 outline-none"
                                                    placeholder="01xxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                                                    {isRTL ? "المحافظة / المدينة" : "City / Governorate"}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingAddress.city}
                                                    onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-gold-500 outline-none"
                                                    placeholder={isRTL ? "القاهرة / الإسكندرية / إلخ" : "Cairo / Alex / etc."}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-zinc-400 mb-1 block">
                                                    {isRTL ? "العنوان التفصيلي" : "Full Address"}
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={shippingAddress.address}
                                                    onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-gold-500 outline-none"
                                                    placeholder={isRTL ? "اسم الشارع، رقم العمارة، رقم الشقة" : "Street name, building, apt"}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={savingShipping}
                                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            <span>{savingShipping ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'تأكيد وحفظ عنوان الشحن' : 'Confirm Shipping Address')}</span>
                                        </Button>
                                    </form>
                                )}
                            </motion.div>
                        )}

                        {/* بطاقات المزايا المفتوحة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-start space-y-2">
                                <div className="flex items-center gap-2 text-gold-500">
                                    <Download className="w-5 h-5" />
                                    <p className="text-xs font-black uppercase tracking-widest">{isRTL ? "النسخة الرقمية والملفات" : "Digital Files & E-Book"}</p>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-bold">{isRTL ? "كتاب PDF عالي الدقة + حاسبة الجرعات الذكية متاحة في حسابك." : "High-Res PDF Book + Smart Calculators ready in your library."}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-start space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Sparkles className="w-5 h-5" />
                                    <p className="text-xs font-black uppercase tracking-widest">{isRTL ? "المزايا المتقدمة والدعم" : "Premium Tier Perks"}</p>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-bold">
                                    {subscriptionTier === 'coaching' || subscriptionTier?.includes('plus')
                                        ? (isRTL ? "تم فتح مسار التدريب الشخصي والمتابعة الخاصة." : "1-on-1 Coaching and private consultation unlocked.")
                                        : (isRTL ? "وصول كامل للأدوات الرقمية والمجتمع الرياضي." : "Full access to digital tools and athlete community.")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="w-full py-7 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.2)] group"
                            >
                                <BookOpen className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" />
                                {isRTL ? "الدخول للمكتبة وتحميل الملفات" : "ENTER LIBRARY & DOWNLOAD FILES"}
                                <ArrowRight className={`ml-2 w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                            </Button>

                            <button
                                onClick={() => navigateTo(Page.HOME)}
                                className="text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors duration-300"
                            >
                                {isRTL ? "العودة للرئيسية" : "BACK TO HOME"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default SuccessPage;

