import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Ruler, ChevronDown } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

interface UnitToggleProps {
    className?: string;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ className = '' }) => {
    const { unitSystem, setUnitSystem, language, isRTL } = usePreferences();
    const [isOpen, setIsOpen] = useState(false);
    const isMetric = unitSystem === 'metric';

    const currentIcon = isMetric ? <Scale className="w-4 h-4" /> : <Ruler className="w-4 h-4" />;
    const currentLabel = isMetric ? (isRTL ? 'متري' : 'Metric') : (isRTL ? 'إمبراطوري' : 'Imperial');
    const currentShort = isMetric ? 'KG/CM' : 'LBS/IN';

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-gold-500/50 transition-all text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-sm group"
                title={isRTL ? 'نظام القياس' : 'Unit System'}
            >
                <span className="text-gold-500 group-hover:scale-110 transition-transform">{currentIcon}</span>
                <span className="hidden sm:inline">{currentLabel}</span>
                <span className="sm:hidden">{currentShort}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full mt-1 ltr:right-0 rtl:left-0 min-w-[120px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden z-[60]"
                    >
                        <button
                            onClick={() => { setUnitSystem('metric'); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${isMetric ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'نظام متري (kg)' : 'Metric (kg)'}</span>
                        </button>
                        <button
                            onClick={() => { setUnitSystem('imperial'); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors ${!isMetric ? 'bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-500 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <Ruler className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'نظام إمبراطوري (lbs)' : 'Imperial (lbs)'}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UnitToggle;
