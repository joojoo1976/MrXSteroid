import React from 'react';
import { Link } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { motion } from 'framer-motion';

const BrandText: React.FC<{ isRTL: boolean }> = ({ isRTL }) => {
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
            className={`font-black text-2xl md:text-3xl tracking-tighter brand-cartoon-sm select-none
                ${isRTL ? 'font-[Cairo]' : 'font-[Inter]'}
                ${isRTL ? 'ml-3' : 'mr-3'}
            `}
        >
            <span className="text-gold-500">مستر</span>
            <span className="text-white mx-1">إكس</span>
            <span className="text-zinc-500">-</span>
            <span className="text-gold-500">سترويد</span>
        </motion.span>
    );
};

export const BrandBranding: React.FC = () => {
    const { language, isRTL } = usePreferences();
    const isEn = language === 'en';

    // Animation variants matching "cartoon pop" style
    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.05
            }
        },
        hover: {
            scale: 1.05,
            rotate: isEn ? -2 : 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <Link to="/" className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-lg">
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            >
                {/* Image Section */}
                <div className="relative">
                    <img
                        src="/images/mr-x-mascot-transparent.png"
                        alt="Mr. X Steroid Mascot"
                        loading="eager"
                        className={`
                            object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]
                            transition-all duration-300
                            ${isEn ? 'w-40 md:w-56' : 'w-16 md:w-24'}
                        `}
                    />
                    {/* Glow Effect behind image */}
                    <div className={`absolute inset-0 bg-gold-500/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isEn ? 'scale-75' : 'scale-110'}`} />
                </div>

                {/* Text Section (Non-English Only) */}
                {!isEn && <BrandText isRTL={isRTL} />}

            </motion.div>
        </Link>
    );
};

export default BrandBranding;
