import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Zap, ShieldCheck, CreditCard } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { buildCheckoutPlansHref } from '../../shared/lib/checkoutPlan';

/**
 * CheckoutCtaSection
 * ─────────────────────────────────────────────────────────────────────────────
 * The homepage no longer renders plans, prices or the checkout modal. Billing
 * lives exclusively on the standalone `/checkout` route. This band is the single
 * bridge between the marketing page and that route — it carries no prices, no
 * cart state and no payment code.
 *
 * The `id="pricing"` anchor is kept so legacy deep links (#pricing), the sticky
 * CTA, the readiness quiz and AuthGuard still resolve to a visible section.
 */
const CheckoutCtaSection: React.FC = () => {
    const { content, isRTL, language, t } = usePreferences();

    const title = t('pricingTitle') || (isRTL ? 'اختر باقتك' : 'Choose Your Plan');
    const subtitle =
        t('pricingSubtitle') ||
        (isRTL
            ? 'كل الباقات والدفع الآمن متاحة الآن في صفحة منفصلة مخصصة لإتمام الطلب.'
            : 'All plans and secure payment now live on a dedicated checkout page.');

    const badges = [
        { icon: CreditCard, label: isRTL ? 'بطاقات · محافظ · InstaPay' : 'Cards · Wallets · InstaPay' },
        { icon: Zap, label: isRTL ? 'تسليم رقمي فوري' : 'Instant digital delivery' },
        { icon: ShieldCheck, label: isRTL ? 'دفع مشفّر وآمن' : 'Encrypted secure payment' },
    ];

    return (
        <section id="pricing" className="py-20 relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black uppercase tracking-widest text-xs">
                        <Lock className="w-4 h-4" />
                        {isRTL ? 'الدفع الآمن' : 'Secure Checkout'}
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        {title}
                    </h2>

                    <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-base leading-relaxed">
                        {subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href={buildCheckoutPlansHref(language === 'ar' ? 'ar' : 'en')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-black font-black text-lg shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            {isRTL ? 'الانتقال إلى صفحة الدفع' : 'Go to Checkout'}
                            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        </Link>
                        <span className="text-xs font-mono text-gold-500 tracking-widest uppercase opacity-80">
                            {isRTL ? 'الأسعار والباقات هناك' : 'Plans & pricing inside'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8 border-t border-zinc-800/70">
                        {badges.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                                <Icon className="w-3.5 h-3.5 text-gold-500" />
                                {label}
                            </div>
                        ))}
                    </div>

                    {content.pricingRequiresStats && (
                        <p className="text-[10px] text-zinc-600 font-bold">{content.pricingRequiresStats}</p>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default CheckoutCtaSection;
