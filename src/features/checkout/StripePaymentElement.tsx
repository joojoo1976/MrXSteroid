/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  💳 STRIPE PAYMENT ELEMENT (Link by Stripe)                             ║
 * ║  Embedded, PCI-DSS compliant card / Link payment via PaymentIntent      ║
 * ║  https://docs.stripe.com/payments/payment-intents                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { loadStripe, type StripeElementsOptions, type StripePaymentElementOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export interface StripePaymentElementHandle {
    confirmPayment: () => Promise<{ success: boolean; error?: string }>;
}

export interface StripePaymentElementProps {
    clientSecret: string;
    publishableKey: string;
    locale?: 'ar' | 'en';
    successUrl?: string;
    onReady?: () => void;
    onError?: (message: string) => void;
}

interface PaymentFormProps {
    locale?: 'ar' | 'en';
    successUrl: string;
    onReady?: () => void;
    onError?: (message: string) => void;
}

const PaymentElementForm = forwardRef<StripePaymentElementHandle, PaymentFormProps>(
    ({ locale, successUrl, onReady, onError }, ref) => {
        const stripe = useStripe();
        const elements = useElements();
        const [isReady, setIsReady] = useState(false);

        useImperativeHandle(ref, () => ({
            confirmPayment: async () => {
                if (!stripe || !elements) {
                    return { success: false, error: locale === 'ar' ? 'عنصر الدفع لم يكتمل تحميله بعد' : 'Payment element not ready yet' };
                }

                try {
                    const { error } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            return_url: successUrl,
                        },
                        redirect: 'if_required',
                    });

                    if (error) {
                        onError?.(error.message || 'Payment failed');
                        return { success: false, error: error.message || 'Payment failed' };
                    }

                    return { success: true };
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Payment failed';
                    onError?.(message);
                    return { success: false, error: message };
                }
            },
        }), [stripe, elements, successUrl, locale, onError]);

        const paymentElementOptions = useMemo<StripePaymentElementOptions>(() => ({
            layout: 'tabs',
            paymentMethodOrder: ['card', 'link'],
            wallets: { applePay: 'auto', googlePay: 'auto' },
        }), []);

        return (
            <div className="space-y-4">
                <PaymentElement
                    options={paymentElementOptions}
                    onReady={() => {
                        setIsReady(true);
                        onReady?.();
                    }}
                    onChange={(event) => {
                        if (event.complete) onReady?.();
                    }}
                />
                {!isReady && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <span className="inline-block w-3 h-3 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
                        {locale === 'ar' ? 'جاري تحميل وسائل الدفع الآمنة...' : 'Loading secure payment methods...'}
                    </div>
                )}
            </div>
        );
    }
);

PaymentElementForm.displayName = 'PaymentElementForm';

export const StripePaymentElement = forwardRef<StripePaymentElementHandle, StripePaymentElementProps>(
    ({ clientSecret, publishableKey, locale = 'en', successUrl, onReady, onError }, ref) => {
        const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

        const options = useMemo<StripeElementsOptions>(() => ({
            clientSecret,
            appearance: {
                theme: 'night',
                variables: {
                    colorPrimary: '#eab308',
                    colorBackground: '#000000',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    borderRadius: '16px',
                    spacingUnit: '4px',
                    tabIconColor: '#eab308',
                },
                rules: {
                    '.Input': {
                        border: '1px solid #27272a',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                    },
                    '.Input:focus': {
                        borderColor: '#eab308',
                        boxShadow: '0 0 0 1px #eab308',
                    },
                    '.Label': {
                        color: '#a1a1aa',
                        fontWeight: '600',
                    },
                    '.Tab': {
                        border: '1px solid #27272a',
                        color: '#e4e4e7',
                        padding: '12px',
                    },
                    '.Tab--selected': {
                        borderColor: '#eab308',
                        color: '#eab308',
                        boxShadow: '0 0 12px rgba(234,179,8,0.25)',
                    },
                },
            },
            locale: (locale as 'auto') || 'auto',
        }), [clientSecret, locale]);

        return (
            <Elements stripe={stripePromise} options={options}>
                <PaymentElementForm
                    ref={ref}
                    locale={locale}
                    successUrl={successUrl || (typeof window !== 'undefined' ? `${window.location.origin}/success` : '/success')}
                    onReady={onReady}
                    onError={onError}
                />
            </Elements>
        );
    }
);

StripePaymentElement.displayName = 'StripePaymentElement';

export default StripePaymentElement;
