import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CreditCard, User, Mail, Loader2, AlertCircle, MapPin, Target, Truck, CheckCircle2 } from 'lucide-react';
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
    const { unitSystem, language: prefLang, formatPrice } = usePreferences();
    const isAr = prefLang === 'ar';
    const isImperial = unitSystem === 'imperial';

    // Import useAuth to get authenticated user data
    const { user, profileData, isAuthenticated } = useAuth();

    // Using the new specialized hook for logic
    const {
        form: { register, watch, setValue, formState: { errors } },
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
        selectedShipping,
        handleApplyPromo,
        onSubmit,
        // Embedded payment flow
        isCardElementReady,
        setIsCardElementReady,
        spaceremitCode,
        setSpaceremitCode,
        paymentMethod,
        setPaymentMethod,
        prefCurrency
    } = useCheckout({
        content,
        lang,
        selectedTier,
        totalAmount,
        productVariant,
        onLocationChange,
        userId: user?.id,
        userEmail: user?.email,
        userName: profileData?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name
    });

    // Auto-fill form with authenticated user data
    useEffect(() => {
        if (isAuthenticated && user && user.email) {
            // Fill email from auth user
            const currentEmail = watch('email');
            if (!currentEmail) {
                setValue('email', user.email, { shouldValidate: true });
            }

            // Fill full name from profile data or user metadata
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

    // Store card info in form metadata
    useEffect(() => {
        if (spaceremitCode) {
            console.log('💳 SpaceRemit code received:', spaceremitCode);
        }
    }, [spaceremitCode]);

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
        <form id="spaceremit-checkout-form" onSubmit={onSubmit} className="space-y-8">
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

                    {selectedTier.requiresBodyStats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-zinc-800"
                        >
                            <h4 className="text-sm font-black uppercase tracking-widest text-gold-500">
                                {isAr ? 'بيانات التجهيز و المتابعة' : 'Preparation & Coaching Data'}
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
                            {/* Secure Payment Info — Multi-Gateway Redirect */}
                            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">
                                            {isAr ? "دفع آمن ومشفّر" : "Secure Encrypted Payment"}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {isAr ? "Visa, Mastercard, مدى، وأكثر" : "Visa, Mastercard, Mada, and more"}
                                        </p>
                                    </div>
                                </div>
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                            </div>

                            {/* Accepted Payment Badges */}
                            <div className="flex items-center justify-center gap-3">
                                {['VISA', 'Mastercard', 'Mada'].map((card) => (
                                    <div key={card} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-300">
                                        {card}
                                    </div>
                                ))}
                            </div>

                            {/* Payment Info Box */}
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                                <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-green-400 font-medium leading-relaxed">
                                    {isAr
                                        ? "عند الضغط على زر الدفع، سيتم تحويلك تلقائياً إلى صفحة دفع آمنة حسب دولتك لإدخال بيانات البطاقة. نحن لا نخزن أي بيانات بنكية."
                                        : "When you click Pay, you'll be redirected to a secure payment page selected for your country. We never store any banking information."}
                                </p>
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

                        {/* Redirecting State Overlay */}
                        {isRedirecting && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center space-y-4"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                                    <span className="text-green-400 font-black text-lg">
                                        {isAr ? "جاري التحويل إلى صفحة الدفع الآمنة..." : "Redirecting to secure payment..."}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400">
                                    {isAr
                                        ? "سيتم تحويلك الآن إلى SpaceRemit لإدخال بيانات البطاقة البنكية"
                                        : "You will be redirected to SpaceRemit to enter your card details"}
                                </p>
                                {redirectUrl && (
                                    <a
                                        href={redirectUrl}
                                        className="inline-block text-xs text-gold-500 hover:text-gold-400 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {isAr ? "إذا لم يتم التحويل تلقائياً، اضغط هنا" : "If not redirected automatically, click here"}
                                    </a>
                                )}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={isProcessing || isRedirecting}
                            className="w-full py-8 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all hover:scale-[1.02] disabled:opacity-70"
                        >
                            {isProcessing || isRedirecting ? (
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            ) : (
                                <Lock className="w-5 h-5 mr-2" />
                            )}
                            {isRedirecting
                                ? (isAr ? "جاري التحويل..." : "Redirecting...")
                                : isProcessing
                                    ? (isAr ? "جاري المعالجة..." : "Processing...")
                                    : `${content.payNow} ${formatPrice(finalTotal)}`}
                        </Button>

                        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 font-bold tracking-widest uppercase">
                            <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{content.secureCheckout}</div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
};
