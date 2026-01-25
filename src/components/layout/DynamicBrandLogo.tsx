import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { motion } from 'framer-motion';

// -------------- Brand Text Component (For Non-English) --------------
export const BrandText: React.FC<{ isRTL: boolean; variant: 'full' | 'short' }> = ({ isRTL, variant }) => {
    const textVariants = {
        animate: {
            scale: [1, 1.02, 1],
            rotate: [0, -1, 1, 0],
            filter: [
                "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.6))",
                "drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.8))",
                "drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.6))"
            ],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <motion.span
            variants={textVariants}
            animate="animate"
            className={`font-black tracking-tighter brand-cartoon-sm select-none
                ${isRTL ? 'font-[Cairo]' : 'font-[Inter]'}
                ${variant === 'full' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}
            `}
        >
            {/* 
               Conditional rendering of text based on variant.
               Assuming "Mr. X-Steroid" (Full) vs "Mr. X" (Short).
               We hardcode arabic here as per previous component pattern, 
               but ideally this should come from i18n if dynamic.
               For now adapting from BrandBranding.tsx logic.
            */}
            <span className="text-gold-500">مستر</span>
            <span className="text-white mx-1">إكس</span>
            {variant === 'full' && (
                <>
                    <span className="text-zinc-500">-</span>
                    <span className="text-gold-500">سترويد</span>
                </>
            )}
        </motion.span>
    );
};

// -------------- Main Dynamic Component --------------
export interface DynamicBrandLogoProps {
    variant?: 'full' | 'short';
    onClick?: () => void;
    className?: string; // Allow extra styling from parent
}

export const DynamicBrandLogo: React.FC<DynamicBrandLogoProps> = ({
    variant = 'full',
    onClick,
    className = ""
}) => {
    const { language, isRTL } = usePreferences();
    const isEn = language === 'en';

    // Animation variants
    const containerVariants = {
        hover: {
            scale: 1.05,
            rotate: isEn ? -2 : 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <div
            onClick={onClick}
            className={`inline-block outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-lg cursor-pointer ${className}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            aria-label={variant === 'full' ? "Mr. X-Steroid Home" : "Mr. X Home"}
        >
            <motion.div
                variants={containerVariants}
                whileHover="hover"
                className="flex items-center justify-center"
            >
                {isEn ? (
                    /* ENGLISH: Image-based Logo */
                    <div className="relative">
                        <img
                            src={variant === 'full' ? "/images/MrXSteroid_Labol2.png" : "/images/MrX_Labol2.png"}
                            alt={variant === 'full' ? "Mr. X-Steroid" : "Mr. X"}
                            loading="eager"
                            className={`
                                object-contain drop-shadow-md
                                transition-all duration-300
                                ${variant === 'full'
                                    ? 'h-16 md:h-20 w-auto' // Full variant resizing
                                    : 'h-10 md:h-12 w-auto' // Short variant resizing
                                }
                            `}
                        />
                        {/* Subtle Glow Effect */}
                        <div className={`absolute inset-0 bg-gold-500/10 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                ) : (
                    /* NON-ENGLISH: Text-based Logo (Arabic/etc) */
                    <BrandText isRTL={isRTL} variant={variant} />
                )}
            </motion.div>
        </div>
    );
};

export default DynamicBrandLogo;
