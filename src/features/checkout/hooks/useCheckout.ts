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
    onLocationChange: (isEg: boolean) => void;
    onDiscountChange?: (discountAmount: number) => void;
    userId?: string;
    userEmail?: string;
    userName?: string;
}

export type PaymobMethod = 'card' | 'wallet' | 'kiosk' | 'paypal';
export type RegionOption = 'EG' | 'GLOBAL';

export const useCheckout = (options: useCheckoutOptions) => {
    const { content, lang, selectedTier, totalAmount, productVariant, onLocationChange, onDiscountChange, userId, userEmail, userName } = options;
    const { currency, formatPrice: globalFormatPrice } = usePreferences();
    const { isEgypt: isEgRegion, countryCode: vCountry } = useRegion();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);

    // Region & Paymob Payment Method Selection
    const initialRegion: RegionOption = selectedTier.selectedLocation === 'EG' || isEgRegion ? 'EG' : 'GLOBAL';
    const [regionOption, setRegionOption] = useState<RegionOption>(initialRegion);
    const [paymobMethod, setPaymobMethod] = useState<PaymobMethod>(initialRegion === 'EG' ? 'card' : 'paypal');

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<{
        valid: boolean;
        message: string;
        discount: number;       // fixed flat amount
        discountPct?: number;   // percentage (0.5 or 1)
        codeType?: 'fixed' | 'pct';
    } | null>(null);
    const [isPromoLoading, setIsPromoLoading] = useState(false);

    // Embedded Payment Flow State
    const [isCardElementReady, setIsCardElementReady] = useState(false);
    const [spaceremitCode, setSpaceremitCode] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'embedded' | 'redirect'>('redirect');

    const isAr = lang === 'ar';
    const isPhysical = productVariant !== 'digital';

    // Validation Schema
    const schema = z.object({
        fullName: z.string().min(3, { message: content.checkout.validation.nameRequired }),
        email: z.string().email({ message: content.checkout.validation.emailInvalid }),
        country: z.string().min(1, { message: content.checkout.validation.countryRequired }),
        phoneNumber: z.string().min(6, { message: isAr ? "رقم الموبايل الأساسي مطلوب" : "Primary phone number is required" }),
        secondaryPhoneNumber: z.string().min(6, { message: isAr ? "رقم الموبايل الإضافي مطلوب" : "Secondary phone number is required" }),
        countryCode: z.string().optional(),
        secondaryCountryCode: z.string().optional(),
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
            // Postal code condition: REQUIRED for International (outside EG), OPTIONAL for Egypt
            if (data.country !== 'EG' && (!data.zipCode || data.zipCode.length < 3)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: isAr ? "الرمز البريدي مطلوب للدول الخارجية" : "Postal Code is required for international orders", path: ["zipCode"] });
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

    // Handle Region Toggle Change
    const handleRegionChange = (newRegion: RegionOption) => {
        setRegionOption(newRegion);
        const isEgyptRegion = newRegion === 'EG';
        form.setValue('country', isEgyptRegion ? 'EG' : 'US');
        setPaymobMethod(isEgyptRegion ? 'card' : 'paypal');
        onLocationChange(isEgyptRegion);
    };

    // Handle Country Change & Auto Shipping Provider Selection
    useEffect(() => {
        const isEg = selectedCountry === 'EG' || regionOption === 'EG';
        onLocationChange(isEg);

        if (selectedTier.requiresShipping && selectedCountry) {
            const fetchShipping = async () => {
                setIsLoadingShipping(true);
                try {
                    const providers = await calculateShippingRates({ country: selectedCountry });
                    setShippingProviders(providers);
                    // Automatically set first available shipping provider if not set
                    if (providers.length > 0) {
                        form.setValue('shippingProvider', providers[0].id, { shouldValidate: true });
                    }
                } catch {
                    toast.error("Failed to load shipping rates");
                } finally {
                    setIsLoadingShipping(false);
                }
            };
            fetchShipping();
        }
    }, [selectedCountry, selectedTier.requiresShipping, onLocationChange, regionOption, form]);

    const isEg = regionOption === 'EG' || selectedCountry === 'EG';
    const { amount: baseAmount } = calculateBaseAmount(isEg ? 'EG' : 'US', productVariant, totalAmount);

    const selectedShipping = shippingProviders.find(p => p.id === selectedShippingId);
    const subTotalWithShipping = baseAmount + (selectedShipping?.price || 0);
    // Compute discount: percentage takes priority over fixed amount
    const discountAmount = (() => {
        if (!promoStatus?.valid) return 0;
        if (promoStatus.codeType === 'pct' && promoStatus.discountPct) {
            return Math.round(subTotalWithShipping * (promoStatus.discountPct / 100) * 100) / 100;
        }
        return promoStatus.discount || 0;
    })();
    const discountPct = promoStatus?.codeType === 'pct' ? (promoStatus.discountPct ?? 0) : 0;
    const finalTotal = Math.max(0, subTotalWithShipping - discountAmount);

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

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsPromoLoading(true);
        try {
            const result = await validatePromoCode(promoCode);
            if (result.valid) {
                const newStatus = {
                    valid: true,
                    message: result.message,
                    discount: result.discount || 0,
                    discountPct: result.discountPct,
                    codeType: result.codeType,
                };
                setPromoStatus(newStatus);
                toast.success(result.message);
                // Notify parent of discount change
                if (onDiscountChange) {
                    const computedDiscount = result.codeType === 'pct' && result.discountPct
                        ? Math.round(subTotalWithShipping * (result.discountPct / 100) * 100) / 100
                        : (result.discount || 0);
                    onDiscountChange(computedDiscount);
                }
            } else {
                setPromoStatus({ valid: false, message: result.message, discount: 0 });
                toast.error(result.message);
                if (onDiscountChange) onDiscountChange(0);
            }
        } catch {
            toast.error(isAr ? "خطأ في التحقق من الكود" : "Error validating code");
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
        setSubmissionCount(prev => prev + 1);
        setRedirectUrl(null);

        try {
            const integrationIdsMap: Record<PaymobMethod, number> = {
                card: 5573815,
                wallet: 5792309,
                kiosk: 5792311,
                paypal: 5792310
            };

            const activeIntegrationId = integrationIdsMap[paymobMethod] || (isEg ? 5573815 : 5792310);

            console.log('🚀 Initiating Paymob Multi-Gateway Invoice...', {
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
                currency: isEg ? 'EGP' : 'USD',
                country: isEg ? 'EG' : (data.country || 'US'),
                email: data.email,
                fullName: data.fullName,
                locale: isAr ? 'ar' : 'en',
                paymentMethod: paymobMethod,
                integrationId: activeIntegrationId,
                phoneNumber: data.phoneNumber || '',
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
                    paymobMethod,
                    integrationId: activeIntegrationId,
                },
            });

            if (result.success && result.redirectUrl) {
                console.log('🚀 Redirecting to Paymob Gateway URL:', result.redirectUrl);
                setIsRedirecting(true);
                setTimeout(() => {
                    window.location.assign(result.redirectUrl!);
                }, 100);
            } else {
                throw new Error(result.error || (isAr ? 'فشل إنشاء عملية الدفع' : 'Payment initiation failed'));
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
        discountPct,
        selectedShipping,
        handleApplyPromo,
        onSubmit: form.handleSubmit(onSubmit),
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
        prefCurrency
    };
};
