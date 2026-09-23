'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

/**
 * StoreButton — International Store Navigation Component
 * Opens shop.mrxsteroid.com in a new tab
 * Follows MrXSteroid design system: dark background, neon green accent
 */
export const StoreButton: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { language } = usePreferences();
    const isAr = language === 'ar';

    const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://shop.mrxsteroid.com';

    const handleClick = () => {
        window.open(storeUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleClick}
            className={`
                group relative
                bg-[#39FF14] hover:bg-[#2FE000]
                text-black font-black
                px-5 py-2.5 rounded-xl
                transition-all duration-300
                hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]
                active:scale-95
                flex items-center gap-2
                ${className}
            `}
            aria-label={isAr ? 'افتح المتجر الدولي' : 'Open International Store'}
        >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm tracking-tight">
                {isAr ? 'المتجر' : 'Shop'}
            </span>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-xl bg-[#39FF14] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none" />
        </button>
    );
};

export default StoreButton;
