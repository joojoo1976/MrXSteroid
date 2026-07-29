import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Scale, Ruler, Palette, RefreshCw, Sun, Moon, Monitor, Check } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { Language } from '@/shared/types/types';
import { USFlag, EGFlag } from '../../utils/icon-utils';
import { useTheme, ThemeMode } from '../../hooks/useTheme';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    colorTheme: string;
    changeColorTheme: (theme: string) => void;
    theme?: ThemeMode;
    setTheme?: (theme: ThemeMode) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
    isOpen,
    onClose,
    colorTheme,
    changeColorTheme,
    theme: propTheme,
    setTheme: propSetTheme
}) => {
    const {
        language, setLanguage,
        unitSystem, setUnitSystem,
        isRTL,
        isAutoDetected, refreshDetection, status
    } = usePreferences();

    const { theme: hookTheme, setTheme: hookSetTheme } = useTheme();

    const currentTheme = propTheme || hookTheme;
    const activeSetTheme = propSetTheme || hookSetTheme;

    if (!isOpen) return null;

    const languages = [
        { code: Language.AR, label: 'العربية', flag: <EGFlag /> },
        { code: Language.EN, label: 'English', flag: <USFlag /> },
    ];

    const themeModes: { id: ThemeMode; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
        { id: 'light', labelAr: 'فاتح', labelEn: 'Light', icon: <Sun className="w-4 h-4 text-amber-500" /> },
        { id: 'dark', labelAr: 'داكن', labelEn: 'Dark', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
        { id: 'system', labelAr: 'النظام', labelEn: 'System', icon: <Monitor className="w-4 h-4 text-gold-500" /> }
    ];

    const colorOptions = [
        { name: 'gold', bgClass: 'bg-yellow-500', hex: '#eab308', nameAr: 'ذهبي', nameEn: 'Gold' },
        { name: 'blue', bgClass: 'bg-blue-500', hex: '#3b82f6', nameAr: 'أزرق', nameEn: 'Blue' },
        { name: 'red', bgClass: 'bg-red-500', hex: '#ef4444', nameAr: 'أحمر', nameEn: 'Red' },
        { name: 'green', bgClass: 'bg-green-500', hex: '#10b981', nameAr: 'أخضر', nameEn: 'Green' },
        { name: 'purple', bgClass: 'bg-purple-500', hex: '#8b5cf6', nameAr: 'بنفسجي', nameEn: 'Purple' }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center border border-gold-500/20">
                                <Globe className="w-5 h-5 text-gold-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                    {isRTL ? 'إعدادات العرض الذكية' : 'Smart Display Settings'}
                                </h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gold-500/10 rounded-full border border-gold-500/20">
                                        <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black text-gold-600 dark:text-gold-500 uppercase tracking-widest">
                                            {isRTL ? 'توطين ذكي نشط' : 'Smart Engine Active'}
                                        </span>
                                    </div>
                                    {isAutoDetected && (
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                            {isRTL ? 'تلقائي' : 'System Auto'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                            aria-label={isRTL ? 'إغلاق' : 'Close'}
                            title={isRTL ? 'إغلاق' : 'Close'}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* 1. Language Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                {isRTL ? 'اللغة' : 'Language'}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {languages.map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => setLanguage(l.code)}
                                        className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                            language === l.code
                                                ? 'border-gold-500 bg-gold-500/10 ring-4 ring-gold-500/10 text-zinc-900 dark:text-white'
                                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500'
                                        }`}
                                    >
                                        <div className="w-7 h-7 rounded-full overflow-hidden shadow-xs shrink-0">
                                            {l.flag}
                                        </div>
                                        <span className="font-bold text-sm">
                                            {l.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Unit System */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                {isRTL ? 'نظام القياس' : 'Unit System'}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setUnitSystem('metric')}
                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                        unitSystem === 'metric'
                                            ? 'border-gold-500 bg-gold-500/10 ring-4 ring-gold-500/10 text-zinc-900 dark:text-white'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500'
                                    }`}
                                >
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                                        <Scale className={`w-4 h-4 ${unitSystem === 'metric' ? 'text-gold-500' : 'text-zinc-400'}`} />
                                    </div>
                                    <div className="text-start">
                                        <div className="font-bold text-sm">
                                            {isRTL ? 'متري' : 'Metric'}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">KG, CM, ML</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setUnitSystem('imperial')}
                                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                        unitSystem === 'imperial'
                                            ? 'border-gold-500 bg-gold-500/10 ring-4 ring-gold-500/10 text-zinc-900 dark:text-white'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500'
                                    }`}
                                >
                                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                                        <Ruler className={`w-4 h-4 ${unitSystem === 'imperial' ? 'text-gold-500' : 'text-zinc-400'}`} />
                                    </div>
                                    <div className="text-start">
                                        <div className="font-bold text-sm">
                                            {isRTL ? 'إمبراطوري' : 'Imperial'}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">LBS, IN, OZ</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 3. Theme Mode Selector: "فاتح + داكن + النظام" (Light + Dark + System) */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                {isRTL ? 'نمط العرض' : 'Theme Mode'}
                            </label>
                            <div className="grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                {themeModes.map((m) => {
                                    const isActive = currentTheme === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => activeSetTheme(m.id)}
                                            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl transition-all cursor-pointer ${
                                                isActive
                                                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-md border border-zinc-200 dark:border-zinc-700'
                                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
                                            }`}
                                        >
                                            {m.icon}
                                            <span className="text-xs font-black uppercase">
                                                {isRTL ? m.labelAr : m.labelEn}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Accent Color: "لون السمة" (Placed AFTER Theme Mode selector) */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                    {isRTL ? 'لون السمة' : 'Accent Color'}
                                </label>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">
                                    {colorOptions.find(c => c.name === colorTheme)?.[isRTL ? 'nameAr' : 'nameEn'] || colorTheme}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    {colorOptions.map((c) => {
                                        const isSelected = colorTheme === c.name;
                                        return (
                                            <button
                                                key={c.name}
                                                onClick={() => changeColorTheme(c.name)}
                                                className={`relative w-8 h-8 rounded-full ${c.bgClass} flex items-center justify-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'ring-4 ring-gold-500/30 scale-110 shadow-lg'
                                                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                                                }`}
                                                title={isRTL ? c.nameAr : c.nameEn}
                                            >
                                                {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <Palette className="w-5 h-5 text-gold-500" />
                            </div>
                        </div>

                        {/* 5. Force Re-Sync Localization Engine */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={() => refreshDetection()}
                                disabled={status === 'RESOLVING'}
                                className="w-full py-3 flex items-center justify-center gap-2 text-zinc-500 hover:text-gold-500 transition-colors text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${status === 'RESOLVING' ? 'animate-spin' : ''}`} />
                                {isRTL ? 'إستعادة الكشف التلقائي عن المنطقة' : 'Re-Sync Global Localization Engine'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PreferencesModal;
