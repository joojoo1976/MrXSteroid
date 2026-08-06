/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🇪🇬 PAYMOB PRODUCT MODAL — MR. X STEROID                                ║
 * ║  Unified payment modal for the Paymob product catalog.                   ║
 * ║  Supports: Card (5573815) / Wallet (5792309) / Kiosk (5792311)           ║
 * ║  Redirects to Paymob Standalone hosted pages — no API round-trip.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CreditCard, Smartphone, Store, Lock, ShieldCheck,
    CheckCircle2, Loader2, ExternalLink, ChevronRight, Zap,
    Package, Crown, BookOpen, Truck, Star
} from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import {
    PAYMOB_PRODUCTS,
    PAYMOB_INTEGRATION_IDS,
    type PaymobProduct,
    type PaymobPaymentMethod,
    buildPaymobRedirectUrl,
} from '../../shared/lib/paymobProducts';

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymobProductModalProps {
    /** Whether the modal is visible */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Pre-select a product by productId (optional) */
    defaultProductId?: number;
    /** Language preference */
    lang?: 'ar' | 'en';
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAYMENT METHOD CONFIG
// ─────────────────────────────────────────────────────────────────────────────

interface MethodConfig {
    id: PaymobPaymentMethod;
    labelAr: string;
    labelEn: string;
    descAr: string;
    descEn: string;
    icon: React.ElementType;
    integrationId: number;
    badge: string;
}

const PAYMENT_METHODS: MethodConfig[] = [
    {
        id: 'card',
        labelAr: 'بطاقة بنكية / أونلاين',
        labelEn: 'Credit / Debit Card',
        descAr: 'فيزا، ماستركارد، ميزة — بالجنيه المصري',
        descEn: 'Visa, Mastercard, Meeza — in EGP',
        icon: CreditCard,
        integrationId: PAYMOB_INTEGRATION_IDS.card,
        badge: `ID: ${PAYMOB_INTEGRATION_IDS.card}`,
    },
    {
        id: 'wallet',
        labelAr: 'محفظة إلكترونية',
        labelEn: 'Mobile Wallet',
        descAr: 'فودافون كاش، اتصالات كاش، أورنج موني، وي كاش',
        descEn: 'Vodafone Cash, Etisalat, Orange Money, WE Cash',
        icon: Smartphone,
        integrationId: PAYMOB_INTEGRATION_IDS.wallet,
        badge: `ID: ${PAYMOB_INTEGRATION_IDS.wallet}`,
    },
    {
        id: 'kiosk',
        labelAr: 'أمان / مصاري (كاش)',
        labelEn: 'Accept Kiosk (Cash)',
        descAr: 'دفع نقدي بمنافذ أمان ومصاري — كود مرجعي فوري',
        descEn: 'Pay cash at Aman or Masary kiosks with a reference code',
        icon: Store,
        integrationId: PAYMOB_INTEGRATION_IDS.kiosk,
        badge: `ID: ${PAYMOB_INTEGRATION_IDS.kiosk}`,
    },
];

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT ICON MAP
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_ICONS: Record<string, React.ElementType> = {
    digital:       BookOpen,
    bundle:        Package,
    coaching:      Crown,
    coaching_plus: Star,
    shipping:      Truck,
};

const PRODUCT_ACCENT_CLASSES: Record<string, { border: string; bg: string; text: string; badge: string; glow: string }> = {
    gold:   { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]' },
    blue:   { border: 'border-sky-500',   bg: 'bg-sky-500/10',   text: 'text-sky-400',   badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',   glow: 'shadow-[0_0_25px_rgba(14,165,233,0.2)]' },
    purple: { border: 'border-violet-500',bg: 'bg-violet-500/10',text: 'text-violet-400',badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', glow: 'shadow-[0_0_25px_rgba(139,92,246,0.2)]' },
    green:  { border: 'border-emerald-500',bg: 'bg-emerald-500/10',text: 'text-emerald-400',badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]' },
    orange: { border: 'border-orange-500',bg: 'bg-orange-500/10',text: 'text-orange-400',badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.2)]' },
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const PaymobProductModal: React.FC<PaymobProductModalProps> = ({
    isOpen,
    onClose,
    defaultProductId,
    lang = 'ar',
}) => {
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';

    // Step management
    const [step, setStep] = useState<'select-product' | 'select-method' | 'redirecting'>('select-product');
    const [selectedProduct, setSelectedProduct] = useState<PaymobProduct | null>(
        defaultProductId ? (PAYMOB_PRODUCTS.find(p => p.productId === defaultProductId) ?? null) : null
    );
    const [selectedMethod, setSelectedMethod] = useState<PaymobPaymentMethod>('card');
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleProductSelect = useCallback((product: PaymobProduct) => {
        setSelectedProduct(product);
        setStep('select-method');
    }, []);

    const handleBack = useCallback(() => {
        if (step === 'select-method') {
            setStep('select-product');
        }
    }, [step]);

    const handlePay = useCallback(() => {
        if (!selectedProduct) return;
        setIsRedirecting(true);
        setStep('redirecting');

        const redirectUrl = buildPaymobRedirectUrl(selectedProduct, selectedMethod);

        console.log('🚀 [PaymobProductModal] Redirecting to:', {
            product: selectedProduct.nameAr,
            productId: selectedProduct.productId,
            method: selectedMethod,
            integrationId: PAYMOB_INTEGRATION_IDS[selectedMethod],
            priceCents: selectedProduct.priceCents,
            priceEGP: selectedProduct.priceEGP,
            redirectUrl,
        });

        // Small delay for smooth UX, then redirect
        setTimeout(() => {
            window.location.assign(redirectUrl);
        }, 1200);
    }, [selectedProduct, selectedMethod]);

    const handleClose = useCallback(() => {
        if (isRedirecting) return;
        onClose();
        // Reset state after close animation
        setTimeout(() => {
            setStep('select-product');
            setSelectedProduct(
                defaultProductId ? (PAYMOB_PRODUCTS.find(p => p.productId === defaultProductId) ?? null) : null
            );
            setIsRedirecting(false);
        }, 300);
    }, [isRedirecting, onClose, defaultProductId]);

    const formatEGP = (amount: number) =>
        new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(amount);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="paymob-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    dir={dir}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="paymob-modal-panel"
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                        className="relative z-10 w-full max-w-lg bg-[#0a0a0f] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        style={{ boxShadow: '0 0 80px rgba(245,158,11,0.08), 0 25px 60px rgba(0,0,0,0.8)' }}
                    >
                        {/* Header */}
                        <div className="flex-none flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 to-zinc-900/80">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm leading-tight">
                                        {isAr ? 'بوابة دفع Paymob الآمنة' : 'Paymob Secure Checkout'}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                        🇪🇬 Egypt — EGP — SSL 256-bit
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Step indicator */}
                                <div className="hidden sm:flex items-center gap-1.5">
                                    {['select-product', 'select-method'].map((s, i) => (
                                        <div
                                            key={s}
                                            className={cn(
                                                'w-2 h-2 rounded-full transition-all duration-300',
                                                step === s || (step === 'redirecting' && i === 1)
                                                    ? 'bg-amber-500 w-5'
                                                    : step === 'select-method' && i === 0
                                                        ? 'bg-amber-500/50'
                                                        : 'bg-zinc-700'
                                            )}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={handleClose}
                                    disabled={isRedirecting}
                                    className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
                                    aria-label="Close modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            <AnimatePresence mode="wait">

                                {/* ── STEP 1: Product Selection ─────────────────────── */}
                                {step === 'select-product' && (
                                    <motion.div
                                        key="step-product"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.22 }}
                                        className="p-5 space-y-3"
                                    >
                                        <div className="pb-1">
                                            <h2 className="text-base font-black text-white">
                                                {isAr ? 'اختر المنتج المطلوب' : 'Select Your Product'}
                                            </h2>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {isAr
                                                    ? 'جميع الأسعار بالجنيه المصري ومحمية بتشفير SSL'
                                                    : 'All prices in EGP · SSL-protected checkout'}
                                            </p>
                                        </div>

                                        {PAYMOB_PRODUCTS.map((product) => {
                                            const Icon = PRODUCT_ICONS[product.tierId] || BookOpen;
                                            const colors = PRODUCT_ACCENT_CLASSES[product.accent];
                                            return (
                                                <motion.button
                                                    key={product.productId}
                                                    type="button"
                                                    whileHover={{ scale: 1.015 }}
                                                    whileTap={{ scale: 0.985 }}
                                                    onClick={() => handleProductSelect(product)}
                                                    className={cn(
                                                        'w-full text-start p-4 rounded-2xl border-2 transition-all duration-200 group',
                                                        'bg-zinc-900/70 hover:border-zinc-700',
                                                        selectedProduct?.productId === product.productId
                                                            ? `${colors.border} ${colors.bg} ${colors.glow}`
                                                            : 'border-zinc-800'
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={cn(
                                                                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                                                selectedProduct?.productId === product.productId
                                                                    ? `${colors.bg} ${colors.text} border ${colors.border}`
                                                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 group-hover:border-zinc-600'
                                                            )}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-black text-white text-sm leading-tight truncate">
                                                                    {isAr ? product.nameAr : product.nameEn}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    <span className={cn('text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border', colors.badge)}>
                                                                        ID: {product.productId}
                                                                    </span>
                                                                    {product.requiresShipping && (
                                                                        <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                                                                            <Truck className="w-2.5 h-2.5" />
                                                                            {isAr ? 'يتضمن شحن' : 'Ships'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="text-end">
                                                                <p className={cn('font-black text-lg leading-none', colors.text)}>
                                                                    {formatEGP(product.priceEGP)}
                                                                </p>
                                                                <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                                                                    {product.priceCents.toLocaleString()} pts
                                                                </p>
                                                            </div>
                                                            <ChevronRight className={cn(
                                                                'w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                                                                isAr ? 'rotate-180' : '',
                                                                colors.text
                                                            )} />
                                                        </div>
                                                    </div>

                                                    {/* Feature preview */}
                                                    <div className="mt-2.5 pt-2.5 border-t border-zinc-800/60 grid grid-cols-1 gap-0.5">
                                                        {(isAr ? product.featuresAr : product.featuresEn).slice(0, 2).map((f, i) => (
                                                            <p key={i} className="text-[11px] text-zinc-400 leading-relaxed">{f}</p>
                                                        ))}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {/* ── STEP 2: Payment Method ────────────────────────── */}
                                {step === 'select-method' && selectedProduct && (
                                    <motion.div
                                        key="step-method"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.22 }}
                                        className="p-5 space-y-4"
                                    >
                                        {/* Back button + product summary */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0"
                                                aria-label={isAr ? 'رجوع' : 'Back'}
                                            >
                                                <ChevronRight className={cn('w-4 h-4', isAr ? '' : 'rotate-180')} />
                                            </button>
                                            <div>
                                                <p className="text-xs text-zinc-500">{isAr ? 'المنتج المختار' : 'Selected product'}</p>
                                                <p className="font-black text-white text-sm">
                                                    {isAr ? selectedProduct.nameAr : selectedProduct.nameEn}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Summary Card */}
                                        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                                    {isAr ? 'ملخص الطلب' : 'Order Summary'}
                                                </span>
                                                <span className={cn(
                                                    'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                                                    PRODUCT_ACCENT_CLASSES[selectedProduct.accent].badge
                                                )}>
                                                    #{selectedProduct.productId}
                                                </span>
                                            </div>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-black text-white text-sm">
                                                        {isAr ? selectedProduct.nameAr : selectedProduct.nameEn}
                                                    </p>
                                                    <div className="mt-1 space-y-0.5">
                                                        {(isAr ? selectedProduct.featuresAr : selectedProduct.featuresEn).map((f, i) => (
                                                            <p key={i} className="text-[11px] text-zinc-400">{f}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-end shrink-0">
                                                    <p className={cn('font-black text-2xl leading-none', PRODUCT_ACCENT_CLASSES[selectedProduct.accent].text)}>
                                                        {formatEGP(selectedProduct.priceEGP)}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-600 mt-0.5">
                                                        = {selectedProduct.priceCents.toLocaleString()} قرش
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Method Selection */}
                                        <div>
                                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                {isAr ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                                            </h3>
                                            <div className="space-y-2.5">
                                                {PAYMENT_METHODS.map((method) => {
                                                    const MethodIcon = method.icon;
                                                    const isSelected = selectedMethod === method.id;
                                                    return (
                                                        <motion.button
                                                            key={method.id}
                                                            id={`paymob-method-${method.id}`}
                                                            type="button"
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            onClick={() => setSelectedMethod(method.id)}
                                                            className={cn(
                                                                'w-full text-start p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between gap-3',
                                                                isSelected
                                                                    ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20'
                                                                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                                                    isSelected
                                                                        ? 'bg-amber-500 text-black'
                                                                        : 'bg-zinc-800 text-zinc-400'
                                                                )}>
                                                                    <MethodIcon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-white text-sm">
                                                                        {isAr ? method.labelAr : method.labelEn}
                                                                    </p>
                                                                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                                                        {isAr ? method.descAr : method.descEn}
                                                                    </p>
                                                                    <span className="text-[9px] font-black text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 inline-block mt-1">
                                                                        {method.badge}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {isSelected
                                                                ? <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                                                                : <div className="w-5 h-5 rounded-full border-2 border-zinc-700 shrink-0" />
                                                            }
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Security note */}
                                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-emerald-400 font-medium leading-relaxed">
                                                {isAr
                                                    ? 'ستُحوَّل إلى صفحة دفع Paymob المستضافة المؤمَّنة بتشفير SSL 256-bit. لا يُخزَّن أي بيانات بطاقتك لدينا.'
                                                    : 'You will be redirected to a Paymob-hosted payment page secured with 256-bit SSL. We never store your card details.'}
                                            </p>
                                        </div>

                                        {/* CTA Button */}
                                        <motion.button
                                            id="paymob-pay-now-btn"
                                            type="button"
                                            onClick={handlePay}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={cn(
                                                'w-full py-5 px-6 rounded-2xl font-black text-lg text-black flex items-center justify-center gap-3 transition-all',
                                                'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400',
                                                'shadow-[0_0_40px_rgba(245,158,11,0.35)] hover:shadow-[0_0_55px_rgba(245,158,11,0.45)]',
                                                'hover:from-amber-300 hover:via-amber-400 hover:to-amber-300'
                                            )}
                                        >
                                            <Lock className="w-5 h-5" />
                                            <span>
                                                {isAr
                                                    ? `ادفع الآن — ${formatEGP(selectedProduct.priceEGP)}`
                                                    : `Pay Now — ${formatEGP(selectedProduct.priceEGP)}`}
                                            </span>
                                            <ExternalLink className="w-4 h-4 opacity-70" />
                                        </motion.button>

                                        {/* Direct link shortcut */}
                                        {selectedProduct.directLink && (
                                            <p className="text-center text-[11px] text-zinc-600">
                                                {isAr ? 'رابط مختصر: ' : 'Short link: '}
                                                <a
                                                    href={selectedProduct.directLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-amber-500/70 hover:text-amber-400 underline transition-colors font-mono text-[10px]"
                                                >
                                                    {selectedProduct.directLink}
                                                </a>
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* ── STEP 3: Redirecting ───────────────────────────── */}
                                {step === 'redirecting' && (
                                    <motion.div
                                        key="step-redirecting"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-10 flex flex-col items-center justify-center gap-6 text-center min-h-[320px]"
                                    >
                                        {/* Animated spinner ring */}
                                        <div className="relative w-24 h-24">
                                            <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                            <div className="absolute inset-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                <Lock className="w-8 h-8 text-amber-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-white mb-1">
                                                {isAr ? 'جاري التحويل إلى Paymob...' : 'Redirecting to Paymob...'}
                                            </h3>
                                            <p className="text-sm text-zinc-400 font-medium">
                                                {isAr
                                                    ? 'يتم تحويلك الآن إلى صفحة الدفع الآمنة'
                                                    : 'Connecting you to the secure payment page'}
                                            </p>
                                        </div>

                                        {selectedProduct && (
                                            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 w-full max-w-xs">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-zinc-400 font-medium">
                                                        {isAr ? selectedProduct.nameAr : selectedProduct.nameEn}
                                                    </span>
                                                    <span className="font-black text-amber-400">
                                                        {formatEGP(selectedProduct.priceEGP)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] mt-1.5">
                                                    <span className="text-zinc-600">
                                                        {isAr ? 'طريقة الدفع' : 'Method'}
                                                    </span>
                                                    <span className="text-zinc-400 font-bold uppercase">
                                                        {selectedMethod} · ID: {PAYMOB_INTEGRATION_IDS[selectedMethod]}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>{isAr ? 'يرجى الانتظار...' : 'Please wait...'}</span>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex-none border-t border-zinc-800/60 bg-zinc-900/50 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Paymob · SSL 256-bit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-700 font-mono">🇪🇬 EGP</span>
                                <span className="text-[10px] text-zinc-700">•</span>
                                <span className="text-[10px] text-zinc-700 font-mono">PCI-DSS</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymobProductModal;
