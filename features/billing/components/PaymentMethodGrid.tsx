'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, QrCode, ShieldCheck, Wallet, Check } from 'lucide-react';
import { RegionalMarket } from '../types/billing.types';
import { PAYMENT_METHODS } from '../config/pricing.config';

interface PaymentMethodGridProps {
    market: RegionalMarket;
    selectedMethodId: string;
    onSelectMethod: (methodId: string) => void;
    isRTL?: boolean;
}

export const PaymentMethodGrid: React.FC<PaymentMethodGridProps> = ({
    market,
    selectedMethodId,
    onSelectMethod,
    isRTL = true
}) => {
    const availableMethods = PAYMENT_METHODS.filter(m => m.supportedRegions.includes(market));

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'CreditCard':
                return <CreditCard className="w-5 h-5 text-gold-400" />;
            case 'Smartphone':
                return <Smartphone className="w-5 h-5 text-emerald-400" />;
            case 'QrCode':
                return <QrCode className="w-5 h-5 text-amber-400" />;
            case 'ShieldCheck':
                return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
            case 'Wallet':
                return <Wallet className="w-5 h-5 text-blue-400" />;
            default:
                return <CreditCard className="w-5 h-5 text-zinc-400" />;
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    {isRTL ? 'اختر طريقة الدفع المناسبة' : 'Select Payment Method'}
                </span>
                <span className="text-[10px] font-bold text-zinc-500">
                    {market === 'EG' ? (isRTL ? 'معالجة عبر Paymob مصر' : 'Processed via Paymob Egypt') : (isRTL ? 'معالجة عبر Stripe و PayPal' : 'Processed via Stripe & PayPal')}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
                {availableMethods.map((method) => {
                    const isSelected = selectedMethodId === method.id;
                    return (
                        <motion.div
                            key={method.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelectMethod(method.id)}
                            className={`relative flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                    ? 'bg-zinc-900 border-gold-500/80 shadow-lg shadow-gold-500/10'
                                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                            }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                    isSelected
                                        ? 'bg-zinc-800 border-gold-500/40'
                                        : 'bg-zinc-900 border-zinc-800'
                                }`}>
                                    {renderIcon(method.icon)}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs md:text-sm font-black text-white">
                                            {isRTL ? method.nameAr : method.nameEn}
                                        </span>
                                        {method.badge && (
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 border border-gold-500/30">
                                                {method.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                                        {isRTL ? method.descriptionAr : method.descriptionEn}
                                    </p>
                                </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected
                                    ? 'border-gold-500 bg-gold-500 text-black'
                                    : 'border-zinc-700 bg-zinc-900'
                            }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
