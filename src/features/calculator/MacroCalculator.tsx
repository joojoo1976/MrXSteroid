import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BicepsFlexed, Utensils, Droplet, RefreshCw, Calculator,
  Flame, Activity, Zap, TrendingUp, Info, Clock, Scale,
  User, UtensilsCrossed, Target, Trophy, ChefHat, Heart,
  Brain, Dumbbell, Award, Sparkles, BarChart3, ArrowRight,
  CheckCircle2, Star, Shield
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import BrandLogo from '../../shared/ui/BrandLogo';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { UnitToggle } from '../../shared/ui/UnitToggle';
import { useMacroCalculator } from './hooks/useMacroCalculator';

interface MacroCalculatorProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

/* ─── عداد متحرك نقي لتفادي مشاكل DOM ─── */
const AnimatedNumber: React.FC<{ value: number; decimals?: number; suffix?: string; className?: string }> = ({
  value, decimals = 0, suffix = '', className = ''
}) => {
  const [displayed, setDisplayed] = React.useState(0);
  const ref = React.useRef<number>(0);
  React.useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * eased;
      setDisplayed(current);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <span className={className}>
      {displayed.toFixed(decimals)}{suffix}
    </span>
  );
};

/* ─── كرت الماكروز الدائري ─── */
const MacroRingCard: React.FC<{
  label: string; value: number; total: number;
  color: string; bgColor: string; textColor: string;
  icon: React.ElementType; desc: string; kcal: number;
  percent: number; delay: number;
}> = ({ label, value, total: _total, color, bgColor, textColor, icon: Icon, desc, kcal, percent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 100 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className={`relative overflow-hidden rounded-3xl p-5 border-2 ${bgColor} shadow-xl group cursor-default`}
  >
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30 ${color}`} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${bgColor} border ${color.replace('bg-', 'border-')}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <span className={`text-3xl font-black font-mono ${textColor}`}>
          <AnimatedNumber value={value} />
          <span className="text-sm font-bold opacity-70">g</span>
        </span>
      </div>
      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</h4>
      <p className="text-[10px] font-medium text-zinc-500 leading-snug mb-3">{desc}</p>
      <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ delay: delay + 0.2, duration: 1.0, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] font-black text-zinc-500 uppercase">{Math.round(percent)}% من السعرات</span>
        <span className={`text-[9px] font-black ${textColor}`}>{kcal} kcal</span>
      </div>
    </div>
  </motion.div>
);

/* ─── كرت إحصائي ─── */
const StatPill: React.FC<{
  label: string; value: number | string; unit?: string;
  icon: React.ElementType; color: string; delay: number; info?: string;
}> = ({ label, value, unit = '', icon: Icon, color, delay, info }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring' }}
    whileHover={{ scale: 1.03 }}
    className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 group overflow-hidden"
    title={info}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 truncate">{label}</p>
      <p className="text-lg font-black text-white font-mono leading-none">
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        {unit && <span className="text-xs text-zinc-400 ml-1">{unit}</span>}
      </p>
    </div>
    {info && (
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="w-3 h-3 text-zinc-600" />
      </div>
    )}
  </motion.div>
);

const MacroCalculator: React.FC<MacroCalculatorProps> = ({ content, navigateTo }) => {
  const { language: lang, unitSystem } = usePreferences();
  const isAr = lang === 'ar';
  const isImperial = unitSystem === 'imperial';

  const {
    weight, handleWeightChange,
    height, handleHeightChange,
    age, setAge,
    gender, setGender,
    activity, setActivity,
    goal, setGoal,
    trainingTime, setTrainingTime,
    result, mealPlan,
    isCalculating, chartData, aiInsight,
    simulationData, ecosystemSynced,
    showMealPlan, setShowMealPlan,
    calculate, generatePlan
  } = useMacroCalculator({ content, unitSystem });

  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'simulation' | 'meals'>('overview');

  const totalCals = result ? (result.protein * 4 + result.carbs * 4 + result.fats * 9) : 1;
  const proteinPct = result ? (result.protein * 4 / totalCals) * 100 : 0;
  const carbsPct = result ? (result.carbs * 4 / totalCals) * 100 : 0;
  const fatsPct = result ? (result.fats * 9 / totalCals) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── مؤثرات خلفية حركية ── */}
      <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-gold-500/5 blur-[140px] rounded-full animate-float-slow -z-10" />
      <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-blue-500/5 blur-[140px] rounded-full animate-float-slow -z-10 [animation-delay:-6s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/3 blur-[120px] rounded-full -z-10" />

      {/* ── العنوان العلوي ── */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl"
        >
          <Utensils className="w-12 h-12 text-gold-500" />
        </motion.div>

        <div className="mb-4">
          <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.calcTitle}
        </h1>

        {content.calcFeatures && content.calcFeatures.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-8">
            {content.calcFeatures.map((feat, idx) => {
              const icons = [Scale, Target, Zap];
              const IconComp = icons[idx % icons.length];
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xl hover:border-gold-500/40 transition-all text-start flex flex-col justify-start group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <IconComp className="w-4 h-4 text-gold-500" />
                    </div>
                    <h3 className="font-black text-sm text-zinc-900 dark:text-white leading-tight">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-bold italic mb-6">
            {content.calcSubtitle}
          </p>
        )}

        {/* شارات الأمان والدقة */}
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {[
            { icon: Shield, label: isAr ? 'مبني على أسس علمية' : 'Science-Based', color: 'text-blue-400' },
            { icon: Zap, label: isAr ? 'تحليل ذكاء اصطناعي فوري' : 'Real-Time AI', color: 'text-gold-400' },
            { icon: Star, label: isAr ? 'محرك نخبوي مطور' : 'Elite Engine', color: 'text-rose-400' },
          ].map(({ icon: I, label, color }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-full backdrop-blur-sm">
              <I className={`w-3 h-3 ${color}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AdSlot: Top */}
      <div className="mb-12 relative flex flex-col items-center gap-6">
        <UnitToggle className="scale-125 shadow-2xl border-white/10" />
        <AdPlaceholder slotId="macro_top_banner" format="horizontal" content={content} />
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">

        {/* ══════════ لوحة الإدخال (INPUT PANEL) ══════════ */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-5 bg-white dark:bg-zinc-950/60 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 lg:sticky lg:top-24 backdrop-blur-xl"
        >
          {/* حالة التزامن مع الأنظمة الحيوية */}
          <AnimatePresence mode="wait">
            {ecosystemSynced && content.macroEcosystem && (
              <motion.div
                key="eco"
                initial={{ opacity: 0, scale: 0.9, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl"
              >
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{content.macroEcosystem.syncStatus}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* تحديد الجنس */}
          <div className="flex gap-3 p-1.5 bg-zinc-100 dark:bg-black/40 rounded-2xl">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${gender === g ? 'bg-white dark:bg-zinc-800 shadow-lg text-gold-600' : 'text-zinc-400 hover:text-zinc-300'}`}
              >
                <User className="w-4 h-4" />
                {g === 'male' ? content.calcMale : content.calcFemale}
              </button>
            ))}
          </div>

          {/* العمر / الوزن / الطول */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: content.calcAge, val: age, onChange: (v: string) => setAge(v), placeholder: '25', unit: isAr ? 'سنة' : 'yr', inputMode: 'numeric' as const },
              { label: content.calcWeight, val: weight, onChange: handleWeightChange, placeholder: isImperial ? '176' : '80', unit: isImperial ? 'lbs' : 'kg', inputMode: 'decimal' as const },
              { label: content.calcHeight, val: height, onChange: handleHeightChange, placeholder: isImperial ? '70' : '180', unit: isImperial ? 'in' : 'cm', inputMode: 'decimal' as const },
            ].map(({ label, val, onChange, placeholder, unit, inputMode }) => (
              <div key={label} className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between">
                  {label} <span className="opacity-50 text-[8px]">{unit}</span>
                </label>
                <input
                  type="text"
                  inputMode={inputMode}
                  value={val}
                  onChange={e => onChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-lg font-black text-center outline-none transition-all shadow-inner h-12"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          {/* مستوى النشاط */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-gold-500" /> {content.calcActivity || 'Activity Level'}
            </label>
            <div className="space-y-2">
              {content.calcActivityLevels && Object.entries(content.calcActivityLevels).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setActivity(k)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${activity === k ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${activity === k ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{v as string}</span>
                  {activity === k && <CheckCircle2 className="w-4 h-4 ms-auto text-gold-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* الهدف الرياضي */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-gold-500" /> {content.calcGoal || 'Your Goal'}
            </label>
            <div className="space-y-2">
              {content.calcSelectGoal && Object.entries(content.calcSelectGoal).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setGoal(k)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${goal === k ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${goal === k ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{v as string}</span>
                  {goal === k && <CheckCircle2 className="w-4 h-4 ms-auto text-gold-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* نافذة التمرين */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold-500" /> {content.calcTrainingTime || 'Training Window'}
            </label>
            <div className="space-y-2">
              {content.calcTrainingWindows && Object.entries(content.calcTrainingWindows).filter(([k]) => k !== 'advice').map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setTrainingTime(k)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-start ${trainingTime === k ? 'bg-gold-500/10 border-gold-500 text-gold-500 shadow-lg shadow-gold-500/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${trainingTime === k ? 'bg-gold-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-tight">{v as string}</span>
                  {trainingTime === k && <CheckCircle2 className="w-4 h-4 ms-auto text-gold-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* زر الحساب المطور */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={calculate}
            disabled={isCalculating}
            className="w-full py-7 bg-gold-500 hover:bg-gold-400 text-black font-black text-xl rounded-[2rem] shadow-[0_0_50px_rgba(234,179,8,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group disabled:opacity-70"
          >
            {isCalculating
              ? <RefreshCw className="w-7 h-7 animate-spin" />
              : <TrendingUp className="w-7 h-7 group-hover:translate-y-[-4px] transition-transform" />
            }
            {isCalculating ? content.calcAnalyzingLabel : content.calcCalculate}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>
        </motion.div>

        {/* ══════════ لوحة النتائج المذهلة (RESULTS PANEL) ══════════ */}
        <div className="lg:col-span-7 space-y-8">
          {result ? (
            <div className="space-y-8">

              {/* ── لوحة نصائح الذكاء الاصطناعي الفوري ── */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative p-5 bg-gradient-to-br from-gold-500 via-gold-600 to-amber-700 rounded-3xl text-black shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-10 h-10 bg-black/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> {content.calcAiInsightTitle}
                    </h4>
                    <p className="text-sm font-bold leading-snug">{aiInsight}</p>
                    <div className="mt-2 text-[8px] font-black uppercase opacity-60">
                      {content.calcPredictiveAccuracy} <span className="ms-1">{content.calcPredictiveAccuracyVal}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── ألسنة التبويب للنتائج (TABS) ── */}
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                {([
                  { id: 'overview', label: isAr ? 'نظرة عامة' : 'Overview', icon: BarChart3 },
                  { id: 'details', label: isAr ? 'التفاصيل الحيوية' : 'Details', icon: Info },
                  { id: 'simulation', label: isAr ? 'التوقع والمستقبل' : 'Forecast', icon: TrendingUp },
                  { id: 'meals', label: isAr ? 'خطة الوجبات النخبوية' : 'Meal Plan', icon: ChefHat },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id);
                      if (id === 'meals' && !mealPlan) generatePlan();
                      if (id === 'meals') setShowMealPlan(true);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${activeTab === id ? 'bg-white dark:bg-zinc-800 shadow-lg text-gold-600 dark:text-gold-400' : 'text-zinc-400 hover:text-zinc-300'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* ── تبويب نظرة عامة (OVERVIEW TAB) ── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">

                  {/* كرت السعرات الرئيسي */}
                  <div className="relative p-6 rounded-[2.5rem] border border-zinc-800 bg-zinc-900 text-white shadow-2xl overflow-hidden">
                    <div className="absolute top-0 end-0 w-60 h-60 bg-gold-500/10 rounded-full blur-[80px] animate-float-slow" />
                    <div className="absolute bottom-0 start-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px]" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-start">
                        <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2 justify-center md:justify-start">
                          <Flame className="w-3.5 h-3.5 animate-pulse" /> {content.calcCalories}
                        </p>
                        <div className="text-6xl font-black tracking-tighter font-mono text-white mb-2">
                          <AnimatedNumber value={result.calories} />
                        </div>
                        <p className="text-zinc-500 text-xs font-bold">{isAr ? 'سعر حراري / يوم' : 'kcal / day'}</p>
                        <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{content.macroEcosystem?.syncStatus}</span>
                        </div>
                      </div>

                      {/* المخطط الدائري التفاعلي */}
                      <div className="w-40 h-40 relative shrink-0">
                        {/* استخدام key ديناميكي لمنع أخطاء DOM insertBefore تماماً */}
                        <ResponsiveContainer width="100%" height="100%" key={`pie-container-${unitSystem}-${gender}-${result.calories}`}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: isAr ? 'البروتين' : 'Protein', value: result.protein * 4 },
                                { name: isAr ? 'الكارب' : 'Carbs', value: result.carbs * 4 },
                                { name: isAr ? 'الدهون' : 'Fats', value: result.fats * 9 },
                              ]}
                              innerRadius={42}
                              outerRadius={68}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="#EAB308" />
                              <Cell fill="#3b82f6" />
                              <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <Zap className="w-5 h-5 text-gold-500 animate-pulse" />
                          <span className="text-[8px] font-black text-zinc-500 uppercase mt-0.5">{isAr ? 'العناصر' : 'Macros'}</span>
                        </div>
                      </div>
                    </div>

                    {/* مقياس إمكانات النمو البنائي */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Award className="w-3 h-3 text-gold-500" /> {content.calcAnabolicPotentialLabel}
                        </span>
                        <span className="text-2xl font-black text-gold-500 font-mono">
                          <AnimatedNumber value={result.growthPotential} />%
                        </span>
                      </div>
                      <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-gold-500 rounded-full relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.growthPotential}%` }}
                          transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </motion.div>
                      </div>
                    </div>

                    {/* نصيحة نافذة التدريب */}
                    {content.calcTrainingWindows?.advice && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 p-3 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-start gap-3"
                      >
                        <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-zinc-300">
                          {(content.calcTrainingWindows.advice as string).replace('{time}', (content.calcTrainingWindows as Record<string, string>)[trainingTime] || trainingTime)}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* 3 كروت للماكروز */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MacroRingCard
                      label={content.calcProtein}
                      value={result.protein}
                      total={result.calories}
                      color="bg-gold-500"
                      bgColor="bg-zinc-900 border-gold-500/20"
                      textColor="text-gold-400"
                      icon={BicepsFlexed}
                      desc={content.calcProteinDesc || 'لإصلاح العضلات وبنائها حيوياً'}
                      kcal={result.protein * 4}
                      percent={proteinPct}
                      delay={0.1}
                    />
                    <MacroRingCard
                      label={content.calcCarbs}
                      value={result.carbs}
                      total={result.calories}
                      color="bg-blue-500"
                      bgColor="bg-zinc-900 border-blue-500/20"
                      textColor="text-blue-400"
                      icon={Utensils}
                      desc={content.calcCarbsDesc || 'المصدر الرئيسي لإنتاج الطاقة'}
                      kcal={result.carbs * 4}
                      percent={carbsPct}
                      delay={0.2}
                    />
                    <MacroRingCard
                      label={content.calcFats}
                      value={result.fats}
                      total={result.calories}
                      color="bg-rose-500"
                      bgColor="bg-zinc-900 border-rose-500/20"
                      textColor="text-rose-400"
                      icon={Droplet}
                      desc={content.calcFatsDesc || 'لتنظيم وإنتاج الهرمونات الأساسية'}
                      kcal={result.fats * 9}
                      percent={fatsPct}
                      delay={0.3}
                    />
                  </div>
                </div>
              )}

              {/* ── تبويب التفاصيل الحيوية (DETAILS TAB) ── */}
              {activeTab === 'details' && (
                <div className="space-y-6">

                  {/* تفاصيل معدلات الأيض الحيوية */}
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gold-400 flex items-center gap-2 mb-5">
                      <Dumbbell className="w-4 h-4" /> {isAr ? 'الملف الأيضي المتكامل' : 'Metabolic Profile'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StatPill label={isAr ? "معدل الأيض الأساسي (BMR)" : "BMR (Base Rate)"} value={result.bmr} unit="kcal" icon={Heart} color="bg-rose-500/80" delay={0.05} info="السعرات التي يحرقها الجسم في وضع الراحة التامة" />
                      <StatPill label={isAr ? "الاستهلاك اليومي الكلي (TDEE)" : "TDEE (Total Daily)"} value={result.tdee} unit="kcal" icon={Flame} color="bg-orange-500/80" delay={0.1} info="مجموع السعرات المستهلكة طوال اليوم مع الحركة" />
                      <StatPill label={isAr ? "السعرات المستهدفة" : "Target Calories"} value={result.calories} unit="kcal" icon={Target} color="bg-gold-500/80" delay={0.15} info="السعرات المعدلة خصيصاً للوصول لهدفك" />
                      <StatPill label={isAr ? "التأثير الحراري للأكل (TEF)" : "TEF (Thermic Effect)"} value={result.tef} unit="kcal" icon={Zap} color="bg-purple-500/80" delay={0.2} info="الطاقة المستهلكة لهضم وامتصاص الوجبات (~10%)" />
                      <StatPill label={isAr ? "مؤشر كتلة الجسم (BMI)" : "BMI"} value={result.bmi} icon={Scale} color="bg-blue-500/80" delay={0.25} info="مؤشر كتلة الجسم لتقييم تناسق الطول والوزن" />
                      <StatPill label={isAr ? "حالة الجسم الحالية" : "BMI Status"} value={result.bmiStatus} icon={Activity} color="bg-green-500/80" delay={0.3} />
                    </div>
                  </div>

                  {/* توزيع الماكروز التفصيلي */}
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gold-400 flex items-center gap-2 mb-5">
                      <BarChart3 className="w-4 h-4" /> {isAr ? 'التحليل التفصيلي للمغذيات الكبرى' : 'Macro Breakdown'}
                    </h3>
                    <div className="space-y-5">
                      {[
                        {
                          label: content.calcProtein, value: result.protein, kcal: result.protein * 4,
                          pct: proteinPct, color: '#EAB308', bg: 'from-gold-500/20 to-transparent',
                          icon: BicepsFlexed, textColor: 'text-gold-400',
                          tip: content.calcProteinDesc || 'أساسي لتخليق البروتين العضلي، ترميم الأنسجة، والوظيفة المناعية للرياضي.',
                        },
                        {
                          label: content.calcCarbs, value: result.carbs, kcal: result.carbs * 4,
                          pct: carbsPct, color: '#3b82f6', bg: 'from-blue-500/20 to-transparent',
                          icon: Utensils, textColor: 'text-blue-400',
                          tip: content.calcCarbsDesc || 'الوقود الأساسي لتمارين القوة عالية الشدة ووظائف الدماغ والجهاز العصبي.',
                        },
                        {
                          label: content.calcFats, value: result.fats, kcal: result.fats * 9,
                          pct: fatsPct, color: '#ef4444', bg: 'from-rose-500/20 to-transparent',
                          icon: Droplet, textColor: 'text-rose-400',
                          tip: content.calcFatsDesc || 'ضروري لإنتاج الهرمونات الذكورية (التستوستيرون) وامتصاص الفيتامينات القابلة للذوبان.',
                        },
                      ].map(({ label, value, kcal, pct, color, icon: Icon, textColor, tip }, i) => (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-800">
                              <Icon className={`w-4 h-4 ${textColor}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-300">{label}</span>
                                <div className="text-right">
                                  <span className={`text-lg font-black font-mono ${textColor}`}>{value}g</span>
                                  <span className="text-zinc-600 text-xs ml-2">/ {kcal} kcal / {Math.round(pct)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden ms-11">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{ delay: 0.2 + i * 0.1, duration: 1.0, ease: 'easeOut' }}
                            />
                          </div>
                          <p className="text-[10px] text-zinc-600 font-medium ms-11 leading-snug">{tip}</p>
                        </div>
                      ))}
                    </div>

                    {/* شريط توزيع السعرات الإجمالي */}
                    <div className="mt-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">{isAr ? 'تقسيم السعرات اليومية' : 'Daily Calorie Split'}</p>
                      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                        <motion.div className="bg-gold-500 h-full" style={{ width: `${proteinPct}%` }} initial={{ width: 0 }} animate={{ width: `${proteinPct}%` }} transition={{ duration: 1.2 }} />
                        <motion.div className="bg-blue-500 h-full" style={{ width: `${carbsPct}%` }} initial={{ width: 0 }} animate={{ width: `${carbsPct}%` }} transition={{ duration: 1.2, delay: 0.1 }} />
                        <motion.div className="bg-rose-500 h-full flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
                      </div>
                      <div className="flex gap-4 mt-2">
                        {[[ '#EAB308', content.calcProtein, Math.round(proteinPct) ], [ '#3b82f6', content.calcCarbs, Math.round(carbsPct) ], [ '#ef4444', content.calcFats, Math.round(fatsPct) ]].map(([c, l, p]) => (
                          <div key={l as string} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c as string }} />
                            <span className="text-[9px] font-black text-zinc-400">{l} {p}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── تبويب التوقع والمستقبل (SIMULATION TAB) ── */}
              {activeTab === 'simulation' && simulationData && (
                <div className="space-y-6">
                  <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 md:p-8 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center gap-4">
                          <div className="w-12 h-12 bg-gold-500/10 rounded-2xl flex items-center justify-center">
                            <Scale className="w-6 h-6 text-gold-500" />
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">{content.calcBmiStatusLabel}</p>
                            <p className="text-white text-xl font-black">
                              <AnimatedNumber value={result.bmi} decimals={1} /> <span className="text-zinc-500 text-sm font-bold">({result.bmiStatus})</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-0.5">{content.calcPredictiveAccuracy}</p>
                            <p className="text-green-400 text-xl font-black">{content.calcPredictiveAccuracyVal}</p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 mb-1">
                        <Activity className="w-7 h-7 text-gold-500" /> {content.calcPredictionTitle}
                      </h3>
                      <p className="text-zinc-500 font-bold text-sm mb-6">{content.calcPatternAnalysisLabel}</p>

                      <div className="h-[280px] w-full">
                        {/* استخدام key ديناميكي لحل أخطاء DOM insertBefore تماماً */}
                        <ResponsiveContainer width="100%" height="100%" key={`sim-container-${unitSystem}-${gender}-${simulationData.length}`}>
                          <AreaChart data={simulationData}>
                            <defs>
                              <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.2} />
                            <XAxis dataKey="week" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                              itemStyle={{ color: '#EAB308', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#EAB308" fillOpacity={1} fill="url(#simGrad)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-xs font-black uppercase text-zinc-500 mb-1">{content.calcMetabolicEfficiencyLabel}</p>
                          <p className="text-2xl font-black text-gold-400">
                            <AnimatedNumber value={simulationData[simulationData.length - 1]?.efficiency ?? 0} />%
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-xs font-black uppercase text-zinc-500 mb-1">{isAr ? 'الوزن المتوقع (١٢ أسبوع)' : '12-Week Projection'}</p>
                          <p className="text-2xl font-black text-green-400">
                            <AnimatedNumber value={simulationData[simulationData.length - 1]?.weight ?? 0} decimals={0} suffix={isImperial ? ' lbs' : ' kg'} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── تبويب وجبات التغذية (MEALS TAB) ── */}
              {activeTab === 'meals' && (
                <div className="space-y-8">
                  {mealPlan && showMealPlan ? (
                    <>
                      {/* مخطط توزيع السعرات والماكروز اليومي على الوجبات */}
                      {chartData && (
                        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-700 dark:text-white flex items-center gap-2 mb-6">
                            <TrendingUp className="w-4 h-4 text-gold-500" /> {content.calcDistributionTitle}
                          </h3>
                          <div className="h-[250px]">
                            {/* استخدام key ديناميكي لحل أخطاء DOM insertBefore تماماً */}
                            <ResponsiveContainer width="100%" height="100%" key={`dist-container-${unitSystem}-${gender}-${chartData.length}`}>
                              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                  {[['colorP', '#EAB308'], ['colorC', '#3b82f6'], ['colorF', '#ef4444']].map(([id, c]) => (
                                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={c} stopOpacity={0.8} />
                                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                                    </linearGradient>
                                  ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#555" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="protein" name={content.calcProtein} stackId="1" stroke="#EAB308" fillOpacity={1} fill="url(#colorP)" strokeWidth={3} />
                                <Area type="monotone" dataKey="carbs" name={content.calcCarbs} stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorC)" strokeWidth={3} />
                                <Area type="monotone" dataKey="fats" name={content.calcFats} stackId="1" stroke="#ef4444" fillOpacity={1} fill="url(#colorF)" strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* قائمة الوجبات المقترحة */}
                      <div className="text-center">
                        <h3 className="text-3xl font-black uppercase tracking-tight mb-2 text-zinc-800 dark:text-white">{content.calcMealPlanTitle}</h3>
                        <div className="h-1 w-20 bg-gold-500 mx-auto rounded-full" />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {mealPlan.map((meal, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group"
                          >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                              <ChefHat className="w-16 h-16" />
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center text-black font-black text-lg shadow-lg shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase tracking-tight text-zinc-800 dark:text-white">{meal.mealName}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {isAr ? `الوجبة ${idx + 1} من ${mealPlan.length}` : `Meal ${idx + 1} of ${mealPlan.length}`}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-5">
                              {/* المكونات */}
                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{isAr ? 'المكونات النخبوية' : 'Ingredients'}</p>
                                {meal.foods.map((food, fidx) => (
                                  <div key={fidx} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                                      <span className="font-bold text-sm text-zinc-600 dark:text-zinc-300">{food.item}</span>
                                    </div>
                                    <span className="font-black text-sm text-gold-600 dark:text-gold-400 font-mono bg-gold-500/10 px-3 py-1 rounded-lg">{food.amount}</span>
                                  </div>
                                ))}
                              </div>

                              {/* خطوات التحضير */}
                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{content.calcPreparationStepsLabel}</p>
                                {meal.steps.map((step, sidx) => (
                                  <div key={sidx} className="flex gap-3 items-start">
                                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[8px] font-black text-zinc-500">{sidx + 1}</span>
                                    </div>
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* بطاقة دعوة لحساب نسبة الدهون */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`bg-gradient-to-br from-zinc-900 to-black border-2 border-gold-500/20 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group flex flex-col justify-center items-center text-center h-full min-h-[300px] ${mealPlan.length % 2 === 0 ? 'md:col-span-2' : ''}`}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.1),transparent)]" />
                          <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <Zap className="w-8 h-8 text-gold-500" />
                          </div>
                          <h4 className="text-xl font-black uppercase tracking-tight text-white mb-2 z-10">
                            {isAr ? 'لماذا فارغة؟ اكتشف نسبة دهونك!' : 'Why empty? Discover your Body Fat!'}
                          </h4>
                          <p className="text-xs font-medium text-zinc-400 mb-6 max-w-sm z-10 leading-relaxed">
                            {isAr 
                              ? 'هل تعلم أن معرفة نسبة الدهون الدقيقة في جسمك تُحسن من دقة حساب الماكروز بنسبة تصل إلى ٣٠٪؟ استغل هذه المساحة لحساب نسبة دهونك الآن.' 
                              : 'Did you know that knowing your exact body fat percentage improves macro accuracy by up to 30%? Calculate it now.'}
                          </p>
                          <button
                            onClick={() => navigateTo(Page.BODYFAT)}
                            className="relative z-10 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center gap-3"
                          >
                            <Calculator className="w-5 h-5" />
                            {isAr ? 'حاسبة نسبة الدهون' : 'Body Fat Calculator'}
                          </button>
                        </motion.div>
                      </div>

                      {/* نصائح الخبير النخبوية */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black text-white border-2 border-gold-500/20 shadow-2xl text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(234,179,8,0.1),transparent)]" />
                        <div className="relative z-10">
                          <p className="text-gold-500 font-black uppercase tracking-[0.3em] mb-3 text-xs">{content.calcExpertAdviceLabel}</p>
                          <p className="text-base font-bold italic leading-relaxed text-zinc-300 mb-6 max-w-2xl mx-auto">"{content.calcMealAdvice}"</p>
                          <div className="flex items-center justify-center gap-2 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                            <Activity className="w-3.5 h-3.5 text-gold-500" />
                            {content.calcOptimizedForStack}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-zinc-500">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gold-500" />
                      <p className="font-bold">{isAr ? 'جاري إعداد وتحليل خطة وجباتك النخبوية...' : 'Generating your meal plan…'}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[600px] bg-zinc-50 dark:bg-background/20 rounded-[4rem] border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center p-16"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-28 h-28 bg-zinc-100 dark:bg-card rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner"
              >
                <Calculator className="w-14 h-14 text-zinc-300 dark:text-zinc-600" />
              </motion.div>
              <h3 className="text-3xl font-black text-zinc-400 uppercase tracking-tighter mb-3">{content.calcAwaitingInputLabel}</h3>
              <p className="text-zinc-500 font-bold max-w-sm italic opacity-40 mb-8">{content.calcDisclaimer}</p>

              <div className="flex flex-col items-center gap-2 text-xs text-zinc-500 font-medium">
                {[
                  isAr ? 'أدخل قياساتك الحيوية' : 'Fill in your stats',
                  isAr ? 'اختر هدفك التدريبي والنخبوي' : 'Choose your goal',
                  isAr ? 'اضغط احسب النتيجة الفورية' : 'Hit calculate'
                ].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-[9px] font-black text-gold-500">{i + 1}</div>
                    {s}
                    {i < 2 && <ArrowRight className="w-3 h-3 text-zinc-600 rotate-90" />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* الإعلان الأوسط */}
          {result && (
            <div className="my-6">
              <AdPlaceholder slotId="macro_result_mid" format="horizontal" content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MacroCalculator;
