import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { paymentService } from '../../../shared/lib/payment.service';
import { 
    ShippingProvider, 
    validatePromoCode, 
    calculateShippingRates,
    calculateBaseAmount 
} from '../../../shared/lib/logic';
import { ContentStrings, Language, ProductVariant, PricingTier } from '@/shared/types/types';
import { usePreferences } from '../../../context/PreferencesContext';
import { useRegion } from '../../../context/RegionContext';

export interface CheckoutFormData {
    fullName: string;
    email: string;
    country: string;
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
    userId?: string; // Add userId for authenticated users
}

export interface useCheckoutOptions {
    content: ContentStrings;
    lang: Language;
    selectedTier: PricingTier & { requiresShipping?: boolean; requiresBodyStats?: boolean; selectedLanguage?: 'en' | 'ar' };
    totalAmount: number;
    productVariant: ProductVariant;
    onLocationChange: (isEg: boolean) => void;
    userId?: string; // Optional: authenticated user ID
    userEmail?: string; // Optional: authenticated user email
    userName?: string; // Optional: authenticated user name
}

export interface CheckoutState {
    isProcessing: boolean;
    isRedirecting: boolean;
    paymentError: string | null;
    redirectUrl: string | null;
    // Embedded payment flow
    isCardElementReady: boolean;
    spaceremitCode: string | null;
    paymentMethod: 'embedded' | 'redirect';
}

export const useCheckout = (options: useCheckoutOptions) => {
    const { content, lang, selectedTier, totalAmount, productVariant, onLocationChange, userId, userEmail, userName } = options;
    const { currency, formatPrice: globalFormatPrice } = usePreferences();
    const { isEgypt: isEgRegion, countryCode: vCountry } = useRegion();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<{ valid: boolean; message: string; discount: number } | null>(null);
    const [isPromoLoading, setIsPromoLoading] = useState(false);

    // Embedded Payment Flow State
    const [isCardElementReady, setIsCardElementReady] = useState(false);
    const [spaceremitCode, setSpaceremitCode] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'embedded' | 'redirect'>('redirect');

    // Safe Redirection Side-Effect
    // No longer using useEffect for redirect to avoid DOM manipulation during unload
    // which was causing insertBefore crashes. Redirect is now direct in onSubmit.

    const isAr = lang === 'ar';
    const isPhysical = productVariant !== 'digital';

    // Validation Schema
    const schema = z.object({
        fullName: z.string().min(3, { message: content.checkout.validation.nameRequired }),
        email: z.string().email({ message: content.checkout.validation.emailInvalid }),
        country: z.string().min(1, { message: content.checkout.validation.countryRequired }),
        address: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),
        shippingProvider: z.string().optional(),
        weight: z.string().optional(),
        height: z.string().optional(),
        age: z.string().optional(),
        goal: z.string().optional(),
        createAccount: z.boolean(),
        agreeToTerms: z.boolean().refine(val => val === true, {
            message: content.checkout.validation.termsRequired
        }),
    }).superRefine((data, ctx) => {
        if (selectedTier.requiresShipping) {
            if (!data.address || data.address.length < 5) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.addressRequired, path: ["address"] });
            }
            if (!data.city) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.cityRequired, path: ["city"] });
            }
            if (!data.zipCode) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.zipRequired, path: ["zipCode"] });
            }
            if (!data.shippingProvider) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.shippingRequired, path: ["shippingProvider"] });
            }
        }
        if (selectedTier.requiresBodyStats) {
            if (!data.weight) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.weightRequired, path: ["weight"] });
            }
            if (!data.height) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: content.checkout.validation.heightRequired, path: ["height"] });
            }
        }
    });

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            country: 'USA',
            createAccount: true,
            agreeToTerms: false,
            email: userEmail || '',
            fullName: userName || '',
            userId: userId || undefined
        }
    });

    const selectedCountry = form.watch('country');
    const selectedShippingId = form.watch('shippingProvider');

    // Handle Country Change
    useEffect(() => {
        // Enforce server-side verification flag for the location change prop
        onLocationChange(isEgRegion);

        if (selectedTier.requiresShipping && selectedCountry) {
            const fetchShipping = async () => {
                setIsLoadingShipping(true);
                try {
                    const providers = await calculateShippingRates({ country: selectedCountry });
                    setShippingProviders(providers);
                } catch {
                    toast.error("Failed to load shipping rates");
                } finally {
                    setIsLoadingShipping(false);
                }
            };
            fetchShipping();
        }
    }, [selectedCountry, selectedTier.requiresShipping, onLocationChange]);

    // Use the reliable region context for base amount parsing, ignoring client input
    const { amount: baseAmount, isEg } = calculateBaseAmount(vCountry, productVariant, totalAmount);

    console.log('🚀 [useCheckout] RENDER STATE:', {
        selectedCountry,
        vCountry,
        isEg,
        productVariant,
        tierId: selectedTier.id,
        totalAmount
    });

    const selectedShipping = shippingProviders.find(p => p.id === selectedShippingId);
    const discountAmount = promoStatus?.valid ? promoStatus.discount : 0;
    const finalTotal = Math.max(0, (baseAmount + (selectedShipping?.price || 0)) - discountAmount);

    const currentCurrency = isEg ? 'EGP' : currency;
    const prefCurrency = {
        code: currentCurrency,
        symbol: isEg ? 'ج.م' : '$',
        rate: 1,
        locale: isEg ? 'ar-EG' : 'en-US'
    };

    const formatAmount = (amount: number) => {
        if (isEg) {
            // Precise Arabic formatting for Egyptian Pound
            return new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                currencyDisplay: 'symbol'
            }).format(amount);
        }
        return globalFormatPrice(amount);
    };

    const formattedTotal = formatAmount(finalTotal);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsPromoLoading(true);
        try {
            const result = await validatePromoCode(promoCode);
            if (result.valid) {
                setPromoStatus({ valid: true, message: result.message, discount: result.discount || 0 });
                toast.success(result.message);
            } else {
                setPromoStatus({ valid: false, message: result.message, discount: 0 });
                toast.error(result.message);
            }
        } catch {
            toast.error("Error validating code");
        } finally {
            setIsPromoLoading(false);
        }
    };

    const onSubmit = async (data: CheckoutFormData) => {
        if (submissionCount >= 3) {
            setPaymentError(isAr ? "لقد تجاوزت عدد محاولات الدفع المسموح بها. يرجى المحاولة لاحقاً." : "Too many payment attempts. Please try again later.");
            return;
        }

        console.log('🛑 [useCheckout] onSubmit STARTING...', {
            data,
            finalTotal,
            prefCurrency: typeof prefCurrency === 'string' ? prefCurrency : prefCurrency.code
        });

        setIsProcessing(true);
        setPaymentError(null);
        setSubmissionCount(prev => prev + 1);
        // We set isRedirecting only AFTER the API call succeeds to avoid UI jitter/crashes
        setRedirectUrl(null);

        try {
            // ─── MULTI-GATEWAY FLOW via createInvoice API ────────────────────
            // 1. Create pending invoice → 2. Factory selects gateway by country
            // 3. Pass tier_id → 4. Redirect to gateway URL
            console.log('🚀 Creating invoice via multi-gateway API...', {
                tierId: selectedTier.id,
                country: data.country,
                email: data.email,
            });

            // Call the new multi-gateway createInvoice endpoint
            const result = await paymentService.createInvoice({
                userId: data.userId || userId || '',
                tierId: selectedTier.id as string,
                amount: finalTotal,
                currency: typeof prefCurrency === 'string' ? prefCurrency : prefCurrency.code,
                country: data.country,
                email: data.email,
                fullName: data.fullName,
                locale: isAr ? 'ar' : 'en',
                metadata: {
                    tierName: selectedTier.name as string,
                    isPhysical,
                    lang: selectedTier.selectedLanguage,
                    shippingCost: selectedShipping?.price || 0,
                    shippingProvider: selectedShipping?.name,
                    discount: discountAmount,
                    promoCode,
                    address: data.address,
                    city: data.city,
                    zipCode: data.zipCode,
                },
            });

            if (result.success && result.redirectUrl) {
                console.log('🚀 Redirecting to:', result.redirectUrl);
                // Use a small delay and window.location.assign to avoid React insertBefore error
                setTimeout(() => {
                    window.location.assign(result.redirectUrl!);
                }, 100);
            } else {
                throw new Error(result.error || 'Payment initiation failed');
            }

            console.log('📦 Invoice result:', result);

            if (!result.success) {
                throw new Error(result.error || (isAr ? 'فشل إنشاء الفاتورة' : 'Invoice creation failed'));
            }

            // 🚀 SUCCESS: Redirect immediately to avoid React reconciliation crashes
            // This prevents React from trying to re-render while the browser is navigating,
            // which was causing the "insertBefore" error.
            if (result.redirectUrl) {
                console.log('🏁 Redirecting immediately to:', result.redirectUrl);
                window.location.assign(result.redirectUrl);
                return;
            }

        } catch (error) {
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
        isRedirecting,
        redirectUrl,
        paymentError,
        shippingProviders,
        isLoadingShipping,
        promoCode,
        setPromoCode,
        promoStatus,
        isPromoLoading,
        finalTotal,
        formattedTotal,
        discountAmount,
        selectedShipping,
        handleApplyPromo,
        onSubmit: form.handleSubmit(onSubmit),
        // Embedded payment flow
        isCardElementReady,
        setIsCardElementReady,
        spaceremitCode,
        setSpaceremitCode,
        paymentMethod,
        setPaymentMethod,
        prefCurrency
    };
};
