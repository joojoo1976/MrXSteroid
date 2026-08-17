'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin } from 'lucide-react';
import { RegionalMarket } from '../types/billing.types';

interface RegionalSelectorProps {
    currentMarket: RegionalMarket;
    onMarketChange: (market: RegionalMarket) => void;
    isRTL?: boolean;
}

export const RegionalSelector: React.FC<RegionalSelectorProps> = ({
    currentMarket,
    onMarketChange,
    isRTL = true
}) => {
    return (
        <div className="inline-flex p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-xl">
            <button
                type="button"
                onClick={() => onMarketChange('EG')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    currentMarket === 'EG'
                        ? 'text-black shadow-lg shadow-gold-500/20'
                        : 'text-zinc-400 hover:text-white'
                }`}
            >
                {currentMarket === 'EG' && (
                    <motion.div
                        layoutId="regional-selector-active"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'داخل مصر (جنيه مصري EGP)' : 'Egypt (EGP)'}</span>
                </span>
            </button>

            <button
                type="button"
                onClick={() => onMarketChange('GLOBAL')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    currentMarket === 'GLOBAL'
                        ? 'text-black shadow-lg shadow-cyan-500/20'
                        : 'text-zinc-400 hover:text-white'
                }`}
            >
                {currentMarket === 'GLOBAL' && (
                    <motion.div
                        layoutId="regional-selector-active"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'دولي / خارج مصر (USD $)' : 'International (USD $)'}</span>
                </span>
            </button>
        </div>
    );
};
