import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CheckoutForm, NewPricingTier } from '../features/checkout/CheckoutForm';
import { Button } from '../shared/ui/button';
import { Card } from '../shared/ui/card';
import { ContentStrings, Page, PricingTier, ProductVariant } from '@/shared/types/types';
import BrandLogo from '../shared/ui/BrandLogo';
import { usePreferences } from '../context/PreferencesContext';

import { ProductSelector } from '../features/checkout/ProductSelector';
import { OrderSummary } from '../features/checkout/OrderSummary';

interface CheckoutPageProps {
    content: ContentStrings;
    selectedTier: PricingTier | null;
    navigateTo: (page: Page) => void;
    onSuccess: () => void;
    openLegal: (key: 'privacy' | 'terms' | 'refund' | 'disclaimer') => void;
}

const VARIANT_PRICES: Record<ProductVariant, number> = {
    'digital': 49.99,
    'paperback': 72.00,
    'bundle': 72.00,
    'hardcover': 82.00,
    'coaching': 82.00,
    'coaching_plus': 282.00
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ content, selectedTier, navigateTo, onSuccess, openLegal }) => {
    const { language } = usePreferences();
    const isAr = language === 'ar';

    // Initialize variant based on selectedTier or default to digital
    const [variant, setVariant] = useState<ProductVariant>(() => {
        if (!selectedTier) return 'digital';
        return selectedTier.id as ProductVariant;
    });

    const [quantity, setQuantity] = useState(1);
    const [shippingCost, setShippingCost] = useState(0);

    // Calculate Totals
    const totals = React.useMemo(() => {
        const itemPrice = VARIANT_PRICES[variant];

        // Handle any logic adjustments if needed (coaching vs coaching_plus is already in VARIANT_PRICES)
        const subtotal = itemPrice * quantity;
        const grandTotal = subtotal + shippingCost;
        return { itemPrice, subtotal, shippingCost, grandTotal };
    }, [variant, quantity, shippingCost]);

    // Update Shipping Zone callback (passed to Form)
    const handleLocationChange = (isEg: boolean) => {
        // We can use this for any UI changes later if needed
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
                                lang={language}
                                selectedTier={(selectedTier as NewPricingTier | null) || {
                                    id: variant,
                                    name: variant,
                                    price: totals.subtotal,
                                    description: '',
                                    features: [],
                                    buttonText: '',
                                    requiresShipping: variant !== 'digital',
                                    requiresBodyStats: variant === 'coaching_plus',
                                    selectedLanguage: isAr ? 'ar' : 'en',
                                    includesEbook: true,
                                    includesAudiobook: variant === 'bundle' || variant === 'coaching' || variant === 'coaching_plus',
                                    includesCoaching: variant === 'coaching_plus'
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
                        <OrderSummary
                            content={content}
                            variant={variant}
                            quantity={quantity}
                            totals={totals}
                            isAr={isAr}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
