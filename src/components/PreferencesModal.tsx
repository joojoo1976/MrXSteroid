import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Scale, Ruler, Palette, RefreshCw, CheckCircle2 } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { Language, Currency } from '../types';
import { USFlag, EGFlag } from '../utils/icon-utils';
import { Button } from './ui/button';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    colorTheme: string;
    changeColorTheme: (theme: string) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, colorTheme, changeColorTheme }) => {
    const {
        language, setLanguage,
        unitSystem, setUnitSystem,
        isRTL, content,
        isAutoDetected, refreshDetection, status
    } = usePreferences();

    if (!isOpen) return null;

    const languages = [
        { code: Language.AR, label: 'العربية', flag: <EGFlag /> },
        { code: Language.EN, label: 'English', flag: <USFlag /> },
    ];

    const colorOptions = [
        { name: 'gold', bgClass: 'bg-yellow-500' },
        { name: 'blue', bgClass: 'bg-blue-500' },
        { name: 'red', bgClass: 'bg-red-500' },
        { name: 'green', bgClass: 'bg-green-500' },
        { name: 'purple', bgClass: 'bg-purple-500' }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                >
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
                                <Globe className="w-5 h-5 text-gold-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                    {isRTL ? 'إعدادات العرض' : 'Display Preferences'}
                                </h2>
                                {isAutoDetected && (
                                    <span className="text-[10px] font-bold text-gold-600 dark:text-gold-500 uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {isRTL ? 'تم التوطين تلقائياً' : 'Auto-Localized by Region'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            aria-label={isRTL ? 'إغلاق' : 'Close'}
                            title={isRTL ? 'إغلاق' : 'Close'}
                        >
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* Language Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                {isRTL ? 'اللغة' : 'Language'}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {languages.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => setLanguage(l.code)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${language === l.code ? 'border-gold-500 bg-gold-500/5 ring-4 ring-gold-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
                                            {l.flag}
                                        </div>
                                        <span className={`font-bold ${language === l.code ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                            {l.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Unit System */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                {isRTL ? 'نظام القياس' : 'Unit System'}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setUnitSystem('metric')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${unitSystem === 'metric' ? 'border-gold-500 bg-gold-500/5 ring-4 ring-gold-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                                >
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                                        <Scale className={`w-4 h-4 ${unitSystem === 'metric' ? 'text-gold-500' : 'text-zinc-400'}`} />
                                    </div>
                                    <div className="text-left rtl:text-right">
                                        <div className={`font-bold ${unitSystem === 'metric' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                            {isRTL ? 'متري' : 'Metric'}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">KG, CM, ML</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setUnitSystem('imperial')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${unitSystem === 'imperial' ? 'border-gold-500 bg-gold-500/5 ring-4 ring-gold-500/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                                >
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                                        <Ruler className={`w-4 h-4 ${unitSystem === 'imperial' ? 'text-gold-500' : 'text-zinc-400'}`} />
                                    </div>
                                    <div className="text-left rtl:text-right">
                                        <div className={`font-bold ${unitSystem === 'imperial' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                            {isRTL ? 'إمبراطوري' : 'Imperial'}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">LBS, IN, OZ</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                {isRTL ? 'لون السمة' : 'Accent Color'}
                            </label>
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <div className="flex gap-3">
                                    {colorOptions.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => changeColorTheme(c.name)}
                                            className={`w-8 h-8 rounded-full ${c.bgClass} border-4 transition-all ${colorTheme === c.name ? 'border-white dark:border-zinc-900 scale-125 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                                <Palette className="w-5 h-5 text-zinc-400" />
                            </div>
                        </div>

                        {/* Force Recalculate */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={() => refreshDetection()}
                                disabled={status === 'RESOLVING'}
                                className="w-full py-3 flex items-center justify-center gap-2 text-zinc-500 hover:text-gold-500 transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${status === 'RESOLVING' ? 'animate-spin' : ''}`} />
                                {isRTL ? 'إعادة اكتشاف الموقع التلقائي' : 'Recalculate Smart Localization'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PreferencesModal;
