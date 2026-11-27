'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { paymentService } from '../../../shared/lib/payment.service';
import { 
    ShippingProvider, 
    calculateShippingRates,
} from '../../../shared/lib/logic';
import type { ContentStrings, Language, ProductVariant, PricingTier } from '@/shared/types/types';
import { buildCheckoutSchema } from '../lib/checkoutSchema';
import { calculateCheckoutTotals } from '../lib/checkoutTotals';
import { usePromoCode } from './usePromoCode';
import { usePreferences } from '../../../context/PreferencesContext';

export interface CheckoutFormData {
    fullName: string;
    email: string;
    country: string;
    phoneNumber?: string;
    secondaryPhoneNumber?: string;
    countryCode?: string;
    secondaryCountryCode?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    shippingProvider?: string;
    weight?: string;
    height?: string;
    age?: string;
    goal?: string;
    createAccount: boolean;
    agreeToTerms: boolean;
    userId?: string;
}

export interface useCheckoutOptions {
    content: ContentStrings;
    lang: Language;
    selectedTier: PricingTier & { requiresShipping?: boolean; requiresBodyStats?: boolean; selectedLanguage?: 'en' | 'ar'; selectedLocation?: 'EG' | 'GLOBAL' };
    totalAmount: number;
    productVariant: ProductVariant;
    isEg: boolean;
    onLocationChange: (isEg: boolean) => void;
    onDiscountChange?: (discountAmount: number) => void;
    quantity?: number;
    userId?: string;
    userEmail?: string;
    userName?: string;
    /** InstaPay transfer reference entered by the customer (optional). */
    instapayRef?: string;
    /** InstaPay receipt file (image/PDF) selected by the customer (required for InstaPay). */
    instapayFile?: File | null;
    /** Called with the created orderRef after a successful InstaPay submission. */
    onInstaPaySuccess?: (orderRef: string) => void;
}

export type PaymobMethod = 'card' | 'wallet' | 'kiosk' | 'paypal' | 'stripe' | 'instapay' | 'kashier';
export type RegionOption = 'EG' | 'GLOBAL';

export const useCheckout = (options: useCheckoutOptions) => {
    const { content, lang, selectedTier, totalAmount, productVariant, isEg: isEgProp, onLocationChange, onDiscountChange, quantity, userId, userEmail, userName, instapayRef, instapayFile, onInstaPaySuccess } = options;
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);
    const shippingRequestId = useRef(0);

    // Region & Paymob Payment Method Selection
    // Single source of truth: `isEg` prop (from CheckoutPage). regionOption is
    // derived so every region toggle across the page stays in sync.
    const regionOption: RegionOption = isEgProp ? 'EG' : 'GLOBAL';
    const [paymobMethod, setPaymobMethod] = useState<PaymobMethod>(regionOption === 'EG' ? 'kashier' : 'stripe');

    // Embedded Payment Flow State
    const [isCardElementReady, setIsCardElementReady] = useState(false);
    const [spaceremitCode, setSpaceremitCode] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'embedded' | 'redirect'>('redirect');

    // Stripe (Link by Stripe) embedded flow state
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [stripeInvoiceId, setStripeInvoiceId] = useState<string | null>(null);
    const [isStripeReady, setIsStripeReady] = useState(false);

    const isAr = lang === 'ar';
    const { currency, formatPrice: globalFormatPrice } = usePreferences();
    const { promoCode, setPromoCode, promoStatus, isPromoLoading, handleApplyPromo } = usePromoCode(isAr);
    const DIGITAL_VARIANTS: ProductVariant[] = ['digital', 'digital_plus'];
    const isPhysical = !DIGITAL_VARIANTS.includes(productVariant);

    // Validation Schema
    const schema = buildCheckoutSchema({ content, isAr, selectedTier });

    const form = useForm<CheckoutFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema) as any,
        defaultValues: {
            country: regionOption === 'EG' ? 'EG' : 'US',
            countryCode: '+20',
            secondaryCountryCode: '+20',
            createAccount: true,
            agreeToTerms: false,
            email: userEmail || '',
            fullName: userName || '',
            userId: userId || undefined,
            phoneNumber: '',
            secondaryPhoneNumber: ''
        }
    });

    const selectedCountry = form.watch('country');
    const selectedShippingId = form.watch('shippingProvider');
    const currentSelectionSignature = JSON.stringify([
        selectedTier.id,
        productVariant,
        totalAmount,
        quantity ?? 1,
        selectedCountry,
        selectedShippingId,
        regionOption,
        paymobMethod,
    ]);
    const selectionSignatureRef = useRef(currentSelectionSignature);
    selectionSignatureRef.current = currentSelectionSignature;

    // A quote, invoice, or embedded Stripe session is specific to the current
    // plan, amount, country, and region. Invalidate it as soon as any input to
    // that selection changes; late responses are compared to the live signature.
    useEffect(() => {
        setStripeClientSecret(null);
        setStripeInvoiceId(null);
        setIsStripeReady(false);
        setRedirectUrl(null);
    }, [selectedTier.id, productVariant, totalAmount, quantity, selectedCountry, selectedShippingId, regionOption, paymobMethod]);

    // Reset Stripe embedded state whenever the payment method changes
    useEffect(() => {
        if (paymobMethod !== 'stripe') {
            setStripeClientSecret(null);
            setStripeInvoiceId(null);
            setIsStripeReady(false);
        }
    }, [paymobMethod]);

    // Handle Region Toggle Change
    const handleRegionChange = (newRegion: RegionOption) => {
        const isEgyptRegion = newRegion === 'EG';
        form.setValue('country', isEgyptRegion ? 'EG' : 'US');
        setPaymobMethod(isEgyptRegion ? 'kashier' : 'stripe');
        setStripeClientSecret(null);
        setStripeInvoiceId(null);
        setIsStripeReady(false);
        onLocationChange(isEgyptRegion);
    };

    // Region is owned by the page (`isEg` prop) and by the country field. Those
    // two must not both write it, or they fight: `regionOption` is derived from
    // `isEg` and this effect used to OR it with the country, so selecting
    // "Outside Egypt" re-asserted EG on the next render and the toggle reverted
    // instantly. The country field is now the only thing this effect reports.
    const prevIsEgProp = useRef(isEgProp);
    useEffect(() => {
        if (prevIsEgProp.current === isEgProp) return;
        prevIsEgProp.current = isEgProp;
        // Only correct the country when it contradicts the new region, so a
        // concrete country picked by the user (SA, AE, ...) is never overwritten.
        const countryIsEg = form.getValues('country') === 'EG';
        if (countryIsEg !== isEgProp) {
            form.setValue('country', isEgProp ? 'EG' : 'US');
        }

        // Country selection can change the parent region without going through
        // the region cards. Keep the gateway aligned with that externally-owned
        // region and discard any embedded Stripe session from the old region.
        setPaymobMethod(isEgProp ? 'kashier' : 'stripe');
        setStripeClientSecret(null);
        setStripeInvoiceId(null);
        setIsStripeReady(false);
    }, [isEgProp, form]);

    // Handle Country Change & Auto Shipping Provider Selection
    useEffect(() => {
        const requestId = ++shippingRequestId.current;
        const isEgFromCountry = selectedCountry === 'EG';
        onLocationChange(isEgFromCountry);

        // A shipping provider and its price belong to one country only. Drop
        // the previous selection immediately, before requesting rates for the
        // new country, so neither the summary nor invoice can reuse stale data.
        setShippingProviders([]);
        form.setValue('shippingProvider', '', { shouldValidate: true });

        if (!selectedTier.requiresShipping || !selectedCountry) {
            setIsLoadingShipping(false);
            return;
        }

        const fetchShipping = async () => {
            setIsLoadingShipping(true);
            try {
                const providers = await calculateShippingRates({ country: selectedCountry });
                if (requestId !== shippingRequestId.current) return;
                setShippingProviders(providers);
                if (providers.length > 0) {
                    form.setValue('shippingProvider', providers[0].id, { shouldValidate: true });
                }
            } catch {
                if (requestId === shippingRequestId.current) {
                    toast.error("Failed to load shipping rates");
                }
            } finally {
                if (requestId === shippingRequestId.current) {
                    setIsLoadingShipping(false);
                }
            }
        };
        void fetchShipping();

        return () => {
            // Prevent an older country request from replacing the latest rates
            // even when the transport cannot be aborted.
            if (shippingRequestId.current === requestId) shippingRequestId.current++;
        };
    }, [selectedCountry, selectedTier.requiresShipping, onLocationChange, form]);

    const isEg = regionOption === 'EG';
    // totalAmount already includes quantity × unit price + add-ons (passed from CheckoutPage).
    // Use it directly so the sent total matches what the user sees and what the server recomputes.
    const baseAmount = totalAmount;

    const selectedShipping = shippingProviders.find(p => p.id === selectedShippingId);
    const { discountAmount, discountPct, finalTotal } = calculateCheckoutTotals({
        baseAmount,
        shippingPrice: selectedShipping?.price || 0,
        promoStatus,
    });

    // Keep the parent's discountAmount in sync whenever the recomputed value
    // changes. Without this, a percentage promo applied before a shipping
    // selection would leave OrderSummary's grand total stale relative to the
    // amount actually charged (finalTotal).
    useEffect(() => {
        if (onDiscountChange) onDiscountChange(discountAmount);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discountAmount]);

    const currentCurrency = isEg ? 'EGP' : currency;
    const prefCurrency = {
        code: currentCurrency,
        symbol: isEg ? 'ج.م' : '$',
        rate: 1,
        locale: isEg ? 'ar-EG' : 'en-US'
    };

    const formatAmount = (amount: number) => {
        if (isEg) {
            return new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                currencyDisplay: 'symbol'
            }).format(amount);
        }
        return globalFormatPrice(amount);
    };

    const formattedTotal = formatAmount(finalTotal);

    const onSubmit = async (data: CheckoutFormData) => {
        const activeSelectionSignature = currentSelectionSignature;
        if (submissionCount >= 5) {
            setPaymentError(isAr ? "لقد تجاوزت عدد محاولات الدفع المسموح بها. يرجى المحاولة لاحقاً." : "Too many payment attempts. Please try again later.");
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);
        setSubmissionCount(prev => prev + 1);
        setRedirectUrl(null);

        const idempotencyKey = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : `mrx-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        try {
            // ── INSTAPAY: canonical manual-review flow ───────────────────────
            // The customer uploads their transfer receipt; the server creates the
            // Order + PaymentReceipt and queues it for admin verification.
            // NOTE: this deliberately bypasses the legacy create-invoice path.
            if (paymobMethod === 'instapay') {
                if (!instapayFile) {
                    setPaymentError(isAr ? 'يرجى رفع صورة أو ملف PDF لإيصال التحويل أولاً (مطلوب للتأكيد).' : 'Please upload your transfer receipt (image or PDF) first — required for confirmation.');
                    setIsProcessing(false);
                    return;
                }
                if (!data.phoneNumber || data.phoneNumber.trim().length < 8) {
                    setPaymentError(isAr ? 'رقم الهاتف مطلوب لتأكيد طلب إنستاباي.' : 'A valid phone number is required for InstaPay orders.');
                    setIsProcessing(false);
                    return;
                }

                const result = await paymentService.submitInstaPay({
                    receipt: instapayFile,
                    idempotencyKey,
                    data: {
                        tierId: selectedTier.id,
                        quantity: quantity ?? 1,
                        customerName: data.fullName,
                        email: data.email,
                        phoneNumber: data.phoneNumber.trim(),
                        transactionRef: instapayRef?.trim() || undefined,
                        shippingAddress: isPhysical
                            ? {
                                  address: data.address,
                                  city: data.city,
                                  zipCode: data.zipCode,
                                  country: 'EG',
                              }
                            : undefined,
                        promoCode: promoCode?.trim() || undefined,
                        userId: data.userId || userId || undefined,
                        locale: isAr ? 'ar' : 'en',
                    },
                });

                if (activeSelectionSignature !== selectionSignatureRef.current) {
                    setIsProcessing(false);
                    return;
                }

                if (result.success && result.orderRef) {
                    console.log('🚀 InstaPay order recorded:', result.orderRef);
                    setIsRedirecting(true);
                    onInstaPaySuccess?.(result.orderRef);
                    return;
                }
                throw new Error(result.error || (isAr ? 'فشل تسجيل طلب إنستاباي' : 'InstaPay submission failed'));
            }

            const integrationIdsMap: Record<PaymobMethod, number> = {
                card: 5573815,
                wallet: 5792309,
                kiosk: 5792311,
                paypal: 5792310,
                stripe: 0,
                instapay: 0,
                kashier: 0,
            };

            const isStripeFlow = paymobMethod === 'stripe';
            const activeIntegrationId = (isStripeFlow || paymobMethod === 'kashier') ? undefined : (integrationIdsMap[paymobMethod] || (isEg ? 5573815 : 5792310));

            console.log('🚀 Initiating Payment Gateway Invoice...', {
                tierId: selectedTier.id,
                regionOption,
                paymobMethod,
                integrationId: activeIntegrationId,
                country: isEg ? 'EG' : data.country,
                email: data.email,
                amount: finalTotal,
            });

            const result = await paymentService.createInvoice({
                userId: data.userId || userId || '',
                tierId: selectedTier.id as string,
                amount: finalTotal,
                currency: isStripeFlow ? 'USD' : (isEg ? 'EGP' : 'USD'),
                country: isStripeFlow ? (data.country || 'US') : (isEg ? 'EG' : (data.country || 'US')),
                email: data.email,
                fullName: data.fullName,
                locale: isAr ? 'ar' : 'en',
                paymentMethod: paymobMethod,
                integrationId: activeIntegrationId,
                phoneNumber: data.phoneNumber || '',
                quantity: quantity ?? 1,
                shippingCost: selectedShipping?.price || 0,
                discount: discountAmount,
                idempotencyKey,
                metadata: {
                    tierName: selectedTier.name as string,
                    isPhysical,
                    lang: selectedTier.selectedLanguage,
                    shippingCost: selectedShipping?.price || 0,
                    shippingProvider: selectedShipping?.name,
                    shippingProviderId: selectedShipping?.id,
                    discount: discountAmount,
                    promoCode,
                    address: data.address,
                    city: data.city,
                    zipCode: data.zipCode,
                    paymobMethod,
                    integrationId: activeIntegrationId,
                },
            });

            if (activeSelectionSignature !== selectionSignatureRef.current) {
                setIsProcessing(false);
                return;
            }

            // Stripe embedded flow: keep client secret for PaymentElement, no redirect
            if (isStripeFlow && result.success && result.clientSecret) {
                setStripeClientSecret(result.clientSecret);
                setStripeInvoiceId(result.invoiceId || null);
                setIsStripeReady(false);
                setIsProcessing(false);
                return;
            }

            if (result.success && result.redirectUrl) {
                console.log('🚀 Redirecting to Payment Gateway URL:', result.redirectUrl);
                setIsRedirecting(true);
                setTimeout(() => {
                    window.location.assign(result.redirectUrl!);
                }, 100);
            } else {
                throw new Error(result.error || (isAr ? 'فشل إنشاء عملية الدفع' : 'Payment initiation failed'));
            }

        } catch (error) {
            if (activeSelectionSignature !== selectionSignatureRef.current) {
                setIsProcessing(false);
                return;
            }
            console.error('❌ Payment error:', error);
            const msg = (error as Error).message;
            setPaymentError(isAr ? (msg || "حدث خطأ أثناء بدء الدفع.") : (msg || "Error initiating payment."));
            setIsProcessing(false);
            setIsRedirecting(false);
        }
    };

    return {
        form,
        isProcessing,
        setIsProcessing,
        isRedirecting,
        redirectUrl,
        paymentError,
        setPaymentError,
        shippingProviders,
        isLoadingShipping,
        promoCode,
        setPromoCode,
        promoStatus,
        isPromoLoading,
        finalTotal,
        formattedTotal,
        discountAmount,
        discountPct,
        selectedShipping,
        handleApplyPromo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit: form.handleSubmit(onSubmit as any),
        // Region & Paymob Methods
        regionOption,
        setRegionOption: handleRegionChange,
        paymobMethod,
        setPaymobMethod,
        isEg,
        // Embedded payment flow compat
        isCardElementReady,
        setIsCardElementReady,
        spaceremitCode,
        setSpaceremitCode,
        paymentMethod,
        setPaymentMethod,
        prefCurrency,
        // Stripe embedded flow
        stripeClientSecret,
        stripeInvoiceId,
        isStripeReady,
        setIsStripeReady
    };
};
