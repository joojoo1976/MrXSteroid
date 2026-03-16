import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, BookOpen, ShieldCheck } from 'lucide-react';
import { Button } from '../shared/ui/button';
import { Card, CardContent } from '../shared/ui/card';
import { Page, ContentStrings } from '@/shared/types/types';
import { usePreferences } from '../context/PreferencesContext';
import { supabase } from '../shared/lib/supabase';

interface SuccessPageProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();
    const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

    useEffect(() => {
        console.debug("Payment Success Page Mounted");

        // ─── CLEAN LOCAL STATE ────────────────────────────────────────────
        // Clear any cached checkout/payment state so the app reflects fresh data
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
        // This ensures the UI immediately reflects the activated subscription
        const fetchFreshProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_tier, has_paid, plan_tier, subscription_status')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setSubscriptionTier(profile.subscription_tier || profile.plan_tier);
                    console.log('✅ [SuccessPage] Fresh profile loaded:', {
                        tier: profile.subscription_tier,
                        hasPaid: profile.has_paid,
                        status: profile.subscription_status,
                    });
                }
            } catch (error) {
                console.warn('⚠️ [SuccessPage] Could not fetch fresh profile:', error);
            }
        };

        fetchFreshProfile();
    }, []);

    return (
        <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-black overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-xl w-full relative z-10"
            >
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-2xl border-2 overflow-hidden shadow-2xl">
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

                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                {isRTL ? "تم بنجاح! شكراً لك" : "PAYMENT SUCCESSFUL!"}
                            </h1>
                            <p className="text-zinc-400 font-medium leading-relaxed">
                                {isRTL
                                    ? "تم تفعيل اشتراكك في بروتوكول مستر إكس. ستصلك رسالة تأكيد عبر الواتساب فوراً."
                                    : "Your subscription to the Mr. X protocols has been activated. A welcome WhatsApp message is on its way."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
                                <Download className="w-5 h-5 text-gold-500" />
                                <p className="text-xs font-black text-white uppercase tracking-widest">{isRTL ? "تحميل فوري" : "Instant Access"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold">{isRTL ? "رابط التحميل مُتاح الآن" : "Download link is ready"}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-2">
                                <ShieldCheck className="w-5 h-5 text-gold-500" />
                                <p className="text-xs font-black text-white uppercase tracking-widest">{isRTL ? "بروتوكول محمي" : "Secured Protocol"}</p>
                                <p className="text-[10px] text-zinc-500 font-bold">{isRTL ? "تشفير عالي المستوى" : "High-level encryption"}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <Button
                                onClick={() => navigateTo(Page.DASHBOARD)}
                                className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.2)] group"
                            >
                                <BookOpen className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" />
                                {isRTL ? "الدخول للمكتبة" : "ENTER ELITE DASHBOARD"}
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
