'use client';

import { Button } from '../../../shared/ui/button';
import { CardFooter } from '../../../shared/ui/card';
import { Checkbox } from '../../../shared/ui/checkbox';
import { AlertCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';
import type { CheckoutController } from '../checkoutFormTypes';
import type { StripePaymentElementHandle } from '../StripePaymentElement';
import type { ContentStrings } from '@/shared/types/types';

interface CheckoutPaymentFooterProps {
    content: ContentStrings;
    isAr: boolean;
    checkout: CheckoutController;
    stripePaymentRef: React.RefObject<StripePaymentElementHandle | null>;
    onSuccess: () => void;
    openLegal?: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}

export function CheckoutPaymentFooter({
    content,
    isAr,
    checkout,
    stripePaymentRef,
    onSuccess,
    openLegal,
}: CheckoutPaymentFooterProps) {
    const {
        form: { watch, setValue, formState: { errors } },
        paymentError,
        isProcessing,
        isRedirecting,
        paymobMethod,
        formattedTotal,
        stripeClientSecret,
        isStripeReady,
        setIsProcessing,
        setPaymentError,
    } = checkout;
    const isStripeSelected = paymobMethod === 'stripe';

    const renderAgreeText = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\[.*?\])/);
        return parts.map((part, i) => {
            if (part && part.startsWith('[') && part.endsWith(']')) {
                const label = part.slice(1, -1);
                return (
                    <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const l = label.toLowerCase();
                            if (l.includes('terms') || l.includes('شروط')) openLegal?.('terms');
                            else if (l.includes('privacy') || l.includes('خصوصية')) openLegal?.('privacy');
                            else if (l.includes('refund') || l.includes('استرجاع')) openLegal?.('refund');
                            else if (l.includes('disclaimer') || l.includes('إخلاء')) openLegal?.('disclaimer');
                        }}
                        className="text-gold-500 hover:text-gold-400 font-bold underline px-1 transition-colors inline-block"
                    >
                        {label}
                    </button>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
                    <CardFooter className="bg-black/20 p-8 flex flex-col gap-6">
                        {paymentError && (
                            <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold mb-2">
                                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                                <span>{paymentError}</span>
                            </div>
                        )}

                        <div className="space-y-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl w-full">
                            <div className="flex items-start space-x-3 rtl:space-x-reverse">
                                <Checkbox
                                    id="agreeToTerms"
                                    checked={watch("agreeToTerms")}
                                    onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                                    className="mt-1 border-zinc-700 data-[state=checked]:bg-gold-500 data-[state=checked]:text-black"
                                    />
                                <div className="space-y-1">
                                    <label htmlFor="agreeToTerms" className="text-xs font-bold text-zinc-400 cursor-pointer leading-relaxed">
                                        {renderAgreeText(content.checkoutAgree)}
                                    </label>
                                    {errors.agreeToTerms && <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter">{errors.agreeToTerms.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Paymob / Stripe / Kashier Submit Button */}
                        <Button
                            id="checkout-submit-btn"
                            type="submit"
                            disabled={isProcessing || isRedirecting || (isStripeSelected && !!stripeClientSecret && !isStripeReady)}
                            onClick={(e) => {
                                // Stripe embedded flow: when a client secret is already ready,
                                // confirm the payment via PaymentElement instead of re-submitting the form.
                                if (isStripeSelected && stripeClientSecret) {
                                    e.preventDefault();
                                    if (!stripePaymentRef.current) {
                                        setPaymentError(isAr ? "عنصر الدفع لم يكتمل تحميله بعد" : "Payment element not ready yet");
                                        return;
                                    }
                                    setPaymentError(null);
                                    setIsProcessing(true);
                                    stripePaymentRef.current.confirmPayment()
                                        .then(({ success, error }) => {
                                            setIsProcessing(false);
                                            if (!success) {
                                                setPaymentError(error || (isAr ? "فشل تأكيد الدفع" : "Payment confirmation failed"));
                                            } else {
                                                onSuccess?.();
                                            }
                                        })
                                        .catch((err: Error) => {
                                            setIsProcessing(false);
                                            setPaymentError(err.message || (isAr ? "فشل تأكيد الدفع" : "Payment confirmation failed"));
                                        });
                                }
                            }}
                            className={cn(
                                "w-full py-8 text-black font-black text-xl rounded-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70",
                                isStripeSelected
                                    ? "bg-[#635bff] hover:bg-[#7a73ff] text-white shadow-[0_0_30px_rgba(99,91,255,0.35)]"
                                    : paymobMethod === 'instapay'
                                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                                        : paymobMethod === 'kashier'
                                            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                                            : "bg-gold-500 hover:bg-gold-400 text-black shadow-[0_0_30px_rgba(234,179,8,0.25)]"
                            )}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isProcessing || isRedirecting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Lock className="w-5 h-5" />
                                )}
                                <span>
                                    {isStripeSelected
                                        ? (isRedirecting
                                            ? (isAr ? "جاري التحويل..." : "Redirecting...")
                                            : isProcessing
                                                ? (isAr ? "جاري معالجة الدفع..." : "Processing Payment...")
                                                : isStripeReady
                                                    ? `${content.payNow} ${formattedTotal}`
                                                    : (isAr ? `تجهيز الدفع الآمن (${formattedTotal})` : `Start Secure Checkout (${formattedTotal})`))
                                        : paymobMethod === 'instapay'
                                            ? (isRedirecting
                                                ? (isAr ? "جاري تجهيز التأكيد..." : "Preparing Confirmation...")
                                                : isProcessing
                                                    ? (isAr ? "جاري تسجيل الطلب..." : "Recording Order...")
                                                    : (isAr ? `تأكيد طلب إنستاباي (${formattedTotal})` : `Confirm InstaPay Order (${formattedTotal})`))
                                            : paymobMethod === 'kashier'
                                                ? (isRedirecting
                                                    ? (isAr ? "جاري التحويل لكاشير..." : "Redirecting to Kashier...")
                                                    : isProcessing
                                                        ? (isAr ? "جاري معالجة الطلب..." : "Processing Order...")
                                                        : (isAr ? `دفع آمن عبر كاشير (${formattedTotal})` : `Pay with Kashier (${formattedTotal})`))
                                            : paymobMethod === 'wallet'
                                                ? (isRedirecting
                                                    ? (isAr ? "جاري التحويل لـ Paymob..." : "Redirecting...")
                                                    : isProcessing
                                                        ? (isAr ? "جاري معالجة المحفظة..." : "Processing Wallet...")
                                                        : (isAr ? `دفع بالمحفظة الإلكترونية (${formattedTotal})` : `Pay with Mobile Wallet (${formattedTotal})`))
                                                : paymobMethod === 'kiosk'
                                                    ? (isRedirecting
                                                        ? (isAr ? "جاري إصدار الكود..." : "Generating Code...")
                                                        : isProcessing
                                                            ? (isAr ? "جاري إصدار كود الدفع..." : "Generating Code...")
                                                            : (isAr ? `إصدار كود أمان ومصاري (${formattedTotal})` : `Generate Kiosk Code (${formattedTotal})`))
                                                    : (isRedirecting
                                                        ? (isAr ? "جاري التحويل لبوابة الدفع..." : "Redirecting...")
                                                        : isProcessing
                                                            ? (isAr ? "جاري معالجة الطلب..." : "Processing Order...")
                                                            : `${content.payNow} ${formattedTotal}`)}
                                </span>
                            </span>
                        </Button>

                        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-bold tracking-widest uppercase">
                            <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />{content.secureCheckout}</div>
                        </div>
                    </CardFooter>
    );
}
