import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, User, Activity, Target, TrendingUp, RefreshCw,
  ChevronRight, ChevronLeft, Flame, Zap, Award, Info,
  Shield, Star, Heart, ArrowRight, CheckCircle2, RotateCcw,
  Ruler, Dumbbell, BarChart3, Brain
} from 'lucide-react';
import BrandLogo from '../../shared/ui/BrandLogo';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { UnitToggle } from '../../shared/ui/UnitToggle';
import { useBodyFatCalculator } from './hooks/useBodyFatCalculator';

interface BodyFatCalculatorProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

/* ─── Animated Counter ─── */
const AnimatedNumber: React.FC<{ value: number; decimals?: number; suffix?: string; className?: string }> = ({
  value, decimals = 0, suffix = '', className = ''
}) => {
  const [displayed, setDisplayed] = React.useState(0);
  const ref = React.useRef<number>(0);
  React.useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span className={className}>{displayed.toFixed(decimals)}{suffix}</span>;
};

/* ─── Step Progress Indicator ─── */
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number; isAr: boolean }> = ({
  currentStep, totalSteps, isAr
}) => {
  const stepLabels = isAr
    ? ['بياناتك الأساسية', 'قياسات الجسم', 'نتائجك']
    : ['Basic Info', 'Body Measurements', 'Your Results'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isDone ? '#EAB308' : isActive ? '#EAB308' : '#27272a',
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-gold-500/30 transition-all"
                >
                  {isDone
                    ? <CheckCircle2 className="w-5 h-5 text-black" />
                    : <span className={`text-sm font-black ${isActive ? 'text-black' : 'text-zinc-500'}`}>{stepNum}</span>
                  }
                </motion.div>
                <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-gold-400' : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {label}
                </span>
              </div>
              {idx < totalSteps - 1 && (
                <motion.div
                  className="flex-1 h-0.5 mx-2 rounded-full"
                  animate={{ backgroundColor: currentStep > stepNum ? '#EAB308' : '#27272a' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Measurement Tooltip ─── */
const MeasurementGuide: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onTouchStart={() => setOpen(v => !v)}
        className="text-zinc-500 hover:text-gold-400 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute bottom-full mb-2 start-0 w-52 p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-[10px] font-medium text-zinc-300 leading-relaxed z-50 shadow-2xl"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Input Field ─── */
const InputField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; unit: string; tooltip?: string; inputMode?: 'decimal' | 'numeric';
}> = ({ label, value, onChange, placeholder, unit, tooltip, inputMode = 'decimal' }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between gap-1">
      <span className="flex items-center gap-1.5">
        {label}
        {tooltip && <MeasurementGuide text={tooltip} />}
      </span>
      <span className="opacity-50 text-[9px] font-bold normal-case">{unit}</span>
    </label>
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-xl p-3 text-lg font-black text-center outline-none transition-all shadow-inner h-12 placeholder:text-zinc-600 placeholder:font-normal"
    />
  </div>
);

/* ─── Stat Card ─── */
const StatCard: React.FC<{
  icon: React.ElementType; label: string; value: string | number;
  unit?: string; color: string; delay?: number;
}> = ({ icon: Icon, label, value, unit, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring' }}
    className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl group hover:border-zinc-700 transition-all"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="text-lg font-black text-white font-mono leading-none">
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        {unit && <span className="text-xs text-zinc-500 ms-1">{unit}</span>}
      </p>
    </div>
  </motion.div>
);

/* ─── Body Fat Gauge ─── */
const BodyFatGauge: React.FC<{
  percentage: number; gender: 'male' | 'female'; gaugeColor: string; isAr: boolean;
}> = ({ percentage, gender, gaugeColor, isAr }) => {
  const maxBF = 50;
  const segments = gender === 'male'
    ? [
      { key: 'essential', label: isAr ? 'أساسي' : 'Essential', end: 6, color: '#60A5FA' },
      { key: 'athletes', label: isAr ? 'رياضي' : 'Athletic', end: 13, color: '#4ADE80' },
      { key: 'fitness', label: isAr ? 'لياقة' : 'Fitness', end: 17, color: '#FBBF24' },
      { key: 'average', label: isAr ? 'متوسط' : 'Average', end: 25, color: '#FB923C' },
      { key: 'obese', label: isAr ? 'سمنة' : 'Obese', end: maxBF, color: '#F87171' },
    ]
    : [
      { key: 'essential', label: isAr ? 'أساسي' : 'Essential', end: 16, color: '#60A5FA' },
      { key: 'athletes', label: isAr ? 'رياضي' : 'Athletic', end: 23, color: '#4ADE80' },
      { key: 'fitness', label: isAr ? 'لياقة' : 'Fitness', end: 28, color: '#FBBF24' },
      { key: 'average', label: isAr ? 'متوسط' : 'Average', end: 35, color: '#FB923C' },
      { key: 'obese', label: isAr ? 'سمنة' : 'Obese', end: maxBF, color: '#F87171' },
    ];

  const clampedPct = Math.min(percentage, maxBF);
  const markerPos = (clampedPct / maxBF) * 100;

  return (
    <div className="space-y-3">
      {/* Segmented bar */}
      <div className="relative h-6 rounded-full overflow-visible flex">
        {segments.map((seg, i) => {
          const prev = i === 0 ? 0 : segments[i - 1].end;
          const width = ((seg.end - prev) / maxBF) * 100;
          return (
            <div
              key={seg.key}
              className="h-full first:rounded-s-full last:rounded-e-full"
              style={{ width: `${width}%`, backgroundColor: seg.color, opacity: 0.75 }}
            />
          );
        })}
        {/* Marker */}
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${Math.min(markerPos, 97)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ position: 'absolute' }}
        >
          <div
            className="w-5 h-5 rounded-full border-4 border-white shadow-[0_0_12px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: gaugeColor }}
          />
        </motion.div>
      </div>
      {/* Labels */}
      <div className="flex justify-between">
        {segments.map((seg) => (
          <span key={seg.key} className="text-[8px] font-black uppercase text-zinc-600" style={{ color: seg.color }}>
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
    MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const BodyFatCalculator: React.FC<BodyFatCalculatorProps> = ({ content, navigateTo }) => {
  const { language: lang, unitSystem } = usePreferences();
  const isAr = lang === 'ar';
  const isImperial = unitSystem === 'imperial';

  const {
    step, nextStep, prevStep,
    gender, setGender,
    age, setAge,
    weight, handleWeightChange,
    height, handleHeightChange,
    waist, handleWaistChange,
    hip, handleHipChange,
    neck, handleNeckChange,
    activityLevel, setActivityLevel,
    result, isCalculating,
    ecosystemSynced,
    calculate, reset,
    getCategoryConfig,
    getEmpathyMessage,
  } = useBodyFatCalculator({ content, unitSystem });

  const catConfig = getCategoryConfig();
  const empathy = getEmpathyMessage();

  const activityLevels = isAr
    ? [
      { id: 'sedentary', label: 'مستقر تماماً', desc: 'عمل مكتبي، لا تمرين' },
      { id: 'light', label: 'نشاط خفيف', desc: '١–٢ يوم/أسبوع' },
      { id: 'moderate', label: 'نشاط متوسط', desc: '٣–٤ أيام/أسبوع' },
      { id: 'active', label: 'نشاط مرتفع', desc: '٥–٦ أيام/أسبوع' },
      { id: 'veryActive', label: 'نشاط شديد', desc: 'تمرين مكثف يومياً' },
    ]
    : [
      { id: 'sedentary', label: 'Sedentary', desc: 'Office work, no exercise' },
      { id: 'light', label: 'Light Activity', desc: '1–2 days/week' },
      { id: 'moderate', label: 'Moderate', desc: '3–4 days/week' },
      { id: 'active', label: 'Very Active', desc: '5–6 days/week' },
      { id: 'veryActive', label: 'Intense', desc: 'Hard daily training' },
    ];

  const measurementTips = {
    waist: isAr
      ? 'قِس محيط خصرك عند مستوى السرة مباشرة. قف بشكل مستقيم مع الزفير الطبيعي.'
      : 'Measure at the narrowest point of your waist (around the navel). Stand straight, exhale normally.',
    neck: isAr
      ? 'قِس أسفل حنجرتك مباشرة. اجعل الشريط أفقياً تماماً وغير ضيق.'
      : 'Measure just below the larynx (Adam\'s apple). Keep the tape horizontal and comfortably snug.',
    hip: isAr
      ? 'قِس أعرض نقطة في الحوض. الشريط يجب أن يمر فوق العظام البارزة بالحوض.'
      : 'Measure at the widest point of your hips/glutes. The tape should pass over the bony protrusions.',
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 py-12 md:py-16`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Background glows ── */}
      <div className="absolute top-0 start-0 w-[450px] h-[450px] bg-gold-500/5 blur-[130px] rounded-full animate-float-slow -z-10" />
      <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-blue-500/5 blur-[130px] rounded-full animate-float-slow -z-10 [animation-delay:-5s]" />
      <div className="absolute top-1/3 start-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-rose-500/3 blur-[100px] rounded-full -z-10" />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="inline-flex items-center justify-center p-5 mb-6 rounded-[2rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl"
        >
          <Scale className="w-10 h-10 text-gold-500" />
        </motion.div>

        <div className="mb-4">
          <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
        </div>

        <h1 className="text-4xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.bfTitle}
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-bold italic">
          {content.bfSubtitle}
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
          {[
            { icon: Shield, label: isAr ? 'معادلة البحرية الأمريكية' : 'US Navy Formula', color: 'text-blue-400' },
            { icon: Zap, label: isAr ? 'تحليل فوري' : 'Real-Time Analysis', color: 'text-gold-400' },
            { icon: Star, label: isAr ? 'نتائج دقيقة' : 'High Accuracy', color: 'text-rose-400' },
          ].map(({ icon: I, label, color }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-full backdrop-blur-sm">
              <I className={`w-3 h-3 ${color}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AdSlot Top */}
      <div className="mb-10 flex flex-col items-center gap-5">
        <UnitToggle className="scale-110 shadow-xl border-white/10" />
        <AdPlaceholder slotId="bodyfat_top_banner" format="horizontal" content={content} />
      </div>

      {/* ══════════ WIZARD CARD ══════════ */}
      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAr ? 30 : -30 }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            className="bg-white dark:bg-zinc-950/70 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            {/* Card top header with step */}
            <div className="px-8 pt-8 pb-4">
              <StepIndicator currentStep={step} totalSteps={3} isAr={isAr} />
            </div>

            <div className="px-8 pb-8 space-y-7">

              {/* ══ STEP 1: Basic Info ══ */}
              {step === 1 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
                      {isAr ? 'مرحباً! أولاً، حدد جنسك' : 'Welcome! First, select your gender'}
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium">
                      {isAr ? 'الجنس يغير معادلة الحساب بالكامل لدقة قصوى' : 'Gender changes the formula entirely for maximum accuracy'}
                    </p>
                  </div>

                  {/* Gender Toggle */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'male', labelAr: 'ذكر', labelEn: 'Male', emoji: '♂️' },
                      { id: 'female', labelAr: 'أنثى', labelEn: 'Female', emoji: '♀️' },
                    ].map((g) => (
                      <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGender(g.id as 'male' | 'female')}
                        className={`relative p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all overflow-hidden ${gender === g.id
                          ? 'bg-gold-500/10 border-gold-500 shadow-lg shadow-gold-500/10'
                          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                      >
                        {gender === g.id && (
                          <motion.div
                            layoutId="gender-bg"
                            className="absolute inset-0 bg-gold-500/5 rounded-2xl"
                          />
                        )}
                        <span className="text-3xl">{g.emoji}</span>
                        <span className={`text-base font-black uppercase tracking-widest ${gender === g.id ? 'text-gold-500' : 'text-zinc-500'}`}>
                          {isAr ? g.labelAr : g.labelEn}
                        </span>
                        {gender === g.id && (
                          <CheckCircle2 className="w-4 h-4 text-gold-500 absolute top-3 end-3" />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Age / Weight / Height */}
                  <div className="grid grid-cols-3 gap-4">
                    <InputField
                      label={content.bfAge}
                      value={age}
                      onChange={setAge}
                      placeholder="25"
                      unit={isAr ? 'سنة' : 'yr'}
                      inputMode="numeric"
                    />
                    <InputField
                      label={content.bfWeight}
                      value={weight}
                      onChange={handleWeightChange}
                      placeholder={isImperial ? '176' : '80'}
                      unit={isImperial ? 'lbs' : 'kg'}
                    />
                    <InputField
                      label={content.bfHeight}
                      value={height}
                      onChange={handleHeightChange}
                      placeholder={isImperial ? '70' : '180'}
                      unit={isImperial ? 'in' : 'cm'}
                    />
                  </div>

                  {/* Activity Level */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-gold-500" />
                      {isAr ? 'مستوى النشاط اليومي' : 'Daily Activity Level'}
                      <span className="text-[9px] font-medium text-zinc-600 normal-case ms-1">
                        {isAr ? '(لحساب TDEE)' : '(for TDEE)'}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {activityLevels.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => setActivityLevel(lvl.id)}
                          className={`p-2.5 rounded-xl border-2 text-center transition-all ${activityLevel === lvl.id
                            ? 'bg-gold-500/10 border-gold-500 text-gold-500'
                            : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-tight leading-snug">{lvl.label}</p>
                          <p className="text-[8px] font-medium opacity-60 mt-0.5">{lvl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2: Body Measurements ══ */}
              {step === 2 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
                      {isAr ? 'قياسات جسمك بدقة' : 'Your Body Measurements'}
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium">
                      {isAr
                        ? 'هذه القياسات هي الأساس لمعادلة البحرية الأمريكية. اضغط على أيقونة ⓘ لمعرفة كيف تقيس بالضبط'
                        : 'These measurements are the foundation of the US Navy formula. Tap the ⓘ icon to learn exactly how to measure.'}
                    </p>
                  </div>

                  {/* Measurement illustration hint */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                      {isAr
                        ? 'استخدم شريط قياس مرن. قِس مرتين وسجل المتوسط. الدقة هنا تعني نتائج أكثر دقة بنسبة ٩٠٪.'
                        : 'Use a flexible measuring tape. Measure twice and record the average. Accuracy here means up to 90% more precise results.'}
                    </p>
                  </div>

                  <div className={`grid ${gender === 'female' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                    <InputField
                      label={content.bfWaist}
                      value={waist}
                      onChange={handleWaistChange}
                      placeholder={isImperial ? '32' : '82'}
                      unit={isImperial ? 'in' : 'cm'}
                      tooltip={measurementTips.waist}
                    />
                    {gender === 'female' && (
                      <InputField
                        label={content.bfHip}
                        value={hip}
                        onChange={handleHipChange}
                        placeholder={isImperial ? '38' : '97'}
                        unit={isImperial ? 'in' : 'cm'}
                        tooltip={measurementTips.hip}
                      />
                    )}
                    <InputField
                      label={content.bfNeck}
                      value={neck}
                      onChange={handleNeckChange}
                      placeholder={isImperial ? '16' : '40'}
                      unit={isImperial ? 'in' : 'cm'}
                      tooltip={measurementTips.neck}
                    />
                  </div>

                  {/* Visual measurement guide cards */}
                  <div className={`grid ${gender === 'female' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                    {[
                      {
                        icon: '🎯', key: 'waist',
                        label: isAr ? 'الخصر' : 'Waist',
                        tip: isAr ? 'عند مستوى السرة' : 'At navel level',
                      },
                      ...(gender === 'female' ? [{
                        icon: '🔵', key: 'hip',
                        label: isAr ? 'الحوض' : 'Hip',
                        tip: isAr ? 'أعرض نقطة في المؤخرة' : 'Widest point of glutes',
                      }] : []),
                      {
                        icon: '⭕', key: 'neck',
                        label: isAr ? 'الرقبة' : 'Neck',
                        tip: isAr ? 'أسفل الحنجرة مباشرة' : 'Just below larynx',
                      },
                    ].map((item) => (
                      <div key={item.key} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-center">
                        <span className="text-2xl">{item.icon}</span>
                        <p className="text-[10px] font-black text-zinc-300 mt-1">{item.label}</p>
                        <p className="text-[9px] text-zinc-600 mt-0.5">{item.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Navigation Buttons ── */}
              <div className={`flex gap-3 pt-2 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                {step > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={prevStep}
                    className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {isAr ? 'رجوع' : 'Back'}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={step === 2 ? calculate : nextStep}
                  disabled={isCalculating}
                  className="flex-[2] py-4 bg-gold-500 hover:bg-gold-400 text-black font-black text-base rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.25)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70"
                >
                  {isCalculating
                    ? <><RefreshCw className="w-5 h-5 animate-spin" />{content.bfAnalyzing}</>
                    : step === 2
                      ? <><Target className="w-5 h-5" />{content.bfCalculate}</>
                      : <>
                        {isAr ? 'التالي' : 'Next'}
                        {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </>
                  }
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : result ? (
          /* ══════════ STEP 3: RESULTS ══════════ */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="space-y-6"
          >
            {/* Ecosystem sync badge */}
            <AnimatePresence>
              {ecosystemSynced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl w-fit mx-auto"
                >
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                    {content.macroEcosystem?.syncStatus}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Empathy Card ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-6 rounded-[2.5rem] border-2 overflow-hidden ${catConfig.border} bg-gradient-to-br ${catConfig.gradient}`}
            >
              <div className="absolute top-0 end-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ backgroundColor: catConfig.gaugeColor }} />
              <div className="relative z-10 flex items-start gap-4">
                <div className="text-4xl mt-1 shrink-0">{empathy.emoji}</div>
                <div>
                  <h3 className={`text-xl font-black mb-2 ${catConfig.color}`}>{empathy.title}</h3>
                  <p className="text-sm font-medium text-zinc-300 leading-relaxed">{empathy.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      {content.bfFormulaNote}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Main Stats Hero ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative p-6 md:p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-white"
            >
              <div className="absolute top-0 end-0 w-60 h-60 bg-gold-500/8 rounded-full blur-[80px] animate-float-slow" />

              {/* BF% + Category header */}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mb-8">
                {/* Big Number */}
                <div className="text-center md:text-start">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 flex items-center gap-2 justify-center md:justify-start">
                    <Target className="w-3.5 h-3.5 text-gold-500" />
                    {content.bfPercentageLabel}
                  </p>
                  <div className={`text-7xl md:text-8xl font-black font-mono tracking-tighter ${catConfig.color}`}>
                    <AnimatedNumber value={result.bodyFatPercentage} decimals={1} />
                    <span className="text-4xl">%</span>
                  </div>
                  <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${catConfig.bg} ${catConfig.border} border`}>
                    <Award className="w-3.5 h-3.5" />
                    {result.category}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full md:w-px h-px md:h-32 bg-zinc-800 shrink-0" />

                {/* BMI */}
                <div className="text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 flex items-center gap-2 justify-center">
                    <Scale className="w-3.5 h-3.5 text-blue-400" /> BMI
                  </p>
                  <div className="text-5xl font-black font-mono text-white">
                    <AnimatedNumber value={result.bmi} decimals={1} />
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold">
                    {result.bmi < 18.5
                      ? (isAr ? 'نحافة' : 'Underweight')
                      : result.bmi < 25
                        ? (isAr ? 'طبيعي' : 'Normal')
                        : result.bmi < 30
                          ? (isAr ? 'زيادة وزن' : 'Overweight')
                          : (isAr ? 'سمنة' : 'Obese')}
                  </p>
                </div>
              </div>

              {/* Gauge */}
              <div className="relative z-10 mb-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                  {isAr ? 'موقعك على مقياس نسبة الدهون' : 'Your position on the body fat scale'}
                </p>
                <BodyFatGauge
                  percentage={result.bodyFatPercentage}
                  gender={gender}
                  gaugeColor={catConfig.gaugeColor}
                  isAr={isAr}
                />
              </div>

              {/* Ideal target bar */}
              <div className="relative z-10 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {isAr ? 'النطاق المثالي المقترح' : 'Ideal Target Range'}
                  </span>
                  <span className="text-xs font-black text-gold-400">
                    {result.idealBodyFatMin}% – {result.idealBodyFatMax}%
                  </span>
                </div>
                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-gold-500 rounded-full"
                    style={{ width: `${((result.idealBodyFatMax - result.idealBodyFatMin) / (gender === 'male' ? 50 : 60)) * 100}%`, marginLeft: `${(result.idealBodyFatMin / (gender === 'male' ? 50 : 60)) * 100}%` }}
                  />
                </div>
                {result.kgToLose > 0 && (
                  <p className="text-[10px] text-zinc-500 mt-2">
                    {isAr
                      ? `تحتاج لخسارة ~${result.kgToLose} كجم من الدهون للوصول للمثالي`
                      : `~${result.kgToLose} kg of fat to reach ideal range`}
                  </p>
                )}
              </div>
            </motion.div>

            {/* ── Body Composition Grid ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard icon={Target} label={content.bfMassLabel} value={result.bodyFatMass} unit={isImperial ? 'lbs' : 'kg'} color="bg-rose-500/80" delay={0.05} />
              <StatCard icon={Dumbbell} label={content.bfLeanMassLabel} value={result.leanBodyMass} unit={isImperial ? 'lbs' : 'kg'} color="bg-gold-500/80" delay={0.1} />
              <StatCard icon={Flame} label={isAr ? 'معدل الأيض الأساسي' : 'BMR'} value={result.bmr} unit="kcal" color="bg-orange-500/80" delay={0.15} />
              <StatCard icon={Activity} label={isAr ? 'الاستهلاك اليومي TDEE' : 'TDEE'} value={result.tdee} unit="kcal" color="bg-blue-500/80" delay={0.2} />
            </motion.div>

            {/* ── AI Insight Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-6 rounded-[2rem] bg-gradient-to-br from-gold-500 via-gold-600 to-amber-700 text-black relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 bg-black/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">
                    {isAr ? '🔬 تشريح جسمك التفصيلي' : '🔬 Detailed Body Composition'}
                  </h4>
                  <p className="text-sm font-bold leading-snug">
                    {isAr
                      ? `تمتلك ${result.leanBodyMass.toFixed(1)} كجم من الكتلة العضلية الصافية، و${result.bodyFatMass.toFixed(1)} كجم دهون. معدل الأيض الأساسي ${result.bmr} سعرة/يوم، وأنت تستهلك ~${result.tdee} سعرة في ظل نشاطك الحالي.${result.kgToLose > 0 ? ` لتصل للنطاق المثالي تحتاج لخسارة ${result.kgToLose} كجم من الدهون فقط.` : ' أنت بالفعل في النطاق المثالي — رائع!'}`
                      : `You carry ${result.leanBodyMass.toFixed(1)} kg of lean muscle mass and ${result.bodyFatMass.toFixed(1)} kg of fat. Your basal metabolic rate is ${result.bmr} kcal/day, burning ~${result.tdee} kcal at your current activity level.${result.kgToLose > 0 ? ` To reach ideal range, you need to lose only ${result.kgToLose} kg of fat.` : ' You are already in the ideal range — excellent!'}`
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Category Description ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-[2rem] bg-zinc-900 border border-zinc-800 space-y-4"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-gold-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {content.bfCategoryTitle}
              </h3>
              <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                {gender === 'male'
                  ? content.bfCategoryDescriptions.male[result.categoryKey === 'fitness' ? 'athletes' : result.categoryKey === 'essential' ? 'essential' : result.categoryKey === 'athletes' ? 'athletes' : result.categoryKey === 'obese' ? 'obese' : 'average']
                  : content.bfCategoryDescriptions.female[result.categoryKey === 'fitness' ? 'athletes' : result.categoryKey === 'essential' ? 'essential' : result.categoryKey === 'athletes' ? 'athletes' : result.categoryKey === 'obese' ? 'obese' : 'average']
                }
              </p>
            </motion.div>

            {/* ── Action Buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigateTo(Page.MACRO)}
                className="py-5 bg-gold-500 hover:bg-gold-400 text-black font-black text-sm rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.2)] relative overflow-hidden group"
              >
                <TrendingUp className="w-5 h-5 group-hover:translate-y-[-3px] transition-transform" />
                {content.bfCalculateMacros}
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isAr ? 'rotate-180' : ''}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigateTo(Page.GENETIC)}
                className="py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <Zap className="w-5 h-5" />
                {content.bfGeneticPotential}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="py-5 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all border border-zinc-200 dark:border-zinc-700"
              >
                <RotateCcw className="w-5 h-5" />
                {isAr ? 'إعادة الحساب' : 'Recalculate'}
              </motion.button>
            </motion.div>

            {/* Mid Ad */}
            <div className="mt-4">
              <AdPlaceholder slotId="bodyfat_result_mid" format="horizontal" content={content} />
            </div>
          </motion.div>
        ) : (
          /* ── Calculating Overlay ── */
          <motion.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 rounded-full border-4 border-gold-500 border-t-transparent mb-6"
            />
            <p className="text-xl font-black text-zinc-300 uppercase tracking-widest">{content.bfAnalyzing}</p>
            <p className="text-sm text-zinc-600 mt-2 font-medium">
              {isAr ? 'جاري معالجة معادلة البحرية الأمريكية...' : 'Processing US Navy Formula...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Ad */}
      {step < 3 && (
        <div className="mt-10">
          <AdPlaceholder slotId="bodyfat_bottom" format="horizontal" content={content} />
        </div>
      )}
    </div>
  );
};

export default BodyFatCalculator;
