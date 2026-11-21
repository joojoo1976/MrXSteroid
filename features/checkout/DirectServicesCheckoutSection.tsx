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
 *  • The section is rendered only when the server resolves
 *    KASHIER_SERVICE_LINKS_VERIFIED === 'true'. The flag controls visibility
 *    only; it is not a payment decision.
 *  • Each button runs the invoice-first flow: quote → create-invoice →
 *    create-session. No direct `liveUrl` is opened.
 *  • These cards are a separate checkout path — they do NOT integrate with
 *    the main CheckoutForm and collect only the minimum customer fields.
 *  • No shipping, no cart line merging with Fourthwall products.
 *  • Settlement currency notice is displayed to avoid ambiguity.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Stethoscope, Check, ShieldAlert, Loader2 } from 'lucide-react';
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
    // The server-resolved visibility flag is the only guard; payment itself is
    // decided by invoice/session state, never by the link configuration.
    const coachingLink = getKashierServicePaymentLink('coaching_addon');
    const consultationLink = getKashierServicePaymentLink('consultation');

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const serviceSku = (serviceId: 'coaching_addon' | 'consultation') =>
        serviceId === 'coaching_addon' ? 'vip_coaching' : 'consultation';

    const startServiceCheckout = async (serviceId: 'coaching_addon' | 'consultation') => {
        if (isSubmitting) return;
        setCheckoutError(null);
        setIsSubmitting(true);

        try {
            const cart = {
                region: 'GLOBAL' as const,
                lines: [{ sku: serviceSku(serviceId), quantity: 1 }],
            };

            const quoteRes = await fetch('/api/checkout/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart),
            });
            const quote = await quoteRes.json().catch(() => null);
            if (!quoteRes.ok || !quote?.quote_token) {
                throw new Error(quote?.error || 'Could not build the service quote.');
            }

            const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `svc-${Date.now()}-${Math.random().toString(36).slice(2)}`;

            const invoiceRes = await fetch('/api/payments/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey,
                },
                body: JSON.stringify({
                    quote_token: quote.quote_token,
                    cart,
                    customer: { email: email.trim(), fullName: fullName.trim() },
                    paymentMethod: 'kashier',
                }),
            });
            const invoice = await invoiceRes.json().catch(() => null);
            if (!invoiceRes.ok || !invoice?.invoiceId) {
                throw new Error(invoice?.error || 'Could not create the service invoice.');
            }

            const sessionRes = await fetch('/api/payments/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceId: invoice.invoiceId }),
            });
            const session = await sessionRes.json().catch(() => null);
            if (!sessionRes.ok || !session?.sessionUrl) {
                throw new Error(session?.error || 'Could not start the payment session.');
            }

            window.location.assign(session.sessionUrl);
        } catch (error) {
            setCheckoutError(error instanceof Error ? error.message : 'Checkout failed.');
            setIsSubmitting(false);
        }
    };

    const canSubmit = email.trim().length > 3 && fullName.trim().length > 1 && !isSubmitting;

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
                        ? 'هذه خدمات مستقلة تُفوتر داخليًا أولًا، ثم يُفتح الدفع الآمن. لا يمكن دمجها مع الكتب في سلة واحدة.'
                        : 'Standalone services are invoiced internally first, then secure payment opens. They cannot be combined with book orders in a single cart.'
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

            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-[11px] font-bold text-zinc-400">
                    {isAr ? 'الاسم الكامل' : 'Full name'}
                    <input
                        type="text"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        autoComplete="name"
                        className="mt-1 w-full rounded-xl border border-zinc-700 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60"
                    />
                </label>
                <label className="text-[11px] font-bold text-zinc-400">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        className="mt-1 w-full rounded-xl border border-zinc-700 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60"
                    />
                </label>
            </div>
            {checkoutError && (
                <p className="mb-4 text-xs font-bold text-red-400">{checkoutError}</p>
            )}

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
                                ${coachingLink.amount.toFixed(2)} <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">USD</span>
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
                        <button
                            type="button"
                            onClick={() => startServiceCheckout('coaching_addon')}
                            disabled={!canSubmit}
                            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                            <span>{isAr ? 'المتابعة إلى الدفع الآمن' : 'Continue to secure checkout'}</span>
                        </button>
                        <p className="text-[9px] text-zinc-500 text-center mt-1.5">
                            {isAr ? 'فاتورة داخلية ثم صفحة دفع آمنة.' : 'Internal invoice, then a secure payment page.'}
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
                                ${consultationLink.amount.toFixed(2)} <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">USD</span>
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
                        <button
                            type="button"
                            onClick={() => startServiceCheckout('consultation')}
                            disabled={!canSubmit}
                            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Stethoscope className="w-3.5 h-3.5" />}
                            <span>{isAr ? 'المتابعة إلى الدفع الآمن' : 'Continue to secure checkout'}</span>
                        </button>
                        <p className="text-[9px] text-zinc-500 text-center mt-1.5">
                            {isAr ? 'فاتورة داخلية ثم صفحة دفع آمنة.' : 'Internal invoice, then a secure payment page.'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DirectServicesCheckoutSection;
