'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CheckoutForm, NewPricingTier } from '../features/checkout/CheckoutForm';
import { Button } from '../shared/ui/button';
import { Card } from '../shared/ui/card';
import { ContentStrings, Page, PricingTier, ProductVariant } from '@/shared/types/types';
import DynamicBrandLogo from '../shared/ui/DynamicBrandLogo';
import { usePreferences } from '../context/PreferencesContext';
import { useRegion } from '../context/RegionContext';

import { ProductSelector } from '../features/checkout/ProductSelector';
import { OrderSummary } from '../features/checkout/OrderSummary';
import { EGP_PRICES, COACHING_ADDON_EGP, COACHING_ADDON_USD } from '../shared/lib/logic';

interface CheckoutPageProps {
    content: ContentStrings;
    selectedTier: PricingTier | null;
    navigateTo: (page: Page) => void;
    onSuccess: () => void;
    openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}

const USD_PRICES: Record<string, number> = {
    digital:       49.99,
    bundle:        72.00,
    coaching:      82.00,
    coaching_plus: 82.00, // base only — COACHING_ADDON_USD added by totals useMemo
    bundle_plus:   72.00, // base only — COACHING_ADDON_USD added by totals useMemo
    digital_plus:  49.99, // base only — COACHING_ADDON_USD added by totals useMemo
    paperback:     72.00,
    hardcover:     82.00,
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ content, selectedTier, navigateTo, onSuccess, openLegal }) => {
    const { language } = usePreferences();
    const { isEgypt: isGeoEgypt } = useRegion();
    const isAr = language === 'ar';

    // Initialize variant based on selectedTier or default to digital
    const [variant, setVariant] = useState<ProductVariant>(() => {
        if (!selectedTier) return 'digital';
        return selectedTier.id as ProductVariant;
    });

    const [quantity, setQuantity] = useState(1);
    const [shippingCost, setShippingCost] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);

    // ── Region state — driven from: selectedTier (initial) > geo > default ──
    const [isEg, setIsEg] = useState<boolean>(() => {
        if (selectedTier?.selectedLocation) return selectedTier.selectedLocation === 'EG';
        return isAr || isGeoEgypt;
    });

    // Handle Region Toggle from ProductSelector
    const handleRegionChange = useCallback((newIsEg: boolean) => {
        setIsEg(newIsEg);
    }, []);

    const handleDiscountChange = useCallback((amount: number) => {
        setDiscountAmount(amount);
    }, []);

    // ── Totals ──────────────────────────────────────────────────────────────
    const totals = React.useMemo(() => {
        const isPlus = variant.endsWith('_plus');
        const baseVariant = isPlus ? variant.replace('_plus', '') : variant;

        let itemPrice: number;
        let addonPrice: number = 0;

        if (isEg) {
            itemPrice = EGP_PRICES[baseVariant as ProductVariant] ?? EGP_PRICES['bundle'];
            if (isPlus) addonPrice = COACHING_ADDON_EGP;
        } else {
            itemPrice = USD_PRICES[baseVariant as ProductVariant] ?? USD_PRICES['bundle'];
            if (isPlus) addonPrice = COACHING_ADDON_USD;
        }

        const subtotal = itemPrice * quantity;
        const grandTotal = Math.max(0, subtotal + addonPrice + shippingCost - discountAmount);
        return { itemPrice, subtotal, addonPrice, shippingCost, discountAmount, grandTotal };
    }, [variant, quantity, shippingCost, isEg, discountAmount]);

    // Handle shipping cost from CheckoutForm
    const handleLocationChange = useCallback((egFromForm: boolean) => {
        // sync region with CheckoutForm region toggle (if user changes region inside form)
        setIsEg(egFromForm);
    }, []);

    if (!selectedTier && !variant) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10 text-zinc-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white">{isAr ? 'سلة التسوق فارغة' : 'Your cart is empty'}</h2>
                    <p className="text-zinc-400">{isAr ? 'يرجى اختيار باقة قبل المتابعة لإتمام الدفع.' : 'Please select a plan before proceeding to checkout.'}</p>
                    <Button onClick={() => navigateTo(Page.HOME)} className="w-full bg-gold-500 text-black font-black">
                        {content.backToHome || (isAr ? 'العودة للرئيسية' : 'Back to Home')}
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
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-8 mb-16 px-4">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <Button
                            variant="ghost"
                            onClick={() => navigateTo(Page.HOME)}
                            className="group hover:bg-white/5 text-zinc-400 hover:text-white mb-4"
                        >
                            <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''} mr-2 group-hover:-translate-x-1 transition-transform`} />
                            {isAr ? 'رجوع' : 'Back'}
                        </Button>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* DynamicBrandLogo with min-w to prevent clipping */}
                            <div className="min-w-max shrink-0">
                                <DynamicBrandLogo variant="full" showMascot={false} className="text-2xl md:text-3xl" />
                            </div>
                            <div className="h-8 w-px bg-zinc-800 hidden md:block shrink-0" />
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-400 whitespace-nowrap">
                                {content.checkoutTitle || (isAr ? 'إتمام الدفع' : 'Secure Checkout')}
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shrink-0"
                    >
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none mb-1">Security Status</p>
                            <p className="text-xs font-black text-green-500 uppercase leading-none">AES-256 Encrypted</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* ── Main Checkout Section ───────────────────────────── */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="lg:col-span-8 space-y-8"
                    >
                        {/* 01 + 02. Product Selection with Region Toggle */}
                        <ProductSelector
                            selectedVariant={variant}
                            onSelectVariant={setVariant}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            isAr={isAr}
                            isEg={isEg}
                            onRegionChange={handleRegionChange}
                        />

                        {/* 03. Payment Details */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <span className="text-gold-500">03.</span>
                                {isAr ? 'بيانات الدفع وإتمام الطلب' : 'Payment & Order Completion'}
                            </h3>
                            <CheckoutForm
                                content={content}
                                lang={language}
                                selectedTier={(selectedTier as NewPricingTier | null) || {
                                    id: variant,
                                    name: variant,
                                    price: totals.subtotal + (totals.addonPrice || 0),
                                    description: '',
                                    features: [],
                                    buttonText: '',
                                    requiresShipping: variant !== 'digital' && variant !== 'digital_plus',
                                    requiresBodyStats: variant === 'coaching_plus' || variant === 'bundle_plus',
                                    selectedLanguage: isAr ? 'ar' : 'en',
                                    selectedLocation: isEg ? 'EG' : 'GLOBAL',
                                    includesEbook: true,
                                    includesAudiobook: variant === 'bundle' || variant === 'bundle_plus' || variant === 'coaching' || variant === 'coaching_plus',
                                    includesCoaching: variant === 'coaching_plus' || variant === 'bundle_plus',
                                } as NewPricingTier}
                                onSuccess={onSuccess}
                                productVariant={variant}
                                quantity={quantity}
                                isEg={isEg}
                                onLocationChange={handleLocationChange}
                                onShippingChange={setShippingCost}
                                onDiscountChange={handleDiscountChange}
                                totalAmount={totals.subtotal + (totals.addonPrice || 0)}
                                openLegal={openLegal}
                            />
                        </div>
                    </motion.div>

                    {/* ── Sticky Order Summary Sidebar ────────────────────── */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="lg:col-span-4 lg:sticky lg:top-32"
                    >
                        <OrderSummary
                            content={content}
                            variant={variant}
                            quantity={quantity}
                            totals={totals}
                            isAr={isAr}
                            isEg={isEg}
                            onSubmitOrder={() => document.getElementById('checkout-submit-btn')?.click()}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
