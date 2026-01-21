import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { CheckoutForm, NewPricingTier } from '../components/checkout/CheckoutForm';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ContentStrings, Language, Page, PricingTier } from '../types';
import BrandLogo from '../components/BrandLogo';

import { ProductSelector, ProductVariant } from '../components/checkout/ProductSelector';
import { ShippingZone } from '../types';

interface CheckoutPageProps {
    content: ContentStrings;
    lang: Language;
    selectedTier: PricingTier | null;
    navigateTo: (page: Page) => void;
    onSuccess: () => void;
    openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}

const VARIANT_PRICES: Record<ProductVariant, number> = {
    'digital': 49.99,
    'paperback': 72.00,
    'hardcover': 249.99
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ content, lang, selectedTier, navigateTo, onSuccess, openLegal }) => {
    const isAr = lang === 'ar';

    // Initialize variant based on selectedTier or default to digital
    const [variant, setVariant] = useState<ProductVariant>(() => {
        if (!selectedTier) return 'digital';
        const nameLower = selectedTier.name.toLowerCase();
        if (nameLower.includes('hard')) return 'hardcover';
        if (nameLower.includes('paper') || nameLower.includes('soft')) return 'paperback';
        return 'digital';
    });

    const [quantity, setQuantity] = useState(1);
    const [isEgypt, setIsEgypt] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);

    // Calculate Totals
    const totals = React.useMemo(() => {
        const itemPrice = selectedTier?.price || VARIANT_PRICES[variant];
        const subtotal = itemPrice * quantity;
        const grandTotal = subtotal + shippingCost;
        return { itemPrice, subtotal, shippingCost, grandTotal };
    }, [variant, quantity, shippingCost, selectedTier]);

    // Update Shipping Zone callback (passed to Form)
    const handleLocationChange = (isEg: boolean) => {
        setIsEgypt(isEg);
    };

    if (!selectedTier && !variant) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10 text-zinc-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white">{isAr ? "سلة التسوق فارغة" : "Your cart is empty"}</h2>
                    <p className="text-zinc-400">{isAr ? "يرجى اختيار باقة قبل المتابعة لإتمام الدفع." : "Please select a plan before proceeding to checkout."}</p>
                    <Button onClick={() => navigateTo(Page.HOME)} className="w-full bg-gold-500 text-black font-black">
                        {content.backToHome || (isAr ? "العودة للرئيسية" : "Back to Home")}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <Button
                            variant="ghost"
                            onClick={() => navigateTo(Page.HOME)}
                            className="group hover:bg-white/5 text-zinc-400 hover:text-white mb-4"
                        >
                            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''} mr-2 group-hover:-translate-x-1 transition-transform`} />
                            {isAr ? "رجوع" : "Back"}
                        </Button>
                        <div className="flex items-center gap-4">
                            <BrandLogo className="text-3xl" />
                            <div className="h-8 w-px bg-zinc-800 hidden md:block" />
                            <h1 className="text-3xl font-black tracking-tighter uppercase text-zinc-400">
                                {content.checkoutTitle || (isAr ? "إتمام الدفع" : "Secure Checkout")}
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl"
                    >
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none mb-1">Security Status</p>
                            <p className="text-xs font-black text-green-500 uppercase leading-none">AES-256 Encrypted</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Main Checkout Section (Form) */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="lg:col-span-8 space-y-8"
                    >
                        {/* 01. Product Selection */}
                        <ProductSelector
                            selectedVariant={variant}
                            onSelectVariant={setVariant}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            isAr={isAr}
                        />

                        {/* 02. Customer & Payment Details */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                {content.orderSummary}
                            </h3>
                            <CheckoutForm
                                content={content}
                                lang={lang}
                                selectedTier={(selectedTier as NewPricingTier | null) || {
                                    id: variant,
                                    name: variant,
                                    price: totals.subtotal,
                                    description: '',
                                    features: [],
                                    buttonText: '',
                                    requiresShipping: variant !== 'digital',
                                    requiresBodyStats: variant === 'hardcover',
                                    selectedLanguage: isAr ? 'ar' : 'en',
                                    includesEbook: true,
                                    includesAudiobook: false,
                                    includesCoaching: variant === 'hardcover'
                                } as NewPricingTier}
                                onSuccess={onSuccess}
                                productVariant={variant}
                                quantity={quantity}
                                onLocationChange={handleLocationChange}
                                onShippingChange={setShippingCost}
                                totalAmount={totals.subtotal}
                                openLegal={openLegal}
                            />
                        </div>
                    </motion.div>

                    {/* Sticky Order Summary Sidebar */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="lg:col-span-4 lg:sticky lg:top-32"
                    >
                        <Card className="bg-zinc-900 border-zinc-800 shadow-3xl overflow-hidden border-2 rounded-[2.5rem]">
                            <div className="p-8 border-b border-zinc-800 bg-black/40">
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <ShoppingBag className="w-5 h-5 text-gold-500" />
                                    {content.orderSummary || (isAr ? "ملخص الطلب" : "Order Summary")}
                                </h3>
                            </div>

                            <CardContent className="p-8 space-y-8">
                                <div className="flex gap-6 items-center">
                                    <div className="w-24 h-32 bg-zinc-800 rounded-xl flex-shrink-0 relative group overflow-hidden border border-white/5 shadow-2xl">
                                        <img
                                            src={isAr ? "/cover-ar.webp" : "/cover-en.webp"}
                                            alt="Product Cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/20 to-transparent pointer-events-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black leading-tight text-white mb-1">
                                            Mr. X-Steroid: <span className="text-gold-500 capitalize">{variant} Edition</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md border border-white/5">
                                                Quantity: {quantity}
                                            </span>
                                            {variant !== 'digital' && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md border border-white/5">
                                                    Weight: {variant === 'hardcover' ? '1.2kg' : '0.8kg'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between text-zinc-400 font-bold">
                                        <span>{content.subtotal}</span>
                                        <span>${totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    {totals.shippingCost > 0 && (
                                        <div className="flex justify-between text-zinc-400 font-bold">
                                            <span>{content.shipping}</span>
                                            <span>+${totals.shippingCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-zinc-800 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">
                                            {content.total}
                                        </p>
                                        <p className="text-sm text-zinc-400 flex items-center gap-1">
                                            <Lock className="w-3 h-3" />
                                            {content.secureCheckout}
                                        </p>
                                    </div>
                                    <div className="text-5xl font-black tracking-tighter text-gold-500">
                                        ${totals.grandTotal.toFixed(2)}
                                    </div>
                                </div>
                            </CardContent>

                            <div className="p-8 bg-black/40 border-t border-zinc-800">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <CheckCircle2 className="w-5 h-5 text-gold-500 shrink-0 mt-1" />
                                    <div className="text-xs text-zinc-400 leading-relaxed font-bold">
                                        {content.securePaymentMessage}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
