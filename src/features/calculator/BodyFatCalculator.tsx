import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale,
    User,
    Activity,
    Info,
    Target,
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import BrandLogo from '../shared/BrandLogo';
import AdPlaceholder from '../shared/AdPlaceholder';
import { ContentStrings, Page } from '../../types';
import { usePreferences } from '../../context/PreferencesContext';
import { UnitToggle } from '../shared/UnitToggle';
import KineticCounter from '../shared/KineticCounter';
import { useBodyFatCalculator } from '../../features/calculators/hooks/useBodyFatCalculator';

interface BodyFatCalculatorProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const BodyFatCalculator: React.FC<BodyFatCalculatorProps> = ({ content, navigateTo }) => {
    const { language: lang, unitSystem } = usePreferences();
    const isAr = lang === 'ar';
    const isImperial = unitSystem === 'imperial';

    const {
        gender,
        setGender,
        age,
        setAge,
        weight,
        handleWeightChange,
        height,
        handleHeightChange,
        waist,
        handleWaistChange,
        hip,
        handleHipChange,
        neck,
        handleNeckChange,
        result,
        isCalculating,
        ecosystemSynced,
        calculate,
        getCategoryColor,
        getCategoryDescription
    } = useBodyFatCalculator({ content, unitSystem });

    return (
        <div className={`max-w-7xl mx-auto px-4 py-16`} dir={isAr ? 'rtl' : 'ltr'}>
            {/* Background effects */}
            <div className="absolute top-0 inset-inline-start-0 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>
            <div className="absolute bottom-0 inset-inline-end-0 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full animate-float-slow -z-10 [animation-delay:-4s]"></div>

            <motion.div
                initial={{ opacity: 0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-24 relative"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl animate-glow"
                >
                    <Scale className="w-12 h-12 text-gold-500 animate-pulse" />
                </motion.div>

                <div className="mb-4">
                    <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
                </div>

                <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
                    {content.bfTitle}
                </h1>
                <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">
                    {content.bfSubtitle}
                </p>
            </motion.div>

            {/* AdSlot: Top Banner */}
            <div className="mb-12 relative flex flex-col items-center gap-6">
                <UnitToggle className="scale-125 shadow-2xl border-white/10" />
                <AdPlaceholder slotId="bodyfat_top_banner" format="horizontal" content={content} />
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
                {/* --- INPUT PANEL --- */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="lg:col-span-5 bg-white dark:bg-zinc-950/50 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 lg:sticky lg:top-24 backdrop-blur-xl"
                >
                    {/* Ecosystem Status (Compact) */}
                    <AnimatePresence>
                        {ecosystemSynced && content.macroEcosystem && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl mb-4"
                            >
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{content.macroEcosystem.syncStatus}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'male', label: content.bfMale, icon: User },
                            { id: 'female', label: content.bfFemale, icon: User }
                        ].map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setGender(g.id as 'male' | 'female')}
                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-start ${gender === g.id ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-800'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${gender === g.id ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                    <g.icon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">GENDER</span>
                                    <span className="text-sm font-black truncate">{g.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {content.bfAge}
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-lg font-black text-center outline-none transition-all shadow-inner h-12"
                                placeholder="25"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                                {content.bfWeight} <span className="opacity-50 text-[9px]">{isImperial ? 'lbs' : 'kg'}</span>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={weight}
                                onChange={(e) => handleWeightChange(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                                placeholder={isImperial ? "176" : "80"}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                                {content.bfHeight} <span className="opacity-50 text-[9px]">{isImperial ? 'in' : 'cm'}</span>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={height}
                                onChange={(e) => handleHeightChange(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                                placeholder={isImperial ? "70" : "180"}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {content.bfWaist} <span className="opacity-50 text-[9px]">{isImperial ? 'in' : 'cm'}</span>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={waist}
                                onChange={(e) => handleWaistChange(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                                placeholder={isImperial ? "32" : "81"}
                            />
                        </div>

                        {gender === 'female' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    {content.bfHip} <span className="opacity-50 text-[9px]">{isImperial ? 'in' : 'cm'}</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={hip}
                                    onChange={(e) => handleHipChange(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                                    placeholder={isImperial ? "38" : "97"}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {content.bfNeck} <span className="opacity-50 text-[9px]">{isImperial ? 'in' : 'cm'}</span>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={neck}
                                onChange={(e) => handleNeckChange(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-center font-mono font-black text-lg outline-none transition-all shadow-inner h-12"
                                placeholder={isImperial ? "16" : "41"}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={calculate}
                        disabled={isCalculating}
                        className={`w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 relative overflow-hidden group animate-glow`}
                    >
                        {isCalculating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        {isCalculating ? content.bfAnalyzing : content.bfCalculate}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full ${isCalculating ? 'animate-shimmer' : 'group-hover:animate-shimmer'}`}></div>
                    </motion.button>
                </motion.div>

                {/* --- RESULTS DASHBOARD --- */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-10"
                            >
                                {/* Category Banner */}
                                <motion.div
                                    initial={{ x: 200, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-8 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-[3rem] text-black shadow-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 inset-inline-end-0 p-4 opacity-20">
                                        <Target className="w-16 h-16 animate-pulse" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Info className="w-5 h-5" /> {content.bfCategoryTitle}
                                    </h4>
                                    <p className={`text-3xl font-bold leading-relaxed mb-4 ${getCategoryColor()}`}>
                                        {result.category}
                                    </p>
                                    <p className="text-lg font-bold leading-relaxed mb-4 opacity-90">
                                        {getCategoryDescription()}
                                    </p>
                                    <div className="text-sm font-black uppercase opacity-60">
                                        {content.bfFormulaNote}
                                    </div>
                                    <div className="absolute bottom-0 inset-inline-end-0 w-32 h-32 bg-white/10 rounded-tl-full blur-2xl"></div>
                                </motion.div>

                                {/* Main Stats - Compact Horizontal */}
                                <div className={`p-8 rounded-[3rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-xl relative overflow-hidden card-shine animate-glow group bg-zinc-900 text-white dark:bg-zinc-950`}>
                                    <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-gold-500/10 rounded-full blur-[100px] animate-float-slow"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8">
                                        {/* Body Fat Percentage */}
                                        <div className="text-center">
                                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
                                                <Target className="w-4 h-4 text-gold-500" /> {content.bfPercentageLabel}
                                            </h3>
                                            <div className={`text-6xl font-black tracking-tighter animate-text-flash font-mono ${getCategoryColor()}`}>
                                                <KineticCounter value={result.bodyFatPercentage || 0} decimals={1} />
                                                <span className="text-3xl">%</span>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-px h-px md:h-24 bg-zinc-800"></div>

                                        {/* BMI */}
                                        <div className="text-center">
                                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 flex items-center justify-center gap-2">
                                                <Scale className="w-4 h-4 text-white" /> BMI
                                            </h3>
                                            <div className="text-6xl font-black tracking-tighter animate-text-flash font-mono text-white">
                                                <KineticCounter value={result.bmi || 0} decimals={1} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Stats - Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group/stat hover:border-gold-500/30 transition-all">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gold-500/10 rounded-xl text-gold-500 group-hover/stat:scale-110 transition-transform">
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col text-start rtl:text-right ltr:text-left">
                                                <h4 className="text-[10px] font-black text-gold-400 uppercase tracking-widest mb-0.5">{content.bfMassLabel}</h4>
                                                <div className="text-xl font-black text-white leading-none">
                                                    {result.bodyFatMass} <span className="text-[10px] text-zinc-500 uppercase">{isImperial ? 'lbs' : 'kg'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group/stat hover:border-gold-500/30 transition-all">
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gold-500/10 rounded-xl text-gold-500 group-hover/stat:scale-110 transition-transform">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col text-start rtl:text-right ltr:text-left">
                                                <h4 className="text-[10px] font-black text-gold-400 uppercase tracking-widest mb-0.5">{content.bfLeanMassLabel}</h4>
                                                <div className="text-xl font-black text-white leading-none">
                                                    {result.leanBodyMass} <span className="text-[10px] text-zinc-500 uppercase">{isImperial ? 'lbs' : 'kg'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Progress Bar */}
                                    <div className="mt-8">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-black text-zinc-500">{content.bfCategories.essential}</span>
                                            <span className="text-[10px] font-black text-zinc-500">{content.bfCategories.obese}</span>
                                        </div>
                                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(result.bodyFatPercentage * 2, 100)}%` }} // Scaled for visual
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={`h-full transition-colors duration-300 ${getCategoryColor().replace('text-', 'bg-')}`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col md:flex-row gap-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigateTo(Page.MACRO)}
                                        className="flex-1 py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-lg rounded-[2rem] transition-all flex items-center justify-center gap-4"
                                    >
                                        <TrendingUp className="w-6 h-6" />
                                        {content.bfCalculateMacros}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigateTo(Page.GENETIC)}
                                        className="flex-1 py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-lg rounded-[2rem] transition-all flex items-center justify-center gap-4"
                                    >
                                        <Activity className="w-6 h-6" />
                                        {content.bfGeneticPotential}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[600px] flex flex-col items-center justify-center text-zinc-400"
                            >
                                <Scale className="w-24 h-24 mb-8 opacity-20" />
                                <p className="text-2xl font-black uppercase tracking-widest">
                                    {content.bfAwaitingData}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default BodyFatCalculator;
