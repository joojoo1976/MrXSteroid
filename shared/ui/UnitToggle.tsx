'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Ruler, ChevronDown, Check, Zap } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

interface UnitToggleProps {
    className?: string;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ className = '' }) => {
    const { unitSystem, setUnitSystem, isRTL } = usePreferences();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const isMetric = unitSystem === 'metric';

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const metricLabel  = isRTL ? 'متري'       : 'Metric';
    const imperialLabel = isRTL ? 'إمبراطوري' : 'Imperial';
    const currentLabel  = isMetric ? metricLabel : imperialLabel;
    const currentShort  = isMetric ? 'KG / CM'   : 'LBS / IN';
    const currentIcon   = isMetric
        ? <Scale className="w-4 h-4" />
        : <Ruler className="w-4 h-4" />;

    const systemTitle = isRTL ? 'نظام القياس' : 'Unit System';

    return (
        <div ref={ref} className={`relative inline-flex flex-col items-center ${isOpen ? 'z-[100]' : 'z-30'} ${className}`}>

            {/* ── Floating badge label above button ── */}
            <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                           bg-gold-500/10 border border-gold-500/20 backdrop-blur-md"
            >
                <Zap className="w-2.5 h-2.5 text-gold-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-500">
                    {systemTitle}
                </span>
            </motion.div>

            {/* ── Main trigger button ── */}
            <motion.button
                id="unit-toggle-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={systemTitle}
                className={`
                    group relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl
                    font-black text-sm tracking-wide transition-all duration-300 select-none
                    border-2 backdrop-blur-xl shadow-lg
                    ${isMetric
                        ? 'bg-gradient-to-r from-blue-950/80 to-blue-900/60 border-blue-500/40 text-blue-300 shadow-blue-500/10'
                        : 'bg-gradient-to-r from-amber-950/80 to-yellow-900/60 border-gold-500/40 text-gold-300 shadow-gold-500/10'
                    }
                    hover:shadow-xl hover:border-opacity-70
                `}
            >
                {/* Animated shine overlay */}
                <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                >
                    <span className="absolute -inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </span>

                {/* Icon */}
                <motion.span
                    key={unitSystem}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={isMetric ? 'text-blue-400' : 'text-gold-400'}
                >
                    {currentIcon}
                </motion.span>

                {/* Label */}
                <span className="hidden sm:inline leading-none">{currentLabel}</span>

                {/* Short unit badge */}
                <span className={`
                    text-[9px] font-black tracking-widest px-2 py-0.5 rounded-lg
                    ${isMetric
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-gold-500/20 text-gold-300'
                    }
                `}>
                    {currentShort}
                </span>

                {/* Chevron */}
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300
                        ${isOpen ? 'rotate-180' : ''}
                        ${isMetric ? 'text-blue-400' : 'text-gold-400'}
                    `}
                />
            </motion.button>

            {/* ── Dropdown panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="listbox"
                        aria-label={systemTitle}
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0,  scale: 1    }}
                        exit ={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`
                            absolute top-[calc(100%+10px)] z-[100]
                            left-1/2 -translate-x-1/2
                            min-w-[220px] rounded-2xl overflow-hidden
                            border-2 border-zinc-700/60 bg-zinc-950/95 backdrop-blur-3xl
                            shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)]
                        `}
                    >
                        {/* Panel header */}
                        <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-gold-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                {systemTitle}
                            </span>
                        </div>

                        {/* Metric option */}
                        <button
                            role="option"
                            aria-selected={isMetric}
                            onClick={() => { setUnitSystem('metric'); setIsOpen(false); }}
                            className={`
                                w-full flex items-center gap-3.5 px-4 py-3.5 text-sm
                                font-bold transition-all duration-200 group/opt
                                ${isMetric
                                    ? 'bg-blue-500/15 text-blue-300'
                                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                                }
                            `}
                        >
                            <span className={`
                                flex items-center justify-center w-8 h-8 rounded-xl
                                ${isMetric ? 'bg-blue-500/20' : 'bg-zinc-800 group-hover/opt:bg-zinc-700'}
                                transition-colors
                            `}>
                                <Scale className={`w-4 h-4 ${isMetric ? 'text-blue-400' : 'text-zinc-500'}`} />
                            </span>
                            <div className="flex-1 text-start">
                                <div className="font-black leading-none">
                                    {isRTL ? 'النظام المتري' : 'Metric System'}
                                </div>
                                <div className="text-[10px] opacity-60 mt-0.5">
                                    kg · cm · L
                                </div>
                            </div>
                            {isMetric && (
                                <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            )}
                        </button>

                        {/* Imperial option */}
                        <button
                            role="option"
                            aria-selected={!isMetric}
                            onClick={() => { setUnitSystem('imperial'); setIsOpen(false); }}
                            className={`
                                w-full flex items-center gap-3.5 px-4 py-3.5 text-sm
                                font-bold transition-all duration-200 group/opt
                                ${!isMetric
                                    ? 'bg-gold-500/15 text-gold-300'
                                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                                }
                            `}
                        >
                            <span className={`
                                flex items-center justify-center w-8 h-8 rounded-xl
                                ${!isMetric ? 'bg-gold-500/20' : 'bg-zinc-800 group-hover/opt:bg-zinc-700'}
                                transition-colors
                            `}>
                                <Ruler className={`w-4 h-4 ${!isMetric ? 'text-gold-400' : 'text-zinc-500'}`} />
                            </span>
                            <div className="flex-1 text-start">
                                <div className="font-black leading-none">
                                    {isRTL ? 'النظام الإمبراطوري' : 'Imperial System'}
                                </div>
                                <div className="text-[10px] opacity-60 mt-0.5">
                                    lbs · in · fl oz
                                </div>
                            </div>
                            {!isMetric && (
                                <Check className="w-4 h-4 text-gold-400 flex-shrink-0" />
                            )}
                        </button>

                        {/* Footer note */}
                        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/50">
                            <p className="text-[9px] text-zinc-500 text-center leading-relaxed">
                                {isRTL
                                    ? 'يتم حفظ التفضيل تلقائياً'
                                    : 'Preference saved automatically'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UnitToggle;
