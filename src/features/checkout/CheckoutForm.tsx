import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, ShieldCheck, CreditCard, User, Mail, Loader2, AlertCircle,
    MapPin, Target, Truck, CheckCircle2, Smartphone, Store, Globe, Phone
} from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../shared/ui/card';
import { Checkbox } from '../../shared/ui/checkbox';
import { ContentStrings, Language, PricingTier, ProductVariant } from '@/shared/types/types';
import { cn } from '../../shared/lib/utils';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useCheckout } from '../../features/checkout/hooks/useCheckout';
import { WORLD_COUNTRIES, EGYPT_GOVERNORATES } from '../../shared/lib/locationData';
import { PhoneInput } from '../../shared/ui/PhoneInput';

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
    onDiscountChange?: (discountAmount: number) => void;
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
    onDiscountChange,
    totalAmount,
    openLegal
}) => {
    const { unitSystem, language: prefLang, formatPrice } = usePreferences();
    const isAr = prefLang === 'ar';
    const isImperial = unitSystem === 'imperial';

    const { user, profileData, isAuthenticated } = useAuth();

    const {
        form: { register, watch, setValue, formState: { errors } },
        isProcessing,
        isRedirecting,
        paymentError,
        shippingProviders,
        isLoadingShipping,
        promoCode,
        setPromoCode,
        promoStatus,
        isPromoLoading,
        discountAmount,
        discountPct,
        formattedTotal,
        selectedShipping,
        handleApplyPromo,
        onSubmit,
        regionOption,
        setRegionOption,
        paymobMethod,
        setPaymobMethod,
        isEg,
    } = useCheckout({
        content,
        lang,
        selectedTier,
        totalAmount,
        productVariant,
        onLocationChange,
        onDiscountChange,
        userId: user?.id,
        userEmail: user?.email,
        userName: profileData?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name
    });

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
        <form onSubmit={onSubmit} className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* ════════════════════════════════════════════════════════════
                1. REGION / LOCATION TOGGLE (داخل مصر 🇪🇬 / خارج مصر 🌍)
            ════════════════════════════════════════════════════════════ */}
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl border-2 overflow-hidden shadow-2xl">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gold-500 text-lg">
                        <Globe className="w-5 h-5 text-gold-500" />
                        {isAr ? "01. حدد موقعك الإقليمي" : "01. Select Your Region"}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                        {isAr
                            ? "تحديد النطاق الجغرافي يضمن عرض وسائل الدفع المتاحة لدولتك مباشرة"
                            : "Select your region to view tailored local or international payment methods"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRegionOption('EG')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                regionOption === 'EG'
                                    ? "bg-gold-500/10 border-gold-500 text-white shadow-[0_0_25px_rgba(234,179,8,0.15)] ring-2 ring-gold-500/20"
                                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            )}
                        >
                            {regionOption === 'EG' && (
                                <CheckCircle2 className="w-4 h-4 text-gold-500 absolute top-2.5 end-2.5" />
                            )}
                            <span className="text-3xl mb-1">🇪🇬</span>
                            <span className="font-black text-sm">{isAr ? "داخل مصر" : "Inside Egypt"}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                EGP (بالجنيه المصري)
                            </span>
                        </motion.button>

                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRegionOption('GLOBAL')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                regionOption === 'GLOBAL'
                                    ? "bg-gold-500/10 border-gold-500 text-white shadow-[0_0_25px_rgba(234,179,8,0.15)] ring-2 ring-gold-500/20"
                                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            )}
                        >
                            {regionOption === 'GLOBAL' && (
                                <CheckCircle2 className="w-4 h-4 text-gold-500 absolute top-2.5 end-2.5" />
                            )}
                            <span className="text-3xl mb-1">🌍</span>
                            <span className="font-black text-sm">{isAr ? "خارج مصر" : "Outside Egypt"}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                USD ($ الدولي)
                            </span>
                        </motion.button>
                    </div>
                </CardContent>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                2. BILLING & CUSTOMER DETAILS
            ════════════════════════════════════════════════════════════ */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gold-500">
                        <User className="w-5 h-5 text-gold-500" />
                        02. {content.billingDetails || (isAr ? "تفاصيل الفاتورة" : "Billing Details")}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        {isAr ? "أدخل تفاصيلك لإتمام طلبك بآمان" : "Enter your contact info to complete the order"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">{content.fullName || (isAr ? "الاسم الكامل" : "Full Name")}</Label>
                        <div className="relative">
                            <User className="absolute start-3 top-3 w-4 h-4 text-zinc-500" />
                            <Input
                                {...register("fullName")}
                                className={cn("ps-10 bg-black/40 border-zinc-800 focus:border-gold-500 transition-all text-sm", errors.fullName && "border-red-500")}
                                placeholder={content.checkout.placeholders.fullName}
                            />
                        </div>
                        {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName.message}</p>}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">{content.emailAddress || (isAr ? "البريد الإلكتروني" : "Email Address")}</Label>
                        <div className="relative">
                            <Mail className="absolute start-3 top-3 w-4 h-4 text-zinc-500" />
                            <Input
                                {...register("email")}
                                type="email"
                                className={cn("ps-10 bg-black/40 border-zinc-800 focus:border-gold-500 transition-all text-sm", errors.email && "border-red-500")}
                                placeholder={content.checkout.placeholders.email}
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                    </div>

                    {/* ── Dual Phone Contact Inputs ────────────────────────────── */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60">
                        {/* Primary Phone */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300 flex items-center justify-between text-xs font-bold">
                                <span>{isAr ? "رقم الموبايل الأساسي للتواصل" : "Primary Phone Number"}</span>
                                <span className="text-[10px] text-gold-500 font-black">{isAr ? "(إجباري)" : "(Required)"}</span>
                            </Label>
                            <PhoneInput
                                value={watch('phoneNumber')}
                                onChange={(v) => setValue('phoneNumber', v, { shouldValidate: true })}
                                countryCode={watch('countryCode')}
                                onCountryChange={(code) => setValue('countryCode', code, { shouldValidate: true })}
                                locale={isAr ? 'ar' : 'en'}
                                error={!!errors.phoneNumber}
                                placeholder="01012345678"
                            />
                            {errors.phoneNumber && <p className="text-xs text-red-500 font-bold">{errors.phoneNumber.message}</p>}
                        </div>

                        {/* Secondary / Alternative Phone */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300 flex items-center justify-between text-xs font-bold">
                                <span>{isAr ? "رقم موبايل إضافي (ضروري)" : "Secondary Phone (Required)"}</span>
                                <span className="text-[10px] text-amber-400 font-black">{isAr ? "(للضرورة)" : "(Backup)"}</span>
                            </Label>
                            <PhoneInput
                                value={watch('secondaryPhoneNumber')}
                                onChange={(v) => setValue('secondaryPhoneNumber', v, { shouldValidate: true })}
                                countryCode={watch('secondaryCountryCode')}
                                onCountryChange={(code) => setValue('secondaryCountryCode', code, { shouldValidate: true })}
                                locale={isAr ? 'ar' : 'en'}
                                error={!!errors.secondaryPhoneNumber}
                                placeholder="01187654321"
                            />
                            {errors.secondaryPhoneNumber && <p className="text-xs text-red-500 font-bold">{errors.secondaryPhoneNumber.message}</p>}
                        </div>
                    </div>

                    {/* Shipping Details if physical product */}
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
                                    {isAr ? 'تفاصيل الشحن والتوصيل' : 'Shipping & Delivery Details'}
                                </h4>

                                {/* 1. COUNTRY SELECTOR (First Component) */}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300 flex items-center justify-between">
                                        <span>{isAr ? "الدولة (موقع التسليم)" : "Country (Delivery Location)"}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                                            {isEg ? "🇪🇬 مصر" : "🌍 شحن دولي"}
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Globe className="absolute start-3 top-3 w-4 h-4 text-gold-500 z-10" />
                                        <select
                                            {...register("country")}
                                            className="w-full ps-10 h-11 rounded-xl bg-black/60 border border-zinc-800 text-white focus:border-gold-500 text-sm appearance-none font-bold cursor-pointer"
                                        >
                                            {WORLD_COUNTRIES.map(country => (
                                                <option key={country.code} value={country.code} className="bg-zinc-900 text-white">
                                                    {isAr ? country.nameAr : country.nameEn}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.country && <p className="text-xs text-red-500 font-bold">{errors.country.message}</p>}
                                </div>

                                {/* Full Street Address */}
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">{isAr ? "العنوان بالتفصيل (اسم الشارع، رقم المبنى، الشقة)" : "Full Street Address"}</Label>
                                    <Input
                                        {...register("address")}
                                        className={cn("bg-black/40 border-zinc-800 focus:border-gold-500 text-sm", errors.address && "border-red-500")}
                                        placeholder={content.checkout.placeholders.address}
                                    />
                                    {errors.address && <p className="text-xs text-red-500 font-bold">{errors.address.message}</p>}
                                </div>

                                {/* City / Governorate & Postal Code */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* City / Governorate Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300 flex items-baseline gap-1.5">
                                            <span>{isAr ? "المدينة" : "City"}</span>
                                            {isEg && (
                                                <span className="text-xs text-zinc-500 font-normal">
                                                    (المحافظة)
                                                </span>
                                            )}
                                        </Label>

                                        {isEg ? (
                                            /* Egyptian Governorates Dropdown */
                                            <div className="relative">
                                                <MapPin className="absolute start-3 top-3 w-4 h-4 text-gold-500 z-10" />
                                                <select
                                                    {...register("city")}
                                                    className={cn(
                                                        "w-full ps-10 h-10 rounded-md bg-black/60 border border-zinc-800 text-white focus:border-gold-500 text-sm appearance-none font-bold cursor-pointer",
                                                        errors.city && "border-red-500"
                                                    )}
                                                >
                                                    <option value="" disabled className="bg-zinc-900 text-zinc-500">
                                                        {isAr ? "-- اختر المحافظة --" : "-- Select Governorate --"}
                                                    </option>
                                                    {EGYPT_GOVERNORATES.map(gov => (
                                                        <option key={gov.id} value={gov.nameAr} className="bg-zinc-900 text-white">
                                                            {isAr ? gov.nameAr : gov.nameEn}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            /* International City Input */
                                            <Input
                                                {...register("city")}
                                                className={cn("bg-black/40 border-zinc-800 focus:border-gold-500", errors.city && "border-red-500")}
                                                placeholder={isAr ? "أدخل اسم المدينة أو الولاية" : "City / State / Region"}
                                            />
                                        )}
                                        {errors.city && <p className="text-xs text-red-500 font-bold">{errors.city.message}</p>}
                                    </div>

                                    {/* Postal Code (Conditional: Optional for EG, Required for Int'l) */}
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300 flex items-center justify-between">
                                            <span>{isAr ? "الرمز البريدي" : "ZIP / Postal Code"}</span>
                                            {isEg ? (
                                                <span className="text-[10px] text-zinc-500 font-bold">
                                                    (اختياري)
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gold-500 font-black">
                                                    (إجباري)
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            {...register("zipCode")}
                                            className={cn("bg-black/40 border-zinc-800 focus:border-gold-500", errors.zipCode && "border-red-500")}
                                            placeholder={isEg ? (isAr ? "غير إجباري داخل مصر" : "Optional in Egypt") : "10001"}
                                        />
                                        {errors.zipCode && <p className="text-xs text-red-500 font-bold">{errors.zipCode.message}</p>}
                                    </div>
                                </div>

                                {/* Dynamic Shipping Options */}
                                <div className="space-y-3">
                                    <Label className="text-zinc-300 flex items-center justify-between">
                                        <span>{isAr ? 'رسوم وشركة الشحن' : 'Shipping Provider & Rates'}</span>
                                        <span className="text-[10px] text-gold-500 font-black uppercase">
                                            {isEg ? "توصيل ثابت داخل مصر" : "International Shipping Calculator"}
                                        </span>
                                    </Label>

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
                                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                                                {provider.estimatedDays} {isAr ? 'أيام للتوصيل' : 'days delivery'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-black text-gold-500">
                                                        +{isEg ? `239 ج.م` : formatPrice(provider.price)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {errors.shippingProvider && <p className="text-xs text-red-500 font-bold">{errors.shippingProvider.message}</p>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Body Stats if required */}
                    {selectedTier.requiresBodyStats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-zinc-800"
                        >
                            <h4 className="text-sm font-black uppercase tracking-widest text-gold-500">
                                {isAr ? 'بيانات التجهيز والمتابعة' : 'Coaching Stats Data'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {isAr ? `الوزن (${isImperial ? 'رطل' : 'كجم'})` : `Weight (${isImperial ? 'lbs' : 'kg'})`}
                                    </label>
                                    <input
                                        {...register('weight')}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                        placeholder={isImperial ? "180" : "85"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {isAr ? `الطول (${isImperial ? 'بوصة' : 'سم'})` : `Height (${isImperial ? 'in' : 'cm'})`}
                                    </label>
                                    <input
                                        {...register('height')}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                        placeholder={isImperial ? "70" : "180"}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {isAr ? 'العمر' : 'Age'}
                                    </label>
                                    <input
                                        {...register('age')}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1.5 text-zinc-500">
                                        {isAr ? 'الهدف الأساسي' : 'Primary Goal'}
                                    </label>
                                    <select
                                        {...register('goal')}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-lg py-2.5 px-4 text-sm"
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

            {/* ════════════════════════════════════════════════════════════
                PROMO CODE CARD
            ════════════════════════════════════════════════════════════ */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gold-500">
                        <Target className="w-5 h-5" />
                        {isAr ? "كود الخصم (Steroid IQ)" : "Steroid IQ Promo Code"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder={isAr ? "أدخل الكود هنا" : "Enter Code (e.g. IQ1P-XXXX)"}
                            className="bg-black/40 border-zinc-700 font-mono tracking-widest uppercase"
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
                            {isPromoLoading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : promoStatus?.valid
                                    ? <CheckCircle2 className="w-5 h-5" />
                                    : (isAr ? "تطبيق" : "Apply")}
                        </Button>
                    </div>

                    {/* Promo Status Feedback */}
                    {promoStatus && (
                        <div className={cn(
                            "mt-3 p-3 rounded-xl border text-sm font-bold flex items-start gap-2",
                            promoStatus.valid
                                ? "bg-green-500/10 border-green-500/30 text-green-400"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                        )}>
                            {promoStatus.valid
                                ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                            <div>
                                <p>{promoStatus.message}</p>
                                {promoStatus.valid && discountAmount > 0 && (
                                    <p className="text-gold-400 font-black mt-1">
                                        {isAr
                                            ? `💰 تم تطبيق خصم ${discountPct > 0 ? `${discountPct}%` : ''} — وفّرت ${isEg
                                                ? new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(discountAmount)
                                                : `$${discountAmount.toFixed(2)}`}`
                                            : `💰 ${discountPct > 0 ? `${discountPct}% off` : ''} applied — You saved ${isEg
                                                ? new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(discountAmount)
                                                : `$${discountAmount.toFixed(2)}`}`
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ════════════════════════════════════════════════════════════
                3. CONDITIONAL PAYMOB PAYMENT GATEWAYS (بوابة Paymob)
            ════════════════════════════════════════════════════════════ */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="text-gold-500">03.</span>
                    {isAr ? "اختر طريقة الدفع المناسبة عبر Paymob" : "Select Payment Method via Paymob"}
                </h3>

                <Card id="checkout-payment-methods" className="bg-zinc-900/60 border-zinc-800 backdrop-blur-xl border-2 overflow-hidden shadow-2xl scroll-mt-32">
                    <CardContent className="p-6 space-y-5">
                        
                        {/* LOCAL EGYPT PAYMENT METHODS (داخل مصر 🇪🇬) */}
                        {isEg ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                                        🇪🇬 {isAr ? "وسائل الدفع المحلية المتاحة في مصر (EGP)" : "Local Egypt Payment Methods (EGP)"}
                                    </span>
                                </div>

                                {/* Option 1: Card (5573815) */}
                                <motion.div
                                    id="checkout-method-card"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('card')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'card'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'card' ? "bg-gold-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "بطاقة بنكية / أونلاين (Online Card)" : "Online Credit / Debit Card"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "فيزا / ماستركارد بالجنيه المصري (ID: 5573815)" : "Visa & Mastercard online in EGP"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                            Paymob
                                        </span>
                                        {paymobMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                    </div>
                                </motion.div>

                                {/* Option 2: Mobile Wallet (5792309) */}
                                <motion.div
                                    id="checkout-method-wallet"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('wallet')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3",
                                        paymobMethod === 'wallet'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'wallet' ? "bg-gold-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm">
                                                    {isAr ? "محفظة إلكترونية (Mobile Wallets)" : "Mobile Wallets (Vodafone Cash / Orange / Etisalat)"}
                                                </p>
                                                <p className="text-xs text-zinc-400 font-medium">
                                                    {isAr ? "فودافون كاش، اتصالات، أورنج، وي كاش (ID: 5792309)" : "Vodafone Cash, Etisalat Cash, Orange Money"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                                Paymob
                                            </span>
                                            {paymobMethod === 'wallet' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                        </div>
                                    </div>

                                    {/* Optional Wallet Phone Number Input */}
                                    {paymobMethod === 'wallet' && (
                                        <div className="pt-2 border-t border-gold-500/20">
                                            <Label className="text-xs text-gold-400 font-bold mb-1 block">
                                                {isAr ? "رقم المحفظة الإلكترونية (اختياري)" : "Wallet Phone Number (Optional)"}
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute start-3 top-3 w-4 h-4 text-zinc-500" />
                                                <Input
                                                    {...register("phoneNumber")}
                                                    className="ps-10 bg-black/60 border-zinc-700 text-sm focus:border-gold-500"
                                                    placeholder="010xxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Option 3: Accept Kiosk / Cash (5792311) */}
                                <motion.div
                                    id="checkout-method-kiosk"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('kiosk')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'kiosk'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", paymobMethod === 'kiosk' ? "bg-gold-500 text-black font-bold" : "bg-zinc-800 text-zinc-400")}>
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "أمان / مصاري / كاش (Accept Kiosk)" : "Accept Kiosk Cash (Aman / Masary)"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع نقدي بمنافذ أمان ومصاري بسلسلة كود مرجعي (ID: 5792311)" : "Pay cash via Aman or Masary kiosk codes"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                            Paymob
                                        </span>
                                        {paymobMethod === 'kiosk' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            /* INTERNATIONAL PAYMENT METHOD (خارج مصر 🌍) */
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                                        🌍 {isAr ? "وسيلة الدفع الدولية المتاحة (USD)" : "International Payment Gateway (USD)"}
                                    </span>
                                </div>

                                <motion.div
                                    id="checkout-method-paypal"
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setPaymobMethod('paypal')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4",
                                        paymobMethod === 'paypal'
                                            ? "border-gold-500 bg-gold-500/10 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold-500/30"
                                            : "border-zinc-800 bg-black/30 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-gold-500 text-black font-bold flex items-center justify-center shrink-0">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">
                                                {isAr ? "PayPal / بطاقة دولية (Paymob PayPal)" : "PayPal & Global Credit Cards"}
                                            </p>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                {isAr ? "دفع آمن دولياً بالدولار الأمريكي (ID: 5792310)" : "Secure international payment in USD"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                            Paymob PayPal
                                        </span>
                                        {paymobMethod === 'paypal' && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Security Notice */}
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 mt-4">
                            <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-green-400 font-medium leading-relaxed">
                                {isAr
                                    ? "جميع المعاملات تتم عبر مشفرات Paymob المعتمدة بنظام 256-bit SSL. يتم توليد رابط عملية الدفع المباشر فور الضغط على الزر أدناه."
                                    : "All transactions are secured via Paymob 256-bit SSL encryption. You will be redirected directly to your selected Paymob checkout page."}
                            </p>
                        </div>
                    </CardContent>

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

                        {/* Paymob Submit Button */}
                        <Button
                            id="checkout-submit-btn"
                            type="submit"
                            disabled={isProcessing || isRedirecting}
                            className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.25)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isProcessing || isRedirecting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Lock className="w-5 h-5" />
                                )}
                                <span>
                                    {isRedirecting
                                        ? (isAr ? "جاري التحويل لـ Paymob..." : "Redirecting to Paymob...")
                                        : isProcessing
                                            ? (isAr ? "جاري معالجة الطلب..." : "Processing Order...")
                                            : `${content.payNow} ${formattedTotal}`}
                                </span>
                            </span>
                        </Button>

                        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-bold tracking-widest uppercase">
                            <div className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />{content.secureCheckout}</div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
};

export default CheckoutForm;
