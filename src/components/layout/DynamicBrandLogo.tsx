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
    inline?: boolean;   // For use within text/paragraphs
    showMascot?: boolean; // Restore the 'lost' logo/mascot
}

export const DynamicBrandLogo: React.FC<DynamicBrandLogoProps> = ({
    variant = 'full',
    onClick,
    className = "",
    inline = false,
    showMascot = false
}) => {
    const { language, isRTL } = usePreferences();
    const isEn = language === 'en';

    // Animation variants
    const containerVariants = {
        hover: {
            scale: inline ? 1.02 : 1.05,
            rotate: isEn ? -1 : 0,
            transition: { duration: 0.3 }
        }
    };

    // Base wrapper classes
    const wrapperClass = inline
        ? `inline-flex items-center align-middle ${className}`
        : `flex items-center justify-center ${className} outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-lg cursor-pointer`;

    const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={wrapperClass}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleClick(e);
                }
            }}
            aria-label={variant === 'full' ? "Mr. X-Steroid Home" : "Mr. X Home"}
        >
            <motion.div
                variants={containerVariants}
                whileHover="hover"
                className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}
            >
                {/* RESTORED MASCOT / LOGO */}
                {showMascot && (
                    <img
                        src="/logo_MrXSteroid.png"
                        alt="Mascot"
                        className={`object-contain ${inline ? 'h-[1.2em]' : 'h-10 md:h-12'}`}
                    />
                )}

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
                                ${inline
                                    ? 'h-[1em] w-auto translate-y-[-2px]' // Inline adjustment
                                    : (variant === 'full' ? 'h-10 md:h-14 w-auto' : 'h-8 md:h-10 w-auto') // Block adjustment (Compressed as requested)
                                }
                            `}
                        />
                        {/* Subtle Glow Effect */}
                        {!inline && <div className={`absolute inset-0 bg-gold-500/10 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />}
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
