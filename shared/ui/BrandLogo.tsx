'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePreferences } from '../../context/PreferencesContext';

interface BrandLogoProps {
    className?: string;
    isLink?: boolean;
    onClick?: () => void;
    isHero?: boolean;
    variant?: 'full' | 'short';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "text-4xl", isLink = false, onClick, isHero = false, variant = 'full' }) => {
    const { isRTL } = usePreferences();
    const router = useRouter();
    // Spacing logic: Hero gets negative margins for tight cluster, Small (default) gets slightly relaxed spacing
    const spacingClass = isHero ? "mx-[-1px]" : "mx-[0.5px]";
    const brandClass = isHero ? "brand-cartoon logo-glow-intense" : "brand-cartoon-sm";

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const letterVariants = {
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, -1, 1, 0],
            filter: [
                "drop-shadow(0 0 0px rgba(234, 179, 8, 0))",
                "drop-shadow(0 0 10px rgba(234, 179, 8, 0.8))",
                "drop-shadow(0 0 0px rgba(234, 179, 8, 0))"
            ],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        },
        hover: {
            scale: 1.2,
            rotate: [-5, 5, -5, 5, 0],
            transition: { duration: 0.3 }
        }
    };

    const LogoContent = isRTL ? (
        <motion.span
            variants={containerVariants}
            animate="animate"
            whileHover="hover"
            className={`inline-flex items-center select-none whitespace-nowrap cursor-pointer ${className} space-x-reverse space-x-1`}
        >
            <motion.span variants={letterVariants} className="text-gold-500 font-black brand-glint">مستر</motion.span>
            <motion.span variants={letterVariants} className="text-cyan-400 font-black">إكس</motion.span>
            {variant !== 'short' && (
                <>
                    <motion.span variants={letterVariants} className="text-zinc-500 font-black">-</motion.span>
                    <motion.span variants={letterVariants} className="text-gold-500 font-black brand-glint">سترويد</motion.span>
                </>
            )}
        </motion.span>
    ) : (
        <motion.span
            dir="ltr"
            variants={containerVariants}
            animate="animate"
            whileHover="hover"
            className={`font-chiller inline-flex items-center select-none whitespace-nowrap ${brandClass} force-ltr cursor-pointer ${className}`}
        >
            <motion.span variants={letterVariants} className={`logo-c-m ${spacingClass} brand-glint`}>M</motion.span>
            <motion.span variants={letterVariants} className={`logo-c-r-cyan ${spacingClass} brand-glint`}>r</motion.span>
            <motion.span variants={letterVariants} className={`logo-c-dot ${spacingClass}`}>.</motion.span>

            <span className="w-1"></span>

            <span className="logo-c-x-wrapper">
                <motion.span variants={letterVariants} className="logo-c-x inline-block">X</motion.span>
            </span>

            {variant !== 'short' && (
                <>
                    <motion.span variants={letterVariants} className={`logo-c-dash ${spacingClass}`}>-</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-s ${spacingClass} brand-glint`}>S</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-t ${spacingClass} brand-glint`}>t</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-e ${spacingClass} brand-glint`}>e</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-r-black ${spacingClass} brand-glint`}>r</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-o ${spacingClass} brand-glint`}>o</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-i ${spacingClass} brand-glint`}>i</motion.span>
                    <motion.span variants={letterVariants} className={`logo-c-d ${spacingClass} brand-glint`}>d</motion.span>
                </>
            )}
        </motion.span>
    );

    if (isLink || onClick) {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    if (onClick) {
                        onClick();
                    } else if (isLink) {
                        router.push('/');
                    }
                }}
                className="focus:outline-none focus:ring-2 focus:ring-gold-500/50 rounded-lg p-1 transition-all"
            >
                {LogoContent}
            </button>
        );
    }

    return LogoContent;
};

export default BrandLogo;
