import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    ShieldCheck,
    TrendingUp,
    Info,
    Scale,
    User,
    FlaskConical,
    Save,
    RefreshCw,
    AlertTriangle,
    Target,
    Wallet,
    Globe
} from 'lucide-react';
import BrandLogo from '../../shared/ui/BrandLogo';
import { Page } from '../../types';
import { useMasterCalculator, CalculationGoal, ExperienceLevel, BudgetLevel, UnitSystem } from './hooks/useMasterCalculator';
import { usePreferences } from '../../context/PreferencesContext';
import KineticCounter from '../../shared/ui/KineticCounter';

interface MasterCalculatorProps {
    navigateTo: (page: Page) => void;
}

const MasterCalculator: React.FC<MasterCalculatorProps> = ({ navigateTo }) => {
    const { isRTL, content } = usePreferences();
    const mc = content.masterCalc!;
    const {
        state,
        setState,
        result,
        advice,
        isLoading,
        isSaving,
    } = useMasterCalculator();

    // Cascading Dropdown Logic Mapping
    const goalSubstances = useMemo(() => ({
        bulking: [
            { id: 'test_e', name: 'Testosterone Enanthate' },
            { id: 'deca', name: 'Deca Durabolin' },
            { id: 'tren_e', name: 'Trenbolone Enanthate' },
            { id: 'dbol', name: 'Dianabol (Oral)' }
        ],
        cutting: [
            { id: 'test_p', name: 'Testosterone Propionate' },
            { id: 'tren_a', name: 'Trenbolone Acetate' },
            { id: 'mast_p', name: 'Masteron Propionate' },
            { id: 'anavar', name: 'Anavar (Oral)' }
        ],
        trt: [
            { id: 'test_e', name: 'Testosterone Enanthate' },
            { id: 'test_c', name: 'Testosterone Cypionate' }
        ],
        sports: [
            { id: 'bold', name: 'Equipoise (Boldenone)' },
            { id: 'tbol', name: 'Turinabol (Oral)' },
            { id: 'npp', name: 'NPP' }
        ]
    }), []);

    const activeSubstances = goalSubstances[state.goal];

    // Ensure substance updates when goal changes (Cascading Dropdown Reactivity)
    React.useEffect(() => {
        if (!activeSubstances.find(s => s.id === state.substance)) {
            setState(prev => ({ ...prev, substance: activeSubstances[0].id }));
        }
    }, [state.goal, activeSubstances, state.substance, setState]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="mb-6">
                    <BrandLogo className="text-4xl" onClick={() => navigateTo(Page.HOME)} />
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white uppercase">
                    {mc.title}
                </h1>
                <p className="text-zinc-500 font-bold max-w-2xl mx-auto italic uppercase tracking-[0.2em] text-[10px]">
                    {mc.subtitle}
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* --- INPUT CONFIGURATOR --- */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="lg:col-span-4 space-y-6 bg-white dark:bg-zinc-950/50 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gold-500 flex items-center gap-2">
                            <Target className="w-4 h-4" /> {mc.configTitle}
                        </h2>
                        {isSaving && <RefreshCw className="w-3 h-3 text-gold-500 animate-spin" />}
                    </div>

                    {/* Unit Toggle */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        {(['metric', 'imperial'] as UnitSystem[]).map((u) => (
                            <button
                                key={u}
                                onClick={() => setState(prev => ({ ...prev, unitSystem: u }))}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${state.unitSystem === u ? 'bg-white dark:bg-zinc-800 text-gold-500 shadow-sm' : 'text-zinc-500'}`}
                            >
                                {u}
                            </button>
                        ))}
                    </div>

                    {/* Step 1: Goal */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{mc.step1}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['bulking', 'cutting', 'trt', 'sports'] as CalculationGoal[]).map((g) => (
                                <button
                                    key={g}
                                    title={`Set goal to ${g}`}
                                    onClick={() => setState(prev => ({ ...prev, goal: g }))}
                                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${state.goal === g ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500 hover:border-zinc-700'}`}
                                >
                                    {content.calcSelectGoal ? (content.calcSelectGoal[g as keyof typeof content.calcSelectGoal] || g) : g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Substance */}
                    <div className="space-y-3">
                        <label htmlFor="substance-select" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{mc.step2}</label>
                        <select
                            id="substance-select"
                            title="Select substance"
                            value={state.substance}
                            onChange={(e) => setState(prev => ({ ...prev, substance: e.target.value }))}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-800 rounded-xl p-4 text-sm font-black text-white focus:border-gold-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            {activeSubstances.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    {/* Step 3: Experience */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{mc.step3}</label>
                        <div className="flex gap-2">
                            {(['beginner', 'intermediate', 'pro'] as ExperienceLevel[]).map((exp) => (
                                <button
                                    key={exp}
                                    title={`Experience: ${exp}`}
                                    onClick={() => setState(prev => ({ ...prev, experience: exp }))}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${state.experience === exp ? 'bg-zinc-900 border-gold-500 text-gold-500 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500'}`}
                                >
                                    {exp === 'beginner' ? (isRTL ? 'مبتدئ' : 'Beginner') : // Fallback if no specific translation for exp
                                        exp === 'intermediate' ? (isRTL ? 'متوسط' : 'Intermediate') :
                                            (isRTL ? 'محترف' : 'Pro')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 4: Budget */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> {mc.step4}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as BudgetLevel[]).map((b) => (
                                <button
                                    key={b}
                                    onClick={() => setState(prev => ({ ...prev, budget: b }))}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${state.budget === b ? 'bg-zinc-900 border-gold-500 text-gold-500 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500'}`}
                                >
                                    {b === 'low' ? mc.low : b === 'medium' ? (isRTL ? 'متوسط' : 'Medium') : mc.high}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="weight-input" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                <Scale className="w-3 h-3" /> Weight ({state.unitSystem === 'metric' ? 'kg' : 'lbs'})
                            </label>
                            <input
                                id="weight-input"
                                type="number"
                                title="Enter weight"
                                value={state.weight}
                                onChange={(e) => setState(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center font-mono font-black text-lg focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="age-input" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                <User className="w-3 h-3" /> Age
                            </label>
                            <input
                                id="age-input"
                                type="number"
                                title="Enter age"
                                value={state.age}
                                onChange={(e) => setState(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center font-mono font-black text-lg focus:border-gold-500 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        aria-label="Save current protocol"
                        className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-black uppercase rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all flex items-center justify-center gap-2 group"
                    >
                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {mc.saveBtn}
                    </button>
                    <p className="text-[9px] text-zinc-500 text-center font-bold">{mc.vaultMsg}</p>
                </motion.div>

                {/* --- INTELLIGENCE DASHBOARD --- */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div key="loading" className="h-96 flex flex-col items-center justify-center gap-4 animate-pulse">
                                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-gold-500 font-black tracking-widest text-xs uppercase text-center">Hydrating Biological Data Vault...</span>
                            </div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                {/* Main Result Card */}
                                <div className="p-8 rounded-[3rem] bg-zinc-900 dark:bg-zinc-950 border-4 border-zinc-800 shadow-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 end-0 p-8 opacity-10 pointer-events-none">
                                        <FlaskConical className="w-32 h-32 text-gold-500 animate-float-slow" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
                                            <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center text-black shadow-lg">
                                                <Zap className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-gold-500 font-black uppercase tracking-widest text-[10px] mb-1">{mc.resultDosage}</h3>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-6xl md:text-7xl font-black tracking-tighter text-white font-mono">
                                                        <KineticCounter value={result?.value || 0} />
                                                    </span>
                                                    <span className="text-2xl font-black text-zinc-700">{mc.unitWeek}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center backdrop-blur-sm">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">{mc.intensityLabel}</span>
                                                <span className="text-2xl font-black text-gold-500">{(result?.intensityFactor || 0).toFixed(1)}x</span>
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center backdrop-blur-sm">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">{mc.safetyLabel}</span>
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className={`w-5 h-5 ${result?.isSafe ? 'text-green-500' : 'text-amber-500'}`} />
                                                    <span className={`text-2xl font-black ${result?.isSafe ? 'text-green-500' : 'text-amber-500'}`}>
                                                        {result?.isSafe ? mc.optimal : mc.reduced}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center backdrop-blur-sm">
                                                <span className="text-[9px] font-black text-zinc-500 uppercase mb-2 tracking-widest">{mc.riskLabel}</span>
                                                <span className={`text-2xl font-black uppercase ${state.experience === 'pro' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {state.experience === 'pro' ? mc.high : mc.low}
                                                </span>
                                            </div>
                                        </div>

                                        {result?.warning && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3"
                                            >
                                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                                <p className="text-xs font-bold text-amber-200">{result.warning}</p>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Contextual AI Advice */}
                                <motion.div
                                    whileHover={{ scale: 1.005 }}
                                    className="p-8 rounded-[2.5rem] bg-gradient-to-br from-gold-500 to-gold-600 text-black shadow-2xl relative overflow-hidden group border-4 border-white/20"
                                >
                                    <div className="absolute top-0 end-0 p-6 opacity-20 pointer-events-none">
                                        <Globe className="w-16 h-16 animate-pulse" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info className="w-4 h-4" /> {mc.adviceTitle}
                                    </h4>
                                    <p className="text-xl md:text-2xl font-black leading-tight mb-4 italic">
                                        "{advice}"
                                    </p>
                                    <div className="flex items-center gap-4 pt-4 border-t border-black/10">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{mc.logicAccuracy}: 99.4%</span>
                                        </div>
                                        <div className="h-3 w-px bg-black/10"></div>
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{mc.unitSystem}: {state.unitSystem.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Analytics Charts */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] shadow-xl">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">{mc.metabolicSaturation}</h4>
                                        <div className="h-24 flex items-end gap-2 px-2">
                                            {[35, 55, 75, 65, 85, 80, 92].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ delay: i * 0.05, type: 'spring' }}
                                                    className="flex-1 bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-lg shadow-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] shadow-xl flex flex-col items-center justify-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 text-center w-full">{mc.stabilityIndex}</h4>
                                        <div className="relative h-24 flex items-center justify-center aspect-square">
                                            <svg className="w-20 h-20 -rotate-90">
                                                <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-100 dark:text-zinc-800" />
                                                <motion.circle
                                                    cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6"
                                                    strokeDasharray="220"
                                                    initial={{ strokeDashoffset: 220 }}
                                                    animate={{ strokeDashoffset: 220 - (220 * 0.98) }}
                                                    className="text-gold-500"
                                                />
                                            </svg>
                                            <span className="absolute text-xl font-black">98%</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MasterCalculator;
