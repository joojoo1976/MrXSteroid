import React, { useState } from 'react';
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
import { toast } from 'sonner';
import { usePreferences } from '../../context/PreferencesContext';
import { UnitToggle } from '../shared/UnitToggle';
import { convertValue, toMetric } from '../../utils/logic';
import KineticCounter from '../shared/KineticCounter';

interface BodyFatResult {
    bodyFatPercentage: number;
    bodyFatMass: number;
    leanBodyMass: number;
    bmi: number;
    category: string;
}

interface BodyFatCalculatorProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const BodyFatCalculator: React.FC<BodyFatCalculatorProps> = ({ content, navigateTo }) => {
    const { language: lang, unitSystem } = usePreferences();
    const isAr = lang === 'ar';
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');
    const [neck, setNeck] = useState('');
    const [result, setResult] = useState<BodyFatResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [ecosystemSynced, setEcosystemSynced] = useState(false);

    // Unit conversion logic
    const isImperial = unitSystem === 'imperial';

    const [baseWeight, setBaseWeight] = useState<number>(0);
    const [baseHeight, setBaseHeight] = useState<number>(0);
    const [baseWaist, setBaseWaist] = useState<number>(0);
    const [baseHip, setBaseHip] = useState<number>(0);
    const [baseNeck, setBaseNeck] = useState<number>(0);

    const [lastUnitSystem, setLastUnitSystem] = useState(unitSystem);

    if (lastUnitSystem !== unitSystem) {
        setLastUnitSystem(unitSystem);
        if (baseWeight > 0) {
            const displayVal = convertValue(baseWeight, 'weight', unitSystem);
            setWeight(displayVal.toFixed(1));
        }
        if (baseHeight > 0) {
            const displayVal = convertValue(baseHeight, 'height', unitSystem);
            setHeight(displayVal.toFixed(1));
        }
        if (baseWaist > 0) {
            const displayVal = convertValue(baseWaist, 'length', unitSystem);
            setWaist(displayVal.toFixed(1));
        }
        if (baseHip > 0) {
            const displayVal = convertValue(baseHip, 'length', unitSystem);
            setHip(displayVal.toFixed(1));
        }
        if (baseNeck > 0) {
            const displayVal = convertValue(baseNeck, 'length', unitSystem);
            setNeck(displayVal.toFixed(1));
        }
    }

    const handleWeightChange = (val: string) => {
        setWeight(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseWeight(isImperial ? toMetric(num, 'weight') : num);
        }
    };

    const handleHeightChange = (val: string) => {
        setHeight(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseHeight(isImperial ? toMetric(num, 'height') : num);
        }
    };

    const handleWaistChange = (val: string) => {
        setWaist(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseWaist(isImperial ? toMetric(num, 'length') : num);
        }
    };

    const handleHipChange = (val: string) => {
        setHip(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseHip(isImperial ? toMetric(num, 'length') : num);
        }
    };

    const handleNeckChange = (val: string) => {
        setNeck(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseNeck(isImperial ? toMetric(num, 'length') : num);
        }
    };

    // Helper to normalize Arabic/Persian digits to English
    const normalizeNum = (str: string) => {
        return str.replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
            .replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);
    };

    const calculateBodyFat = () => {
        const a = parseFloat(normalizeNum(age));
        const w = baseWeight;
        const h = baseHeight;
        const wi = baseWaist;
        const hi = baseHip;
        const n = baseNeck;

        if (!a || !w || !h || !wi || !n || (gender === 'female' && !hi)) {
            toast.error(isAr ? "يرجى إدخال جميع القيم المطلوبة" : "Please enter all required values");
            return;
        }

        setIsCalculating(true);
        setResult(null);

        setTimeout(() => {
            let bodyFatPercentage: number;

            // Using US Navy Body Fat Formula
            if (gender === 'male') {
                bodyFatPercentage = 495 / (1.20 * (wi / 100) + 0.23 * a - 0.10 * (n / 100) - 5.4) - 450;
            } else {
                bodyFatPercentage = 495 / (1.20 * (wi / 100) + 0.23 * a - 0.10 * (n / 100) - 0.20 * (hi / 100) - 5.4) - 450;
            }

            bodyFatPercentage = Math.max(0, Math.min(100, bodyFatPercentage));

            const bodyFatMass = (w * bodyFatPercentage) / 100;
            const leanBodyMass = w - bodyFatMass;
            const bmi = w / ((h / 100) * (h / 100));

            // Determine category based on body fat percentage
            let category: string;
            if (gender === 'male') {
                if (bodyFatPercentage < 6) category = content.bfCategories.essential;
                else if (bodyFatPercentage < 13) category = content.bfCategories.athletes;
                else if (bodyFatPercentage < 17) category = content.bfCategories.fitness;
                else if (bodyFatPercentage < 25) category = content.bfCategories.average;
                else category = content.bfCategories.obese;
            } else {
                if (bodyFatPercentage < 16) category = content.bfCategories.essential;
                else if (bodyFatPercentage < 23) category = content.bfCategories.athletes;
                else if (bodyFatPercentage < 28) category = content.bfCategories.fitness;
                else if (bodyFatPercentage < 35) category = content.bfCategories.average;
                else category = content.bfCategories.obese;
            }

            setResult({
                bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
                bodyFatMass: parseFloat(bodyFatMass.toFixed(1)),
                leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
                bmi: parseFloat(bmi.toFixed(1)),
                category
            });

            // Dispatch event for AI Context Partitioning
            window.dispatchEvent(new CustomEvent('bodyfat_calculated', {
                detail: {
                    bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
                    leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
                    bmi: parseFloat(bmi.toFixed(1)),
                    category
                }
            }));

            setIsCalculating(false);
            setTimeout(() => setEcosystemSynced(true), 1000);
        }, 1500);
    };

    // Get category color based on percentage
    const getCategoryColor = () => {
        if (!result) return 'text-gold-500';
        if (gender === 'male') {
            if (result.bodyFatPercentage < 13) return 'text-green-500';
            if (result.bodyFatPercentage < 17) return 'text-yellow-500';
            if (result.bodyFatPercentage < 25) return 'text-orange-500';
            return 'text-red-500';
        } else {
            if (result.bodyFatPercentage < 23) return 'text-green-500';
            if (result.bodyFatPercentage < 28) return 'text-yellow-500';
            if (result.bodyFatPercentage < 35) return 'text-orange-500';
            return 'text-red-500';
        }
    };

    // Get category description
    const getCategoryDescription = () => {
        if (!result) return '';
        const desc = gender === 'male' ? content.bfCategoryDescriptions.male : content.bfCategoryDescriptions.female;

        if (gender === 'male') {
            if (result.bodyFatPercentage < 13) return desc.athletes;
            if (result.bodyFatPercentage < 25) return desc.average;
            return desc.obese;
        } else {
            if (result.bodyFatPercentage < 23) return desc.athletes;
            if (result.bodyFatPercentage < 35) return desc.average;
            return desc.obese;
        }
    };

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

                    <div className="flex gap-3 p-1.5 bg-zinc-100 dark:bg-black/40 rounded-2xl">
                        <button
                            onClick={() => setGender('male')}
                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${gender === 'male' ? 'bg-white dark:bg-zinc-800 shadow-lg text-gold-600' : 'text-zinc-400 hover:text-zinc-300'}`}
                        >
                            <User className="w-4 h-4" /> {content.bfMale}
                        </button>
                        <button
                            onClick={() => setGender('female')}
                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${gender === 'female' ? 'bg-white dark:bg-zinc-800 shadow-lg text-gold-600' : 'text-zinc-400 hover:text-zinc-300'}`}
                        >
                            <User className="w-4 h-4" /> {content.bfFemale}
                        </button>
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
                        onClick={calculateBodyFat}
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
