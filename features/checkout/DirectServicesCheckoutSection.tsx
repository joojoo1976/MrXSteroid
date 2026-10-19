'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  features/checkout/DirectServicesCheckoutSection.tsx
 *
 *  Renders the two direct-pay Kashier service cards (VIP Coaching $349.99 USD
 *  and Custom Consultation $30.00 USD) inside the /checkout flow.
 *
 *  DESIGN CONTRACT:
 *  ─────────────────────────────────────────────────────────────────────────
 *  • These services are GLOBAL-USD-only. Egypt EGP flow is always hidden.
 *  • Each button is DISABLED with the message
 *    "الدفع غير متاح مؤقتًا — سيتم التفعيل قريبًا" unless
 *    KASHIER_SERVICE_LINKS_VERIFIED === 'true' AND a URL is configured.
 *  • No redirect is performed if the link is UNVERIFIED or NOT_CONFIGURED —
 *    fail-closed behaviour is enforced server-side and mirrored here.
 *  • The section is only rendered when the customer selects the GLOBAL
 *    region (isEg === false), preventing Egyptian customers from seeing
 *    USD-only service links.
 *  • These cards are a separate checkout path — they do NOT integrate with
 *    the main CheckoutForm (name, email, payment method). The customer is
 *    redirected to Kashier's hosted payment page.
 *  • No shipping, no cart line merging with Fourthwall products.
 *  • Settlement currency notice is displayed to avoid ambiguity.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Stethoscope, Check, AlertCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import { getKashierServicePaymentLink } from '../../server/payments/paymentLinkConfig';

interface DirectServicesCheckoutSectionProps {
    isAr: boolean;
}

export const DirectServicesCheckoutSection: React.FC<DirectServicesCheckoutSectionProps> = ({
    isAr,
}) => {
    // These are server-side calls. In client components (App Router), environment
    // variables prefixed NEXT_PUBLIC_ are available at build time. The
    // `getKashierServicePaymentLink` function reads process.env so it resolves
    // server-side during SSR; on the client the result is the serialised output.
    // The status check is the guard — no link is ever opened if UNVERIFIED.
    const coachingLink = getKashierServicePaymentLink('coaching_addon');
    const consultationLink = getKashierServicePaymentLink('consultation');

    const isCoachingActive = coachingLink.status === 'CONFIGURED';
    const isConsultationActive = consultationLink.status === 'CONFIGURED';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8 pt-8 border-t border-zinc-800"
        >
            {/* Section header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-gold-500 text-xl font-black">04.</span>
                    <h3 className="text-xl font-black text-white">
                        {isAr ? 'الخدمات الاستشارية المباشرة (اختياري)' : 'Direct Professional Services (Optional)'}
                    </h3>
                </div>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    {isAr
                        ? 'هذه خدمات مستقلة تحتاج إلى جلسة دفع منفصلة عبر كاشير. لا يمكن دمجها مع الكتب في سلة واحدة.'
                        : 'These are standalone services requiring a separate Kashier checkout. They cannot be combined with book orders in a single cart.'
                    }
                </p>
                <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-300 font-medium leading-relaxed">
                        {isAr
                            ? '⚠️ الرسوم تُحصّل بالدولار الأمريكي للعميل. تخضع التسوية المصرفية لضوابط حساب التاجر لدى بوابة الدفع. يُعرض المبلغ بـ USD والتسوية وفق اتفاقية التاجر.'
                            : '⚠️ Charges billed in USD to buyer. Merchant settlement follows provider banking rules and may differ from displayed currency.'
                        }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── VIP Coaching Card ────────────────────────────────────── */}
                <div className="bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                                <Crown className="w-5 h-5" />
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                {isAr ? 'دورة كاملة' : 'Full Cycle'}
                            </span>
                        </div>

                        <h4 className="text-base font-black text-white mb-1">
                            {isAr ? 'تدريب شخصي 1-على-1 (دورة كاملة)' : 'VIP 1-on-1 Cycle Coaching'}
                        </h4>
                        <p className="text-xs text-zinc-400 mb-3">
                            {isAr
                                ? 'إشراف وتوجيه مباشر وتعديل أسبوعي للجرعات والمؤشرات الحيوية.'
                                : 'Direct expert oversight with weekly adjustments and health monitoring.'}
                        </p>

                        <div className="mb-4 p-3 bg-black/40 rounded-xl border border-zinc-800">
                            <div className="text-2xl font-black text-white tracking-tight">
                                $349.99 <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">USD</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                                {isAr ? 'دفعة واحدة لكامل مدة الدورة + المتابعة' : 'Single payment for entire cycle duration'}
                            </div>
                        </div>

                        <ul className="space-y-2 mb-4 text-xs text-zinc-300">
                            <li className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isAr ? 'متابعة دورية عبر تيليجرام / واتساب' : 'Direct weekly check-ins via dedicated channel'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isAr ? 'تحليل معمق لفحوصات الدم' : 'Comprehensive bloodwork reviews'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{isAr ? 'تصميم بروتوكول الخروج الآمن (PCT)' : 'Custom Safe-Exit PCT design'}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        {isCoachingActive ? (
                            <a
                                href={coachingLink.liveUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{isAr ? 'حجز التدريب الشخصي الآن' : 'Enroll in VIP Coaching'}</span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-3 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                            >
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>{isAr ? 'الدفع غير متاح مؤقتًا — سيتم التفعيل قريبًا' : 'Payment temporarily unavailable — Activating soon'}</span>
                            </button>
                        )}
                        <p className="text-[9px] text-zinc-500 text-center mt-1.5">
                            {coachingLink.verificationNotice}
                        </p>
                    </div>
                </div>

                {/* ── Consultation Card ──────────────────────────────────────── */}
                <div className="bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between shadow-lg">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                                <Stethoscope className="w-5 h-5" />
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                {isAr ? 'جلسة واحدة' : 'Single Session'}
                            </span>
                        </div>

                        <h4 className="text-base font-black text-white mb-1">
                            {isAr ? 'جلسة تقييم واستشارة مخصصة' : 'Custom Consultation & Assessment'}
                        </h4>
                        <p className="text-xs text-zinc-400 mb-3">
                            {isAr
                                ? 'مراجعة ملفك الصحي وتحاليلك الطبية ووضع خطة تصحيحية محكمة.'
                                : 'Single comprehensive assessment covering bloodwork & protocols.'}
                        </p>

                        <div className="mb-4 p-3 bg-black/40 rounded-xl border border-zinc-800">
                            <div className="text-2xl font-black text-white tracking-tight">
                                $30.00 <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">USD</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                                {isAr ? 'جلسة تقييم تفصيلية شاملة' : 'Single comprehensive assessment session'}
                            </div>
                        </div>

                        <ul className="space-y-2 mb-4 text-xs text-zinc-300">
                            <li className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{isAr ? 'مراجعة تحاليل الدم وتحديد الخلل الهرموني' : 'In-depth blood panel diagnostic review'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{isAr ? 'إرشادات موازنة الإستروجين والبرولاكتين' : 'Estrogen & prolactin balance remediation'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{isAr ? 'تقرير مكتوب بالتوصيات وخطة العمل' : 'Detailed written recommendations & action plan'}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        {isConsultationActive ? (
                            <a
                                href={consultationLink.liveUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{isAr ? 'حجز جلسة الاستشارة الآن' : 'Book Consultation Session'}</span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full py-3 px-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                            >
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>{isAr ? 'الدفع غير متاح مؤقتًا — سيتم التفعيل قريبًا' : 'Payment temporarily unavailable — Activating soon'}</span>
                            </button>
                        )}
                        <p className="text-[9px] text-zinc-500 text-center mt-1.5">
                            {consultationLink.verificationNotice}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DirectServicesCheckoutSection;
