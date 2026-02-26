import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { paymentService } from '../../../shared/lib/payment.service';
import { ShippingProvider, validatePromoCode, calculateShippingRates } from '../../../shared/lib/logic';
import { ContentStrings, Language, ProductVariant, PricingTier } from '../../../types';
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
            const tempOrderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log('🚀 Initiating payment...', {
                amount: finalTotal,
                currency,
                email: data.email,
                orderId: tempOrderId,
                paymentMethod
            });

            // If using embedded payment and we have a spaceremit code
            if (paymentMethod === 'embedded' && spaceremitCode) {
                console.log('💳 Processing embedded payment with SpaceRemit code:', spaceremitCode);

                // Create payment record with the spaceremit code
                const result = await paymentService.initiatePayment({
                    amount: finalTotal,
                    currency: currency as 'USD' | 'EGP' | 'SAR' || 'USD',
                    email: data.email,
                    customerName: data.fullName,
                    orderId: tempOrderId,
                    productId: selectedTier.id as string,
                    productName: selectedTier.name as string,
                    userId: undefined,
                    quantity: 1,
                    locale: isAr ? 'ar' : 'en',
                    metadata: {
                        ...data,
                        tierId: selectedTier.id,
                        tierName: selectedTier.name,
                        isPhysical: isPhysical,
                        lang: selectedTier.selectedLanguage,
                        shippingCost: selectedShipping?.price || 0,
                        shippingProvider: selectedShipping?.name,
                        discount: discountAmount,
                        promoCode: promoCode,
                        spaceremit_code: spaceremitCode,
                        payment_method: 'embedded_card'
                    } as unknown as Record<string, unknown>
                });

                console.log('📦 Payment result:', result);

                if (result.success === false) {
                    const err = result.error;
                    throw new Error(err?.messageAr || err?.message || 'Payment initiation failed');
                }

                // Payment successful - show success state
                setSubmissionCount(prev => prev + 1);
                toast.success(isAr ? 'تم الدفع بنجاح! جاري معالجة طلبك...' : 'Payment successful! Processing your order...');

                // Redirect to success page
                setTimeout(() => {
                    window.location.href = `/checkout/success?order=${tempOrderId}`;
                }, 1000);

                return;
            }

            // Fallback to redirect flow
            console.log('🔄 Falling back to redirect payment flow');
            const result = await paymentService.initiatePayment({
                amount: finalTotal,
                currency: currency as 'USD' | 'EGP' | 'SAR' || 'USD',
                email: data.email,
                customerName: data.fullName,
                orderId: tempOrderId,
                productId: selectedTier.id as string,
                productName: selectedTier.name as string,
                userId: undefined,
                quantity: 1,
                locale: isAr ? 'ar' : 'en',
                metadata: {
                    ...data,
                    tierId: selectedTier.id,
                    tierName: selectedTier.name,
                    isPhysical: isPhysical,
                    lang: selectedTier.selectedLanguage,
                    shippingCost: selectedShipping?.price || 0,
                    shippingProvider: selectedShipping?.name,
                    discount: discountAmount,
                    promoCode: promoCode,
                    payment_method: 'redirect'
                } as unknown as Record<string, unknown>
            });

            console.log('📦 Payment result:', result);

            if (result.success === false) {
                const err = result.error;
                throw new Error(err?.messageAr || err?.message || 'Payment initiation failed');
            }

            // Show redirecting state
            setIsRedirecting(true);
            setRedirectUrl(result.data.checkoutUrl);
            setSubmissionCount(prev => prev + 1);

            // Show toast message
            toast.success(isAr ? 'جاري التحويل إلى صفحة الدفع الآمنة...' : 'Redirecting to secure payment page...');

            // The redirect happens in payment.service.ts via window.location.href
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
