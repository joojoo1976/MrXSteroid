import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { SupportedCountry, SupportedLanguage, LocalizationState, COUNTRY_CONFIGS } from '../types/localization';
import { switchCountry, getCountryName } from '../utils/logic';

interface LocalizationSimulatorProps {
    currentState: LocalizationState;
    onCountryChange: (newState: LocalizationState) => void;
    currentLanguage: SupportedLanguage;
}

const LocalizationSimulator: React.FC<LocalizationSimulatorProps> = ({
    currentState,
    onCountryChange,
    currentLanguage
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCountrySelect = (country: SupportedCountry) => {
        const newState = switchCountry(country);
        onCountryChange(newState);
    };

    const handleAutoDetect = async () => {
        // Simulate auto-detection by randomly selecting a country
        const countries = Object.values(SupportedCountry);
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        const newState = switchCountry(randomCountry);
        onCountryChange({ ...newState, isAutoDetected: true });
    };

    if (!isOpen) {
        return (
            <motion.button
                drag
                dragConstraints={{ top: -500, left: -500, right: 0, bottom: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                whileDrag={{ scale: 1.1 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-48 right-6 z-50 p-4 bg-gradient-to-r from-gold-500 to-yellow-400 rounded-full shadow-2xl hover:scale-110 transition-transform"
                title="Open Localization Simulator"
            >
                <Globe className="w-6 h-6 text-black animate-spin-slow" />
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-48 right-6 z-50 w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border-2 border-gold-500/30 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-gold-500 to-yellow-400 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-black animate-pulse" />
                        <div>
                            <h3 className="font-black text-black text-lg">
                                {currentLanguage === SupportedLanguage.AR && 'محاكي التوطين'}
                                {currentLanguage === SupportedLanguage.EN && 'Localization Simulator'}
                                {currentLanguage === SupportedLanguage.DE && 'Lokalisierungs-Simulator'}
                                {currentLanguage === SupportedLanguage.JA && 'ローカライゼーションシミュレーター'}
                            </h3>
                            <p className="text-sm text-black/70 font-bold">
                                {currentLanguage === SupportedLanguage.AR && 'اختبر الدول المختلفة'}
                                {currentLanguage === SupportedLanguage.EN && 'Test Different Countries'}
                                {currentLanguage === SupportedLanguage.DE && 'Verschiedene Länder testen'}
                                {currentLanguage === SupportedLanguage.JA && '異なる国をテスト'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-black" /> : <ChevronUp className="w-5 h-5 text-black" />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-black/10 rounded-full transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5 text-black" />
                        </button>
                    </div>
                </div>

                {/* Current Status */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mb-1">
                                {currentLanguage === SupportedLanguage.AR && 'الدولة'}
                                {currentLanguage === SupportedLanguage.EN && 'Country'}
                                {currentLanguage === SupportedLanguage.DE && 'Land'}
                                {currentLanguage === SupportedLanguage.JA && '国'}
                            </p>
                            <p className="text-2xl">{COUNTRY_CONFIGS[currentState.country].flag}</p>
                            <p className="text-sm font-black text-zinc-900 dark:text-white mt-1">
                                {getCountryName(currentState.country, currentLanguage)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mb-1">
                                {currentLanguage === SupportedLanguage.AR && 'اللغة'}
                                {currentLanguage === SupportedLanguage.EN && 'Language'}
                                {currentLanguage === SupportedLanguage.DE && 'Sprache'}
                                {currentLanguage === SupportedLanguage.JA && '言語'}
                            </p>
                            <p className="text-lg font-black text-gold-500">{currentState.language.toUpperCase()}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{currentState.direction.toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mb-1">
                                {currentLanguage === SupportedLanguage.AR && 'العملة'}
                                {currentLanguage === SupportedLanguage.EN && 'Currency'}
                                {currentLanguage === SupportedLanguage.DE && 'Währung'}
                                {currentLanguage === SupportedLanguage.JA && '通貨'}
                            </p>
                            <p className="text-lg font-black text-green-500">{currentState.currency.code}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{currentState.currency.symbol}</p>
                        </div>
                    </div>
                </div>

                {/* Country Selection */}
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="p-4 max-h-96 overflow-y-auto"
                    >
                        {/* Auto-Detect Button */}
                        <button
                            onClick={handleAutoDetect}
                            className="w-full mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
                        >
                            <Zap className="w-5 h-5 animate-pulse" />
                            {currentLanguage === SupportedLanguage.AR && 'كشف تلقائي ذكي'}
                            {currentLanguage === SupportedLanguage.EN && 'Smart Auto-Detection'}
                            {currentLanguage === SupportedLanguage.DE && 'Intelligente Auto-Erkennung'}
                            {currentLanguage === SupportedLanguage.JA && 'スマート自動検出'}
                        </button>

                        {/* Country Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(SupportedCountry).map((country) => {
                                const config = COUNTRY_CONFIGS[country];
                                const isActive = currentState.country === country;

                                return (
                                    <motion.button
                                        key={country}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCountrySelect(country)}
                                        className={`p-4 rounded-2xl border-2 transition-all ${isActive
                                            ? 'bg-gold-500 border-gold-600 shadow-lg shadow-gold-500/30'
                                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-gold-500/50'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">{config.flag}</div>
                                        <p className={`text-sm font-black ${isActive ? 'text-black' : 'text-zinc-900 dark:text-white'}`}>
                                            {getCountryName(country, currentLanguage)}
                                        </p>
                                        <p className={`text-sm mt-1 ${isActive ? 'text-black/70' : 'text-zinc-500'}`}>
                                            {config.currency.code} • {config.language.toUpperCase()}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Detection Status */}
                        {currentState.isAutoDetected && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-bold text-center">
                                    {currentLanguage === SupportedLanguage.AR && '✓ تم الكشف التلقائي'}
                                    {currentLanguage === SupportedLanguage.EN && '✓ Auto-Detected'}
                                    {currentLanguage === SupportedLanguage.DE && '✓ Automatisch erkannt'}
                                    {currentLanguage === SupportedLanguage.JA && '✓ 自動検出済み'}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Footer Info */}
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-center">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {currentLanguage === SupportedLanguage.AR && 'التغييرات فورية • بدون إعادة تحميل'}
                        {currentLanguage === SupportedLanguage.EN && 'Changes are instant • No reload needed'}
                        {currentLanguage === SupportedLanguage.DE && 'Änderungen sind sofort • Kein Neuladen erforderlich'}
                        {currentLanguage === SupportedLanguage.JA && '変更は即座に反映 • リロード不要'}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LocalizationSimulator;
