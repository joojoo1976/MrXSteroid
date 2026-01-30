import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loadStripe, StripeElementLocale } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CreditCard, User, Mail, Loader2, AlertCircle, MapPin, Globe, Scale, Ruler, Calendar, Target, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ContentStrings, Language, PricingTier, ProductVariant } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getShippingProviders, ShippingProvider, validatePromoCode, calculateShippingRates } from '../../utils/logic';
import { supabase } from '../../lib/supabase';
import { usePreferences } from '../../context/PreferencesContext';
import { errorHandler } from '../../lib/error-handler';

// Initialize SpaceRemit (Environment Variable with fallback for localized testing)
const SPACEREMIT_KEY = import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY || 'sb_publishable_placeholder_key_demo_only';
const stripePromise = loadStripe(SPACEREMIT_KEY);

interface CheckoutFormData {
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
}

export interface NewPricingTier extends PricingTier {
    id: ProductVariant;
    requiresShipping: boolean;
    requiresBodyStats: boolean;
    selectedLanguage: 'en' | 'ar';
}

export interface CheckoutFormProps {
    content: ContentStrings;
    lang: Language;
    selectedTier: NewPricingTier;
    onSuccess: () => void;
    productVariant: ProductVariant;
    quantity: number;
    onLocationChange: (isEgypt: boolean) => void;
    onShippingChange?: (cost: number) => void;
    totalAmount: number;
    openLegal?: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}

const CheckoutFormInner: React.FC<CheckoutFormProps> = ({
    content,
    lang,
    selectedTier,
    onSuccess,
    productVariant,
    quantity,
    onLocationChange,
    onShippingChange,
    totalAmount,
    openLegal
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const { unitSystem, language: prefLang, locale: detectedLocale } = usePreferences();
    const isAr = prefLang === 'ar';
    const isPhysical = productVariant !== 'digital';
    const isImperial = unitSystem === 'imperial';

    // Dynamic Localization-ready Schema
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


    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            country: 'USA',
            createAccount: true,
            agreeToTerms: false
        }
    });

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card');
    const selectedCountry = watch('country');

    useEffect(() => {
        const isEg = (selectedCountry || '').toLowerCase() === 'egypt' || selectedCountry === 'مصر';
        onLocationChange(isEg);
    }, [selectedCountry, onLocationChange]);

    const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<{ valid: boolean; message: string; discount: number } | null>(null);
    const [isPromoLoading, setIsPromoLoading] = useState(false);

    const watchCountry = watch('country');

    useEffect(() => {
        if (selectedTier.requiresShipping && watchCountry) {
            const fetchShipping = async () => {
                setIsLoadingShipping(true);
                try {
                    const providers = await calculateShippingRates({ country: watchCountry });
                    setShippingProviders(providers);
                    onLocationChange(watchCountry.toLowerCase() === 'egypt' || watchCountry === 'مصر');
                } catch (error) {
                    toast.error("Failed to load shipping rates");
                } finally {
                    setIsLoadingShipping(false);
                }
            };
            fetchShipping();
        }
    }, [watchCountry, selectedTier.requiresShipping, onLocationChange]);

    const selectedShippingId = watch('shippingProvider');
    const selectedShipping = shippingProviders.find(p => p.id === selectedShippingId);

    // Calculate Final Total
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
        } catch (e) {
            toast.error("Error validating code");
        } finally {
            setIsPromoLoading(false);
        }
    };

    useEffect(() => {
        if (onShippingChange) {
            onShippingChange(selectedShipping?.price || 0);
        }
    }, [selectedShipping, onShippingChange]);

    const [submissionCount, setSubmissionCount] = useState(0);

    const onSubmit = async (data: CheckoutFormData) => {
        // Mock Rate Limiting
        if (submissionCount >= 3) {
            setPaymentError(isAr ? "لقد تجاوزت عدد محاولات الدفع المسموح بها. يرجى المحاولة لاحقاً." : "Too many payment attempts. Please try again later.");
            return;
        }

        // Generate a unique transaction ID for reference & idempotency
        const txnId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Integrated SpaceRemit Payment Integration with ID tracking
        try {
            // Leverage Supabase to store the order/lead
            const { error: dbError } = await supabase
                .from('orders')
                .insert([{
                    email: data.email,
                    fullName: data.fullName,
                    tier: selectedTier.id,
                    language: selectedTier.selectedLanguage,
                    amount: finalTotal,
                    country: data.country,
                    address: data.address,
                    city: data.city,
                    zip_code: data.zipCode,
                    shipping_provider: selectedShipping?.name,
                    transaction_id: txnId, // Linked to the payment
                    status: 'pending',     // Initial state
                    body_stats: selectedTier.requiresBodyStats ? {
                        weight: data.weight,
                        height: data.height,
                        age: data.age,
                        goal: data.goal
                    } : null
                }]);

            if (dbError) {
                errorHandler.handle(dbError, 'CheckoutOrderSave');
            }



            // Simulate Payment Gateway Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (window.SpaceRemit) {
                window.SpaceRemit.Pay({
                    amount: finalTotal,
                    currency: 'USD',
                    email: data.email,
                    description: `Order for ${selectedTier.name} (${selectedTier.selectedLanguage})`,
                    reference: txnId, // Crucial for idempotency matching
                    metadata: { ...data, tierId: selectedTier.id, internal_txn: txnId }
                });
            } else {
                // Fallback for demo
                toast.success("Order processed successfully (SpaceRemit Mock)");
                onSuccess();
            }
        } catch (error) {
            errorHandler.handle(error, 'CheckoutPayment');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gold-500">
                        <User className="w-5 h-5 text-gold-500" />
                        {content.billingDetails || (isAr ? "تفاصيل الفاتورة" : "Billing Details")}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        {isAr ? "أدخل تفاصيلك لإتمام الطلب" : "Enter your details to complete the order"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">{content.fullName || (isAr ? "الاسم الكامل" : "Full Name")}</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <Input
                                {...register("fullName")}
                                className={cn("pl-10 bg-black/40 border-zinc-800 focus:border-gold-500 transition-all text-sm", errors.fullName && "border-red-500")}
                                placeholder={content.checkout.placeholders.fullName}
                            />
                        </div>
                        {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">{content.emailAddress || (isAr ? "البريد الإلكتروني" : "Email Address")}</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <Input
                                {...register("email")}
                                type="email"
                                className={cn("pl-10 bg-black/40 border-zinc-800 focus:border-gold-500 transition-all text-sm", errors.email && "border-red-500")}
                                placeholder={content.checkout.placeholders.email}
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">{isAr ? "الدولة" : "Country"}</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <select
                                {...register("country")}
                                className="w-full pl-10 h-10 rounded-md bg-black/40 border border-zinc-800 text-white focus:border-gold-500 focus:ring-0 appearance-none"
                            >
                                <option value="Egypt">Egypt (مصر)</option>
                                <option value="Saudi Arabia">Saudi Arabia (السعودية)</option>
                                <option value="UAE">UAE (الإمارات)</option>
                                <option value="USA">USA / Global</option>
                                <option value="Germany">Germany</option>
                            </select>
                        </div>
                    </div>

                    <AnimatePresence>
                        {selectedTier.requiresShipping && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 pt-6 border-t border-zinc-800"
                            >
                                <h4 className="text-sm font-black uppercase tracking-widest text-gold-500 flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    {isAr ? 'تفاصيل الشحن' : 'Shipping Details'}
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-zinc-300">{isAr ? "العنوان بالتفصيل" : "Full Address"}</Label>
                                    <Input
                                        {...register("address")}
                                        className={cn("bg-black/40 border-zinc-800 focus:border-gold-500 text-sm", errors.address && "border-red-500")}
                                        placeholder={content.checkout.placeholders.address}
                                    />
                                    {errors.address && <p className="text-xs text-red-500 font-bold">{errors.address.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">{isAr ? "المدينة" : "City"}</Label>
                                        <Input
                                            {...register("city")}
                                            className={cn("bg-black/40 border-zinc-800 focus:border-gold-500", errors.city && "border-red-500")}
                                        />
                                        {errors.city && <p className="text-xs text-red-500 font-bold">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">{isAr ? "الرمز البريدي" : "ZIP Code"}</Label>
                                        <Input
                                            {...register("zipCode")}
                                            className={cn("bg-black/40 border-zinc-800 focus:border-gold-500", errors.zipCode && "border-red-500")}
                                        />
                                        {errors.zipCode && <p className="text-xs text-red-500 font-bold">{errors.zipCode.message}</p>}
                                    </div>
                                </div>

                                {/* Shipping Provider Selection */}
                                <div className="space-y-3">
                                    <Label className="text-zinc-300">{isAr ? 'شركة الشحن' : 'Shipping Provider'}</Label>
                                    {isLoadingShipping ? (
                                        <div className="h-20 flex items-center justify-center bg-white/5 rounded-xl border border-zinc-800 animate-pulse">
                                            <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {shippingProviders.map((provider) => (
                                                <label
                                                    key={provider.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                        watch('shippingProvider') === provider.id
                                                            ? "border-gold-500 bg-gold-500/10"
                                                            : "border-zinc-800 bg-black/20 hover:border-zinc-700"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            value={provider.id}
                                                            {...register('shippingProvider')}
                                                            className="w-4 h-4 accent-gold-500"
                                                        />
                                                        <div>
                                                            <p className="text-xs font-black text-white">{provider.name}</p>
                                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{provider.estimatedDays} days delivery</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-gold-500">+${provider.price}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {errors.shippingProvider && <p className="text-xs text-red-500 font-bold">{errors.shippingProvider.message}</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Body Stats Fields (Tier 3) */}
                    {selectedTier.requiresBodyStats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800"
                        >
                            <h4 className="text-sm font-black uppercase tracking-widest text-gold-500">
                                {lang === 'ar' ? 'بيانات التجهيز و المتابعة' : 'Preparation & Coaching Data'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {lang === 'ar' ? `الوزن (${isImperial ? 'رطل' : 'كجم'})` : `Weight (${isImperial ? 'lbs' : 'kg'})`}
                                    </label>
                                    <input
                                        {...register('weight')}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                        placeholder={isImperial ? "180" : "85"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {lang === 'ar' ? `الطول (${isImperial ? 'بوصة' : 'سم'})` : `Height (${isImperial ? 'in' : 'cm'})`}
                                    </label>
                                    <input
                                        {...register('height')}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                        placeholder={isImperial ? "70" : "180"}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {lang === 'ar' ? 'العمر' : 'Age'}
                                    </label>
                                    <input
                                        {...register('age')}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {lang === 'ar' ? 'الهدف الأساسي' : 'Primary Goal'}
                                    </label>
                                    <select
                                        {...register('goal')}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                    >
                                        <option value="bulking">Bulking / ضخامة</option>
                                        <option value="cutting">Cutting / تنشيف</option>
                                        <option value="strength">Strength / قوة</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div className="flex items-center space-x-2 mt-4 rtl:space-x-reverse">
                        <Checkbox id="createAccount" checked={watch("createAccount")} onCheckedChange={(checked) => setValue('createAccount', checked as boolean)} />
                        <label htmlFor="createAccount" className="text-sm font-medium text-zinc-400 cursor-pointer">
                            {isAr ? "إنشاء حساب تلقائي لمتابعة الطلبات" : "Create an account automatically to track orders"}
                        </label>
                    </div>
                </CardContent>
            </Card>



            {/* Promo Code Section */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gold-500">
                        <Target className="w-5 h-5" />
                        {isAr ? "كود الخصم (Steroid IQ)" : "Steroid IQ Promo"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder={isAr ? "أدخل الكود" : "Enter Code"}
                            className="bg-black/40 border-zinc-700"
                            disabled={promoStatus?.valid}
                        />
                        <Button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={isPromoLoading || promoStatus?.valid || !promoCode}
                            className={cn(
                                "font-bold w-32",
                                promoStatus?.valid ? "bg-green-500 hover:bg-green-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                            )}
                        >
                            {isPromoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : promoStatus?.valid ? <CheckCircle2 className="w-5 h-5" /> : "Apply"}
                        </Button>
                    </div>
                    {promoStatus && (
                        <p className={cn("text-xs font-bold mt-2 flex items-center gap-1", promoStatus.valid ? "text-green-500" : "text-red-500")}>
                            {promoStatus.valid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {promoStatus.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="text-gold-500">03.</span>
                    {isAr ? "طريقة الدفع" : "Payment Method"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'card', icon: CreditCard, label: isAr ? "بطاقة ائتمان" : "Credit Card", sub: "Stripe Secure" },
                        { id: 'paypal', icon: Mail, label: "PayPal", sub: "Express Checkout", disabled: true },
                        { id: 'crypto', icon: ShieldCheck, label: "Crypto", sub: "BTC / ETH / SOL", disabled: true }
                    ].map((method) => (
                        <div
                            key={method.id}
                            onClick={() => !method.disabled && setPaymentMethod(method.id as 'card' | 'paypal' | 'crypto')}
                            className={cn(
                                "relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group",
                                paymentMethod === method.id
                                    ? "bg-gold-500/10 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700",
                                method.disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <method.icon className={cn(
                                "w-8 h-8 mb-4 transition-colors",
                                paymentMethod === method.id ? "text-gold-500" : "text-zinc-500 group-hover:text-zinc-300"
                            )} />
                            <div className="font-black text-sm text-white mb-1">{method.label}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{method.sub}</div>
                            {method.disabled && (
                                <div className="absolute top-2 right-2 bg-zinc-800 text-[8px] font-black px-1.5 py-0.5 rounded text-zinc-500 uppercase">
                                    Soon
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {paymentMethod === 'card' && (
                        <motion.div
                            key="card-interface"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8 bg-zinc-900/50 border-2 border-zinc-800 rounded-[2rem] backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-gold-500" />
                                    <span className="font-black text-xs uppercase tracking-widest text-zinc-400">Card Information</span>
                                </div>
                            </div>
                            <div className="p-4 bg-black/60 rounded-xl border border-zinc-800 focus-within:border-gold-500 transition-all shadow-inner">
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#fff',
                                                fontFamily: 'Inter, sans-serif',
                                                '::placeholder': { color: '#52525b' },
                                            },
                                            invalid: { color: '#ef4444' },
                                        },
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-4 p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
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

            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2 overflow-hidden shadow-2xl">
                <CardFooter className="bg-black/20 p-8 flex flex-col gap-4">
                    {paymentError && (
                        <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs font-bold mb-2">
                            <AlertCircle className="w-4 h-4" />
                            {paymentError}
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={isProcessing || !stripe}
                        className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                    >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                        {isProcessing ? (isAr ? "جاري المعالجة..." : "Processing...") : `${content.payNow} $${finalTotal.toFixed(2)}`}
                    </Button>

                    {/* SpaceRemit Integration */}
                    {window.SpaceRemit && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-zinc-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-zinc-900 px-2 text-zinc-500 font-bold">{isAr ? "أو" : "Or"}</span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => {
                                    if (window.SpaceRemit) {
                                        window.SpaceRemit.Pay({
                                            amount: finalTotal,
                                            currency: 'USD',
                                            description: selectedTier.name,
                                            customer_email: watch('email'),
                                            customer_name: watch('fullName')
                                        });
                                    }
                                }}
                                className="w-full py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg rounded-xl border border-zinc-700"
                            >
                                {isAr ? "الدفع عبر SpaceRemit" : "Pay with SpaceRemit"}
                            </Button>
                        </>
                    )}
                    <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-bold tracking-widest uppercase">
                        <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{content.secureCheckout}</div>
                    </div>
                </CardFooter>
            </Card>
        </form >
    );
};

export const CheckoutForm: React.FC<CheckoutFormProps> = (props) => {
    const { locale } = usePreferences();
    return (
        <Elements stripe={stripePromise} options={{ locale: locale as StripeElementLocale }}>
            <CheckoutFormInner {...props} />
        </Elements>
    );
};
