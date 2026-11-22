'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Loader2, MapPin, Truck, Globe } from 'lucide-react';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/ui/card';
import { Checkbox } from '../../../shared/ui/checkbox';
import { ContentStrings } from '@/shared/types/types';
import { cn } from '../../../shared/lib/utils';
import { EGYPT_FIXED_SHIPPING_EGP, WORLD_COUNTRIES, EGYPT_GOVERNORATES } from '../../../shared/lib/locationData';
import { PhoneInput } from '../../../shared/ui/PhoneInput';
import type { CheckoutController, NewPricingTier } from '../checkoutFormTypes';

interface CheckoutBillingCardProps {
    content: ContentStrings;
    isAr: boolean;
    isImperial: boolean;
    isEg: boolean;
    selectedTier: NewPricingTier;
    formatPrice: (amount: number) => string;
    checkout: CheckoutController;
}

export function CheckoutBillingCard({
    content,
    isAr,
    isImperial,
    isEg,
    selectedTier,
    formatPrice,
    checkout,
}: CheckoutBillingCardProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = checkout.form;
    const { shippingProviders, isLoadingShipping } = checkout;

    return (
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
                                                        +{isEg ? `${EGYPT_FIXED_SHIPPING_EGP} ج.م.` : formatPrice(provider.price)}
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
    );
}
