'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Lock } from 'lucide-react';
import { Card, CardContent } from '../../shared/ui/card';
import { cn } from '../../shared/lib/utils';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useCheckout } from '../../features/checkout/hooks/useCheckout';
import { useInstapayReceipt } from '../../features/checkout/hooks/useInstapayReceipt';
import { env } from '../../config/env';
import { StripePaymentElement, type StripePaymentElementHandle } from './StripePaymentElement';
import { CheckoutRegionCard } from './components/CheckoutRegionCard';
import { CheckoutBillingCard } from './components/CheckoutBillingCard';
import { CheckoutPromoCard } from './components/CheckoutPromoCard';
import { CheckoutPaymobHiddenMethods } from './components/CheckoutPaymobHiddenMethods';
import { CheckoutInstapayMethod } from './components/CheckoutInstapayMethod';
import { CheckoutHiddenPaypalMethod } from './components/CheckoutHiddenPaypalMethod';
import { CheckoutGlobalMethods } from './components/CheckoutGlobalMethods';
import { CheckoutPaymentFooter } from './components/CheckoutPaymentFooter';
import type { CheckoutFormProps } from './checkoutFormTypes';

export type { NewPricingTier, CheckoutFormProps } from './checkoutFormTypes';

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
    content,
    lang,
    selectedTier,
    productVariant,
    isEg: isEgProp,
    onLocationChange,
    onShippingChange,
    onDiscountChange,
    totalAmount,
    quantity,
    onSuccess,
    openLegal
}) => {
    const { unitSystem, language: prefLang, formatPrice } = usePreferences();
    const isAr = prefLang === 'ar';
    const isImperial = unitSystem === 'imperial';

    const { user, profileData, isAuthenticated } = useAuth();
    const instapayReceipt = useInstapayReceipt(isAr);

    const checkout = useCheckout({
        content,
        lang,
        selectedTier,
        totalAmount,
        productVariant,
        isEg: isEgProp,
        onLocationChange,
        onDiscountChange,
        quantity,
        userId: user?.id,
        userEmail: user?.email,
        userName: profileData?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
        instapayRef: instapayReceipt.ref,
        instapayFile: instapayReceipt.file,
        onInstaPaySuccess: (orderRef) => {
            window.location.assign(`/payment-pending?gateway=instapay&txn=${encodeURIComponent(orderRef)}`);
        },
    });

    const { form, paymobMethod, setPaymobMethod, selectedShipping, stripeClientSecret, stripeInvoiceId, isStripeReady, setIsStripeReady, setPaymentError } = checkout;
    const { watch, setValue } = form;
    const stripePaymentRef = useRef<StripePaymentElementHandle>(null);
    const stripePublishableKey = env.STRIPE_PUBLISHABLE_KEY || '';
    const isStripeSelected = paymobMethod === 'stripe';

    // Auto-fill authenticated user data
    useEffect(() => {
        if (isAuthenticated && user && user.email) {
            const currentEmail = watch('email');
            if (!currentEmail) {
                setValue('email', user.email, { shouldValidate: true });
            }

            const currentFullName = watch('fullName');
            if (!currentFullName) {
                const fullName = profileData?.full_name
                    || user.user_metadata?.full_name
                    || user.user_metadata?.name
                    || '';
                if (fullName) {
                    setValue('fullName', fullName, { shouldValidate: true });
                }
            }
        }
    }, [isAuthenticated, user, profileData, setValue, watch]);

    // Notify parent about shipping cost changes
    useEffect(() => {
        if (onShippingChange) {
            onShippingChange(selectedShipping?.price || 0);
        }
    }, [selectedShipping, onShippingChange]);

    return (
        <form onSubmit={checkout.onSubmit} className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>

            {/* ════════════════════════════════════════════════════════════
                1. REGION / LOCATION TOGGLE (داخل مصر 🇪🇬 / خارج مصر 🌍)
            ════════════════════════════════════════════════════════════ */}
            <CheckoutRegionCard isAr={isAr} checkout={checkout} />

            {/* ════════════════════════════════════════════════════════════
                2. BILLING & CUSTOMER DETAILS
            ════════════════════════════════════════════════════════════ */}
            <CheckoutBillingCard
                content={content}
                isAr={isAr}
                isImperial={isImperial}
                isEg={isEgProp}
                selectedTier={selectedTier}
                formatPrice={formatPrice}
                checkout={checkout}
            />

            {/* ════════════════════════════════════════════════════════════
                PROMO CODE CARD
            ════════════════════════════════════════════════════════════ */}
            <CheckoutPromoCard isAr={isAr} isEg={isEgProp} checkout={checkout} />

            {/* ════════════════════════════════════════════════════════════
                3. CONDITIONAL PAYMOB PAYMENT GATEWAYS (بوابة Paymob)
            ════════════════════════════════════════════════════════════ */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="text-gold-500">03.</span>
                    {isAr ? "اختر طريقة الدفع المناسبة" : "Select Payment Method"}
                </h3>

                <Card id="checkout-payment-methods" className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl border-2 overflow-hidden shadow-2xl scroll-mt-32">
                    <CardContent className="p-6 space-y-5">

                        {/* LOCAL EGYPT PAYMENT METHODS (داخل مصر 🇪🇬) */}
                        {isEgProp ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                                        🇪🇬 {isAr ? "وسائل الدفع المحلية المتاحة في مصر (EGP)" : "Local Egypt Payment Methods (EGP)"}
                                    </span>
                                </div>

                                {/* Option 1: Kashier Egypt (كاشير مصر) */}
                                <motion.div
                                    id="checkout-method-kashier"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('kashier')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'kashier'
                                            ? "border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'kashier' ? "bg-amber-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "كاشير / بطاقة بنكية ومحافظ (Kashier)" : "Kashier Online Card & Payments"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع آمن بالفيزا، ماستركارد، ميزة عبر كاشير (EGP)" : "Visa, Mastercard & Meeza via Kashier in EGP"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                            Kashier
                                        </span>
                                        {paymobMethod === 'kashier' && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                                    </div>
                                </motion.div>

                                {/* HIDING PAYMOB METHODS TEMPORARILY */}
                                {false && (
                                    <CheckoutPaymobHiddenMethods
                                        isAr={isAr}
                                        checkout={checkout}
                                        cardId="checkout-method-card"
                                        walletId="checkout-method-wallet"
                                        kioskId="checkout-method-kiosk"
                                    />
                                )}

                                {/* Option 4: InstaPay Instant Bank Transfer (إنستاباي) */}
                                <CheckoutInstapayMethod isAr={isAr} checkout={checkout} receipt={instapayReceipt} />
                            </div>
                        ) : (
                            /* INTERNATIONAL PAYMENT METHOD (خارج مصر 🌍) */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                                        🌍 {isAr ? "وسيلة الدفع الدولية المتاحة (USD)" : "International Payment Gateway (USD)"}
                                    </span>
                                </div>

                                {/* HIDING PAYMOB METHODS TEMPORARILY */}
                                {false && (
                                    <CheckoutHiddenPaypalMethod isAr={isAr} checkout={checkout} id="checkout-method-paypal" />
                                )}

                                <CheckoutGlobalMethods isAr={isAr} checkout={checkout} />
                            </div>
                        )}

                        {/* Stripe PaymentElement — shown after client secret is generated */}
                        {isStripeSelected && (
                            <div id="checkout-stripe-element" className="pt-2 border-t border-zinc-800">
                                {stripeClientSecret ? (
                                    stripePublishableKey ? (
                                        <StripePaymentElement
                                            ref={stripePaymentRef}
                                            clientSecret={stripeClientSecret}
                                            publishableKey={stripePublishableKey}
                                            locale={isAr ? 'ar' : 'en'}
                                            successUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/success?txn=${stripeInvoiceId || ''}`}
                                            onReady={() => setIsStripeReady(true)}
                                            onError={(msg) => {
                                                setPaymentError(isAr ? `فشل الدفع: ${msg}` : `Payment failed: ${msg}`);
                                            }}
                                        />
                                    ) : (
                                        <p className="text-xs text-red-400 font-bold">
                                            {isAr ? "Stripe غير مكوّن. أضف VITE_STRIPE_PUBLISHABLE_KEY في المتغيرات البيئية." : "Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to environment variables."}
                                        </p>
                                    )
                                ) : (
                                    <p className="text-xs text-zinc-400 font-medium">
                                        {isAr ? "اضغط زر الدفع أدناه لتجهيز جلسة دفع آمنة عبر Stripe." : "Press the pay button below to start a secure Stripe checkout session."}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Security Notice */}
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 mt-4">
                            <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-green-400 font-medium leading-relaxed">
                                {isStripeSelected
                                    ? (isAr
                                        ? "مدفوعات Stripe محمية بتشفير 256-bit SSL ومتوافقة مع PCI-DSS Level 1. لا يتم تخزين بيانات بطاقتك على خوادمنا إطلاقاً."
                                        : "Payments are secured via Stripe 256-bit SSL encryption and PCI-DSS Level 1 compliance. Your card details never touch our servers.")
                                    : paymobMethod === 'kashier'
                                        ? (isAr
                                            ? "كل المعاملات مؤمّنة عبر كاشير بتشفير 256-bit SSL وامتثال PCI-DSS. سيتم تحويلك مباشرة إلى صفحة الدفع الآمنة."
                                            : "All transactions are secured via Kashier 256-bit SSL encryption and PCI-DSS compliance. You will be redirected directly to the secure Kashier checkout page.")
                                        : paymobMethod === 'instapay'
                                            ? (isAr
                                                ? "جميع المعاملات مؤمّنة عبر إنستاباي بتشفير 256-bit SSL. سيتم تحويلك مباشرة إلى صفحة دفع إنستاباي الآمنة."
                                                : "All transactions are secured via InstaPay 256-bit SSL encryption. You will be redirected directly to the secure InstaPay checkout page.")
                                            : (isAr
                                            ? "جميع المعاملات تتم عبر مشفرات Paymob المعتمدة بنظام 256-bit SSL. يتم توليد رابط عملية الدفع المباشر فور الضغط على الزر أدناه."
                                            : "All transactions are secured via Paymob 256-bit SSL encryption. You will be redirected directly to your selected Paymob checkout page.")}
                            </p>
                        </div>
                    </CardContent>

                    <CheckoutPaymentFooter
                        content={content}
                        isAr={isAr}
                        checkout={checkout}
                        stripePaymentRef={stripePaymentRef}
                        onSuccess={onSuccess}
                        openLegal={openLegal}
                    />
                </Card>
            </div>
        </form>
    );
};

export default CheckoutForm;
