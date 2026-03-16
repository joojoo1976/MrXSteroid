import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { paymentService } from '../../../shared/lib/payment.service';
import { ShippingProvider, validatePromoCode, calculateShippingRates } from '../../../shared/lib/logic';
import { ContentStrings, Language, ProductVariant, PricingTier } from '@/shared/types/types';
import { usePreferences } from '../../../context/PreferencesContext';

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
    const { currency } = usePreferences();
    const prefCurrency = { code: currency, symbol: '$', rate: 1, locale: 'en-US' }; // Mock object to match expected structure
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
    const [paymentMethod, setPaymentMethod] = useState<'embedded' | 'redirect'>('embedded');

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
        const isEg = (selectedCountry || '').toLowerCase() === 'egypt' || selectedCountry === 'مصر';
        onLocationChange(isEg);

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

    const selectedShipping = shippingProviders.find(p => p.id === selectedShippingId);
    const discountAmount = promoStatus?.valid ? promoStatus.discount : 0;
    const finalTotal = Math.max(0, (totalAmount + (selectedShipping?.price || 0)) - discountAmount);

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

        setIsProcessing(true);
        setPaymentError(null);
        setIsRedirecting(false);
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

            // Determine tier_id from the selected tier
            const tierId = (selectedTier.id === 'paperback' || selectedTier.requiresShipping) ? 'paperback' : 'pdf';

            // Call the new multi-gateway createInvoice endpoint
            const result = await paymentService.createInvoice({
                userId: data.userId || userId || '',
                tierId: tierId as 'pdf' | 'paperback',
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

            console.log('📦 Invoice result:', result);

            if (!result.success) {
                throw new Error(result.error || (isAr ? 'فشل إنشاء الفاتورة' : 'Invoice creation failed'));
            }

            // Show redirecting state
            setIsRedirecting(true);
            setRedirectUrl(result.redirectUrl || null);
            setSubmissionCount(prev => prev + 1);

            // Toast with gateway name
            const gatewayLabel = result.gateway?.toUpperCase() || 'payment';
            toast.success(
                isAr
                    ? `جاري التحويل إلى ${gatewayLabel} للدفع الآمن...`
                    : `Redirecting to ${gatewayLabel} for secure payment...`
            );

            // Redirect is handled by paymentService.createInvoice() automatically
            // (it calls window.location.href after 300ms)

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
