import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CreditCard, User, Mail, Loader2, AlertCircle, MapPin, Target, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ContentStrings, Language, PricingTier, ProductVariant } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { ShippingProvider, validatePromoCode, calculateShippingRates } from '../../utils/logic';

import { usePreferences } from '../../context/PreferencesContext';

import { paymentService } from '../../services/payment.service';

// Initialize SpaceRemit (Environment Variable with fallback for localized testing)


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

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
    content,
    lang,
    selectedTier,
    productVariant,
    onLocationChange,
    onShippingChange,
    totalAmount,
    openLegal
}) => {
    // Hooks removed: useStripe, useElements
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const { unitSystem, language: prefLang, formatPrice } = usePreferences();
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



    // Unified country watcher
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

    useEffect(() => {
        if (selectedTier.requiresShipping && selectedCountry) {
            const fetchShipping = async () => {
                setIsLoadingShipping(true);
                try {
                    const providers = await calculateShippingRates({ country: selectedCountry });
                    setShippingProviders(providers);
                    onLocationChange(selectedCountry.toLowerCase() === 'egypt' || selectedCountry === 'مصر');
                } catch {
                    toast.error("Failed to load shipping rates");
                } finally {
                    setIsLoadingShipping(false);
                }
            };
            fetchShipping();
        }
    }, [selectedCountry, selectedTier.requiresShipping, onLocationChange]);

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
        } catch {
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
        if (submissionCount >= 3) {
            setPaymentError(isAr ? "لقد تجاوزت عدد محاولات الدفع المسموح بها. يرجى المحاولة لاحقاً." : "Too many payment attempts. Please try again later.");
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Generate a temporary Order ID for tracking if needed before DB insertion
            const tempOrderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Initiate payment via PaymentService
            const result = await paymentService.initiatePayment({
                amount: finalTotal,
                currency: 'USD',
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
                    promoCode: promoCode
                } as unknown as Record<string, unknown>
            });

            if (result.success === false) {

                const err = result.error;
                throw new Error(err?.messageAr || err?.message || 'Payment initiation failed');
            }

            setSubmissionCount(prev => prev + 1);

        } catch (error) {
            console.error(error);
            const msg = (error as Error).message;
            setPaymentError(isAr ? (msg || "حدث خطأ أثناء بدء الدفع.") : (msg || "Error initiating payment."));
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
                                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{provider.estimatedDays} {isAr ? 'أيام للتوصيل' : 'days delivery'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-gold-500">+{formatPrice(provider.price)}</span>
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

                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2 overflow-hidden shadow-2xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{isAr ? "دفع آمن عبر SpaceRemit" : "Secure Payment via SpaceRemit"}</p>
                                        <p className="text-xs text-zinc-500">{isAr ? "بطاقات الائتمان، مدى، والمزيد" : "Credit Cards, Mada, and more"}</p>
                                    </div>
                                </div>
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-black/20 p-8 flex flex-col gap-6">
                        {paymentError && (
                            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs font-bold mb-2">
                                <AlertCircle className="w-4 h-4" />
                                {paymentError}
                            </div>
                        )}

                        {/* Agreement Section - Moved Inside */}
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

                        <Button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all hover:scale-[1.02]"
                        >
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                            {isProcessing ? (isAr ? "جاري المعالجة..." : "Processing...") : `${content.payNow} ${formatPrice(finalTotal)}`}
                        </Button>

                        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-bold tracking-widest uppercase">
                            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{content.secureCheckout}</div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </form >
    );
};
