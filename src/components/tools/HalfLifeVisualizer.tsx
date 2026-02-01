import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Calendar, ChevronDown,
  Info, Gauge, FlaskConical, Droplet, RotateCcw,
  Zap, Plus, Trash2, TrendingUp, LineChart, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Label
} from 'recharts';
import AdPlaceholder from '../shared/AdPlaceholder';
import { ContentStrings } from '../../types';
import { StyledBrandName } from '../shared/StyledBrandName';
import KineticCounter from '../shared/KineticCounter';
import { usePreferences } from '../../context/PreferencesContext';

interface HalfLifeVisualizerProps {
  content: ContentStrings;
}

interface ChartPayloadEntry {
  name: string;
  value: number;
  color: string;
  payload: Record<string, number | string>;
}

const CustomTooltip = ({ active, payload, label, content }: {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string;
  content: ContentStrings;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border-2 border-gold-500/50 p-6 rounded-3xl backdrop-blur-3xl shadow-2xl">
        <p className="text-zinc-500 font-black mb-3 border-b border-white/10 pb-2">{content.halfLifeVisualizer.tooltipDay} {label}</p>
        <div className="space-y-2">
          {payload.map((entry, index: number) => (
            <div key={index} className="flex justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${['bg-yellow-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500'][payload.indexOf(entry) % 5]}`}></div>
                <span className="text-white font-bold text-sm uppercase">{entry.name.split('_')[0]}</span>
              </div>
              <span className="text-gold-500 font-mono font-black">{Math.round(entry.value)} {content.units.mg}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gold-500/20 flex justify-between items-center">
          <span className="text-gold-500 font-black uppercase text-xs tracking-widest">{content.hlTotal}</span>
          <span className="text-white font-black text-xl">{Math.round(payload.reduce((acc: number, curr) => acc + (curr.name === 'total' ? 0 : curr.value), 0))} {content.units.mg}</span>
        </div>
      </div>
    );
  }
  return null;
};

const HalfLifeVisualizer: React.FC<HalfLifeVisualizerProps> = ({ content }) => {
  const { isRTL } = usePreferences();
  // --- 1. الذاكرة الذكية: استرجاع البيانات المحفوظة ---
  const loadSavedStack = () => {
    try {
      const saved = localStorage.getItem('mrx_steroid_stack');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  };

  const [stack, setStack] = useState<Array<{ id: string, compoundId: string, dosage: number, frequency: string, duration: number, startWeek: number, colorClass: string, color: string, bgColorClass?: string }>>(loadSavedStack);

  // حفظ التغييرات تلقائياً (Auto-Save)
  useEffect(() => {
    localStorage.setItem('mrx_steroid_stack', JSON.stringify(stack));
  }, [stack]);

  const [compoundId, setCompoundId] = useState('test_e');
  const [dosage, setDosage] = useState(250);
  const [frequency, setFrequency] = useState('e3d');
  const [duration, setDuration] = useState(12);
  const [startWeek, setStartWeek] = useState(1);


  const selectedCompound = useMemo(() =>
    content.halfLifeVisualizer.compounds.find(c => c.id === compoundId),
    [compoundId, content]);

  const colors = ['#eab308', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

  const addToStack = () => {
    if (!selectedCompound) return;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      compoundId,
      dosage,
      frequency,
      duration,
      startWeek,
      colorClass: `bg-gold-500`,
      color: colors[stack.length % colors.length],
      bgColorClass: `bg-gold-500`
    };
    setStack([...stack, newItem]);
  };

  const removeFromStack = (id: string) => { setStack(stack.filter(s => s.id !== id)); };

  const simulationData = useMemo(() => {
    if (stack.length === 0) return null;
    const daysToSimulate = (Math.max(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7))) + 50;
    const dataByDay: (Record<string, number> & { day: number, total: number })[] = Array.from({ length: daysToSimulate }, (_, i) => ({ day: i, total: 0 }));
    const compoundNames: string[] = [];

    stack.forEach((item) => {
      const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
      if (!compound) return;

      const key = `${item.compoundId}_${item.id}`;
      compoundNames.push(key);

      const startDay = (item.startWeek - 1) * 7;
      const totalDurationDays = item.duration * 7;
      const h = compound.halfLife;
      const k = Math.LN2 / h;

      for (let t = 0; t < daysToSimulate; t++) {
        let serumLevel = 0;
        let injectionCount = 0;
        if (item.frequency === 'ed') injectionCount = Math.floor((t - startDay));
        else if (item.frequency === 'eod') injectionCount = Math.floor((t - startDay) / 2);
        else if (item.frequency === 'e3d') injectionCount = Math.floor((t - startDay) / 3);
        else if (item.frequency === 'e7d') injectionCount = Math.floor((t - startDay) / 7);

        for (let i = 0; i <= injectionCount; i++) {
          const injectionDay = startDay + (
            item.frequency === 'ed' ? i :
              item.frequency === 'eod' ? i * 2 :
                item.frequency === 'e3d' ? i * 3 : i * 7
          );

          if (injectionDay < startDay + totalDurationDays && injectionDay >= startDay && t >= injectionDay) {
            // Apply Ester Weight Adjustment (e.g., Enanthate is ~70% hormone, 30% ester)
            const activeDosage = item.dosage * (compound.esterWeight || 1.0);
            serumLevel += activeDosage * Math.exp(-k * (t - injectionDay));
          }
        }
        dataByDay[t][key] = serumLevel;
        dataByDay[t].total += serumLevel;
      }
    });

    // Analysis Logic
    const maxLevel = Math.max(...dataByDay.map(d => d.total));
    const saturationPoint = dataByDay.findIndex(d => d.total >= maxLevel * 0.9);

    // Stability Index (Coefficient of Variation during peak weeks)
    const activePhaseEnd = Math.max(...stack.map(s => (s.startWeek - 1) * 7 + s.duration * 7));
    const peakWeekLevels = dataByDay.slice(saturationPoint, activePhaseEnd).map(d => d.total);
    const mean = peakWeekLevels.length > 0 ? peakWeekLevels.reduce((a, b) => a + b, 0) / peakWeekLevels.length : 0;
    const stdDev = peakWeekLevels.length > 0 ? Math.sqrt(peakWeekLevels.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / peakWeekLevels.length) : 0;
    // Stability Score = 100 - (CV * 100). Clamp to 0-100.
    const stabilityScore = mean > 0 ? Math.max(0, Math.min(100, 100 - (stdDev / mean * 100))) : 0;

    // Risk Markers
    const has19Nor = stack.some(s => s.compoundId === 'deca' || s.compoundId === 'tren_a' || s.compoundId === 'tren_e' || s.compoundId === 'npp');
    const oralCount = stack.filter(s => s.compoundId === 'anavar' || s.compoundId === 'dbol' || s.compoundId === 'anadrol' || s.compoundId === 'win_o' || s.compoundId === 'tbol' || s.compoundId === 'sdrol').length;
    const aromatizationRisk = stack.filter(s => s.compoundId === 'test_e' || s.compoundId === 'test_p' || s.compoundId === 'test_c' || s.compoundId === 'dbol' || s.compoundId === 'anadrol').length;
    const hasAI = stack.some(s => s.compoundId === 'arimidex' || s.compoundId === 'proviron');

    // PCT Intelligence: Finding the precise start day (when total drops below 50mg reference)
    let pctStartDay = activePhaseEnd;
    const lastDoseDay = activePhaseEnd;
    const postCycleData = dataByDay.slice(lastDoseDay);
    const dropBelowThreshold = postCycleData.findIndex(d => d.total < 50);
    if (dropBelowThreshold !== -1) {
      pctStartDay = lastDoseDay + dropBelowThreshold;
    } else {
      // Fallback to 5 x longest half-life if for some reason doesn't drop (unlikely in 50 days buffer)
      const longestHL = Math.max(...stack.map(s => content.halfLifeVisualizer.compounds.find(c => c.id === s.compoundId)?.halfLife || 0));
      pctStartDay = lastDoseDay + (longestHL * 5);
    }

    // PCT Intelligence & Intensity Logic
    let pctIntensity = 1;
    if (oralCount > 1) pctIntensity++;
    if (has19Nor) pctIntensity++;
    if (maxLevel > 800) pctIntensity++; // High serum level
    if (stack.length > 3) pctIntensity++;

    // PCT Protocol Calculation (Detailed 10-Day Loading + Maintenance)
    const pctProtocol = [];
    if (stack.length > 0) {
      const isHeavy = pctIntensity > 3;

      // Nolvadex
      pctProtocol.push({
        drug: content.halfLifeVisualizer.analysis?.pctNolvadex || 'Nolvadex',
        loading: isHeavy ? '40mg' : '20mg',
        maintenance: isHeavy ? '20mg' : '10mg',
        note: content.halfLifeVisualizer.analysis?.pctDaily || (isRTL ? 'يومياً' : 'Daily')
      });

      // Clomid
      pctProtocol.push({
        drug: content.halfLifeVisualizer.analysis?.pctClomid || 'Clomid',
        loading: isHeavy ? '100mg' : '50mg',
        maintenance: isHeavy ? '50mg' : '25mg',
        note: content.halfLifeVisualizer.analysis?.pctDaily || (isRTL ? 'يومياً' : 'Daily')
      });

      // Epifasi (hCG)
      pctProtocol.push({
        drug: content.halfLifeVisualizer.analysis?.pctHcg || 'Epifasi (hCG)',
        loading: isHeavy ? '1000 IU' : '500 IU',
        maintenance: '-',
        note: content.halfLifeVisualizer.analysis?.pctEod || (isRTL ? 'كل يومين' : 'EOD')
      });
    }

    // Stability Tips
    let stabilityTips = content.halfLifeVisualizer.analysis?.stabilityExcellent || (isRTL ? 'استقرار هرموني ممتاز.' : 'Excellent hormonal stability.');
    if (stabilityScore < 70) {
      stabilityTips = content.halfLifeVisualizer.analysis?.stabilityFluctuation || (isRTL
        ? '⚠️ التذبذب عالٍ! يفضل زيادة تكرار الحقن (مثلاً من مرتين أسبوعياً إلى يوم وراء يوم) لتقليل التقلبات.'
        : '⚠️ High fluctuation! Increase injection frequency (e.g., from twice weekly to EOD) to minimize spikes.');
    }

    // Safety Tips
    let safetyTips = content.halfLifeVisualizer.analysis?.safetySafe || (isRTL ? 'المؤشرات ضمن النطاق الآمن.' : 'Safety indicators within range.');
    if (has19Nor) {
      safetyTips = content.halfLifeVisualizer.analysis?.safety19nor || (isRTL
        ? '⚠️ دمج 19-nor (ترين/ديكا): استخدم كابيرجولين 0.25-0.5 ملجم عند الحاجة لمراقبة البرولاكتين.'
        : '⚠️ 19-nor detected (Tren/Deca): Use Cabergoline 0.25-0.5mg as needed to monitor Prolactin.');
    } else if (aromatizationRisk > 2 && !hasAI) {
      safetyTips = content.halfLifeVisualizer.analysis?.safetyAromatization || (isRTL
        ? '⚠️ خطر أروماتة عالٍ: تأكد من استخدام أريميدكس أو أروماسين للسيطرة على الاستروجين.'
        : '⚠️ High aromatization risk: Use Arimidex or Aromasin to control Estrogen.');
    }

    // PCT Tips
    let pctTips = (content.halfLifeVisualizer.analysis?.pctStartPrefix || (isRTL ? 'تحتاج لبدء التنظيف بعد ' : 'Start PCT after ')) +
      Math.round(pctStartDay) +
      (content.halfLifeVisualizer.analysis?.pctStartSuffix || (isRTL ? ' يوماً لضمان خروج جميع المواد من جسمك.' : ' days to ensure all compounds have cleared.'));

    if (pctIntensity > 3) {
      pctTips = content.halfLifeVisualizer.analysis?.pctHeavy || (isRTL
        ? '🚨 كورس ثقيل جداً: لا غنى عن الـ hCG ومتابعة دقيقة لهرمونات LH/FSH بعد انتهاء التنظيف.'
        : '🚨 Ultra Heavy Cycle: hCG is mandatory. Monitor LH/FSH levels closely after finishing PCT.');
    } else if (has19Nor) {
      pctTips = content.halfLifeVisualizer.analysis?.pct19nor || (isRTL
        ? '⚠️ تنبيه 19-nor: الاستشفاء قد يكون أبطأ. ننصح بإطالة فترة التنظيف لـ 6 أسابيع بدل 4.'
        : '⚠️ 19-nor Alert: Recovery might be slower. Consider extending PCT to 6 weeks instead of 4.');
    }

    return {
      chartData: dataByDay,
      compoundNames,
      maxLevel,
      stabilityScore: Math.round(stabilityScore),
      saturationDay: saturationPoint,
      risks: { has19Nor, oralCount, aromatizationRisk, hasAI },
      pctStartDay,
      daysToSimulate,
      pctProtocol,
      pctIntensity,
      aromatizationRisk,
      stabilityTips,
      safetyTips,
      pctTips
    };
  }, [stack, content, isRTL]);


  // --- Animation Variants ---
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>

      <motion.div initial={{ opacity: 0, y: -40 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-20 relative">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl animate-glow">
          <FlaskConical className="w-12 h-12 text-gold-500 animate-pulse" />
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.halfLifeVisualizer.title}
        </h1>
        <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">
          {content.halfLifeVisualizer.subtitle}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Input Sidebar */}
        <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-background/40 p-10 rounded-[4rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-3xl space-y-8 h-fit card-shine backdrop-blur-3xl">
            <div className="space-y-4">
              <label htmlFor="half-life-compound" className="text-sm font-black uppercase tracking-[0.3em] text-gold-500 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {content.halfLifeVisualizer.compoundLabel}
              </label>
              <div className="relative group/select z-20">
                <select
                  id="half-life-compound"
                  value={compoundId}
                  onChange={e => setCompoundId(e.target.value)}
                  title={content.halfLifeVisualizer.compoundLabel}
                  className="w-full bg-zinc-50 dark:bg-background border-2 border-transparent focus:border-gold-500 rounded-3xl p-6 pr-14 text-lg font-black outline-none cursor-pointer shadow-inner appearance-none transition-all"
                >
                  {content.halfLifeVisualizer.compounds.map(c => (
                    <option key={c.id} value={c.id}>{isRTL && c.nameAr ? c.nameAr : c.name}</option>
                  ))}
                </select>
                <ChevronDown className={`absolute top-1/2 end-6 -translate-y-1/2 text-gold-500 pointer-events-none`} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <label htmlFor="dosage-input" className="text-sm font-black uppercase tracking-widest text-zinc-400">{content.halfLifeVisualizer.dosageLabel}</label>
                <input
                  id="dosage-input"
                  type="number"
                  min="0"
                  value={dosage}
                  onChange={e => setDosage(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  title={content.halfLifeVisualizer.dosageLabel}
                  className={`w-full bg-zinc-900 border-zinc-800 text-white border-2 focus:border-gold-500 rounded-2xl p-4 text-lg font-black text-center outline-none shadow-inner ${dosage > 1000 ? 'border-red-500 text-red-500' : 'border-transparent'}`}
                />
                {dosage > 1000 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-red-500 bg-red-500/10 p-2 rounded-xl border border-red-500/20 flex items-center gap-1 justify-center mt-1">
                    <ShieldAlert size={12} />
                    {content.halfLifeVisualizer.hazardWarning}
                  </motion.div>
                )}
              </div>
              <div className="space-y-3">
                <label htmlFor="duration-input" className="text-sm font-black uppercase tracking-widest text-zinc-400">{content.halfLifeVisualizer.durationLabel}</label>
                <input
                  id="duration-input"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={e => setDuration(Math.max(1, Number(e.target.value)))}
                  placeholder="0"
                  title={content.halfLifeVisualizer.durationLabel}
                  className="w-full bg-zinc-900 border-zinc-800 text-white border-2 border-transparent focus:border-gold-500 rounded-2xl p-4 text-lg font-black text-center outline-none shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="start-week-input" className="text-sm font-black uppercase tracking-widest text-zinc-400">{content.halfLifeVisualizer.startWeekLabel}</label>
                <input
                  id="start-week-input"
                  type="number"
                  min="1"
                  value={startWeek}
                  onChange={e => setStartWeek(Math.max(1, Number(e.target.value)))}
                  placeholder="1"
                  title={content.halfLifeVisualizer.startWeekLabel}
                  className="w-full bg-zinc-900 border-zinc-800 text-white border-2 border-transparent focus:border-gold-500 rounded-2xl p-4 text-lg font-black text-center outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="frequency-select" className="text-sm font-black uppercase tracking-widest text-zinc-400">{content.halfLifeVisualizer.frequencyLabel}</label>
                {selectedCompound?.esterWeight && selectedCompound.esterWeight < 1 && (
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full" title={`Real dose adjusted by ${(selectedCompound.esterWeight * 100).toFixed(0)}% for ester weight`}>
                    Ester Adjusted
                  </span>
                )}
              </div>
              <select id="frequency-select" value={frequency} onChange={e => setFrequency(e.target.value)} title={content.halfLifeVisualizer.frequencyLabel} className="w-full bg-zinc-900 border-zinc-800 text-white border-2 border-transparent focus:border-gold-500 rounded-2xl p-5 text-lg font-black outline-none appearance-none">
                {Object.entries(content.halfLifeVisualizer.frequencies).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={addToStack}
              className="w-full py-6 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-3xl shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              {content.halfLifeVisualizer.addToStackBtn}
            </motion.button>

            {stack.length > 0 && (
              <div className="pt-8 border-t-2 border-dashed border-zinc-100 dark:border-zinc-800 space-y-4">
                <h4 className="text-sm font-black text-zinc-500 uppercase tracking-[0.5em]">{content.halfLifeVisualizer.activeStackTitle}</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {stack.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-background p-4 rounded-2xl border border-transparent hover:border-gold-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.bgColorClass}`}></div>
                        <div className="text-sm font-black truncate max-w-[120px]">{content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId)?.name}</div>
                      </div>
                      <button onClick={() => removeFromStack(item.id)} className="text-zinc-400 hover:text-red-500 p-2" title={content.labClose} aria-label={content.labClose}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <AdPlaceholder slotId="halflife_sidebar" format="rectangle" content={content} />
        </motion.div>

        {/* Simulator Content */}
        <motion.div initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="lg:col-span-8 space-y-8">
          {simulationData ? (
            <div className="space-y-8">
              {/* 1. The Stats Dashboard - Premium Polish */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Gauge, label: content.halfLifeVisualizer.stabilityTitle, val: `${simulationData.stabilityScore}%`, sub: content.halfLifeVisualizer.consistencyLabel, color: simulationData.stabilityScore > 80 ? 'text-green-500' : 'text-yellow-500' },
                  { icon: TrendingUp, label: content.halfLifeVisualizer.peakLabel, val: `${Math.round(simulationData.maxLevel)}`, sub: content.halfLifeVisualizer.mgSerumLabel, color: 'text-gold-500' },
                  { icon: ShieldAlert, label: content.halfLifeVisualizer.loadLevelLabel, val: simulationData.pctIntensity > 2 ? (content.halfLifeVisualizer.riskLevels.high) : (content.halfLifeVisualizer.riskLevels.low), sub: content.halfLifeVisualizer.loadLevelLabel, color: simulationData.pctIntensity > 2 ? 'text-red-500' : 'text-green-500' }
                ].map((stat, i) => (
                  <motion.div variants={itemVariants} initial="hidden" animate="visible" key={i} className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-gold-500/20 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 end-0 w-24 h-24 bg-white/5 blur-3xl group-hover:bg-white/10 transition-all"></div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      {i === 1 && <div className="text-sm bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full font-black tracking-widest animate-pulse border border-gold-500/20">PEAK</div>}
                    </div>
                    <div className="text-5xl font-black text-white mb-1 drop-shadow-lg">{stat.val}</div>
                    <div className="text-sm text-zinc-500 uppercase tracking-[0.2em] font-black opacity-80">{stat.label}</div>
                    <div className="text-base text-zinc-600 font-bold italic mt-1">{stat.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Main Chart */}
              <div className="bg-background p-8 md:p-12 rounded-[4rem] border-4 border-zinc-900 shadow-3xl h-[550px] relative overflow-hidden group/chart">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-3 text-white">
                    <LineChart className="w-8 h-8 text-gold-500" />
                    {content.halfLifeVisualizer.serumTitle}
                  </h3>
                  <div className="flex gap-4">
                    <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                      <TrendingUp className="w-4 h-4 text-gold-500" />
                      <span className="text-lg font-black text-zinc-300 uppercase">{content.halfLifeVisualizer.peakLabel}: {Math.round(simulationData.maxLevel)}{content.units.mg}</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={simulationData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      {simulationData.compoundNames.map((name, i) => (
                        <linearGradient key={name} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="day" stroke="#52525b" fontSize={14} tickLine={false} axisLine={false} tickFormatter={(v) => v % 7 === 0 ? `${content.halfLifeVisualizer.xAxis}${v}` : ''} />
                    <YAxis hide domain={[0, simulationData.maxLevel * 1.5]} />
                    <Tooltip content={<CustomTooltip content={content} />} />

                    {/* Reference Areas for Medical Context */}
                    <ReferenceArea y1={0} y2={50} fill="rgba(34, 197, 94, 0.05)" label={{ value: content.hlNaturalZone, position: 'insideBottomLeft', fill: '#22c55e', fontSize: 14, fontWeight: '900', opacity: 0.3 }} />
                    <ReferenceArea y1={800} y2={simulationData.maxLevel * 1.5} fill="rgba(239, 68, 68, 0.02)" label={{ value: content.hlBlastZone, position: 'insideTopLeft', fill: '#ef4444', fontSize: 14, fontWeight: '900', opacity: 0.3 }} />

                    {simulationData.compoundNames.map((name, i) => (
                      <Area key={name} type="monotone" dataKey={name} stroke={colors[i % colors.length]} fillOpacity={1} fill={`url(#grad_${i})`} strokeWidth={3} stackId="1" animationDuration={2000} />
                    ))}

                    <ReferenceLine x={simulationData.pctStartDay} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2}>
                      <Label value={content.halfLifeVisualizer.pctZone.toUpperCase()} position="insideTopRight" fill="#22c55e" fontSize={14} fontWeight="900" />
                    </ReferenceLine>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic AI Analysis */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Mr. X Analysis & Tips */}
                <div className="bg-gold-500 p-10 rounded-[3rem] text-black shadow-2xl relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 end-0 p-8 opacity-10"><Activity size={120} /></div>
                  <div className="space-y-8 relative z-10 h-full flex flex-col">
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-widest mb-4 flex items-center gap-3">
                        <Zap size={20} /> <StyledBrandName text={content.halfLifeVisualizer.analysis.adviceTitle} />
                      </h4>
                      <p className="text-xl font-black italic leading-tight">
                        "<StyledBrandName text={content.halfLifeVisualizer.analysis.advice} />"
                      </p>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-black/10 mt-auto">
                      <div className="p-6 bg-black/5 rounded-[2rem] border border-black/5 hover:bg-black/10 transition-colors group overflow-hidden">
                        <div className="flex items-center gap-3 mb-3 shrink-0">
                          <TrendingUp size={20} className="text-black group-hover:scale-125 transition-transform" />
                          <span className="text-sm font-black uppercase tracking-[0.2em]">{content.halfLifeVisualizer.analysis.stabilityAdviceTitle}</span>
                        </div>
                        <p className="text-lg font-black opacity-90 leading-relaxed break-words">{simulationData.stabilityTips}</p>
                      </div>

                      <div className="p-6 bg-black/5 rounded-[2rem] border border-black/5 hover:bg-black/10 transition-colors group overflow-hidden">
                        <div className="flex items-center gap-3 mb-3 shrink-0">
                          <ShieldAlert size={20} className="text-black group-hover:scale-125 transition-transform" />
                          <span className="text-base font-black uppercase tracking-[0.2em]">{content.halfLifeVisualizer.analysis.safetyAdviceTitle}</span>
                        </div>
                        <p className="text-lg font-black opacity-90 leading-relaxed break-words">{simulationData.safetyTips}</p>
                      </div>

                      <div className="p-6 bg-black/5 rounded-[2rem] border border-black/5 hover:bg-black/10 transition-colors group overflow-hidden">
                        <div className="flex items-center gap-3 mb-3 shrink-0">
                          <RotateCcw size={20} className="text-black group-hover:scale-125 transition-transform" />
                          <span className="text-base font-black uppercase tracking-[0.2em]">{content.hlPctAdvice}</span>
                        </div>
                        <p className="text-lg font-black opacity-90 leading-relaxed break-words">{simulationData.pctTips}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PCT Protocol Card - Premium Upgrade */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/40 p-10 rounded-[4rem] border-2 border-white/5 backdrop-blur-3xl space-y-8 flex flex-col h-full shadow-[0_0_50px_-12px_rgba(234,179,8,0.15)] relative overflow-hidden group"
                >
                  <div className="absolute -top-24 -end-24 w-64 h-64 bg-gold-500/10 blur-[100px] group-hover:bg-gold-500/20 transition-all duration-700 rounded-full"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-1">
                      <h4 className="flex items-center gap-3 text-gold-500 font-black uppercase text-lg tracking-[0.2em]">
                        <Calendar className="w-6 h-6 animate-bounce-slow" /> {content.halfLifeVisualizer.analysis.pctTableTitle}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-black uppercase tracking-tighter shadow-lg ${simulationData.pctIntensity > 3 ? 'bg-red-500/20 text-red-500 border border-red-500/20 shadow-red-500/10' :
                          simulationData.pctIntensity > 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 shadow-yellow-500/10' :
                            'bg-green-500/20 text-green-500 border border-green-500/20 shadow-green-500/10'
                          }`}>
                          {content.hlProtocolLevel}: {simulationData.pctIntensity > 3 ? content.hlUltraLevel : simulationData.pctIntensity > 1 ? content.hlModerateLevel : content.hlLiteLevel}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.4)", "0 0 0px rgba(34,197,94,0)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-6 py-3 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-500 text-xl font-black flex items-center gap-3 backdrop-blur-lg"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      {content.hlStartsDay} <KineticCounter value={Math.round(simulationData.pctStartDay)} className="ms-1" />
                    </motion.div>
                  </div>

                  {/* Recovery Power Bar */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-sm font-black uppercase tracking-widest text-zinc-500">
                      <span>{content.hlRecoveryPower}</span>
                      <KineticCounter value={simulationData.pctIntensity * 20} suffix="%" className="text-gold-500 text-base" />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${simulationData.pctIntensity * 20}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 relative"
                      >
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex-grow overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 shadow-inner relative z-10">
                    <table className="w-full text-start table-auto border-collapse">
                      <thead className="bg-white/5 text-sm font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
                        <tr>
                          <th className="p-4 text-start">{content.hlDrug}</th>
                          <th className="p-4 text-center">{content.hlFirst10Days}</th>
                          <th className="p-4 text-center">{content.hlWeeks2to4}</th>
                          <th className="p-4 text-center">{content.hlFreq}</th>
                        </tr>
                      </thead>
                      <tbody className="text-base font-bold text-white divide-y divide-white/5">
                        <AnimatePresence>
                          {simulationData.pctProtocol.map((p: { drug: string, loading: string, maintenance: string, note: string }, idx: number) => (
                            <motion.tr
                              key={idx}
                              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="hover:bg-gold-500/5 transition-all duration-300 group/row"
                            >
                              <td className="p-4 font-black text-start">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 rounded-lg bg-gold-500/10 shrink-0 group-hover/row:scale-110 transition-transform">
                                    <Droplet className="w-3 h-3 text-gold-500" />
                                  </div>
                                  <span className="text-base text-zinc-200 group-hover/row:text-gold-400 transition-colors uppercase tracking-tight truncate max-w-[80px] md:max-w-none">{p.drug}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center border-x border-white/5">
                                <span className="px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-500 font-mono text-base border border-gold-500/20 shadow-lg block mx-auto w-fit">{p.loading}</span>
                              </td>
                              <td className="p-4 text-center border-x border-white/5">
                                <span className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 font-mono text-base border border-white/10 block mx-auto w-fit">{p.maintenance}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm font-black text-zinc-500 uppercase tracking-tighter bg-white/5 px-2 py-1 rounded-md">{p.note}</span>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-8 bg-gradient-to-br from-gold-500/10 to-transparent rounded-[2.5rem] border border-gold-500/20 relative overflow-hidden z-10"
                  >
                    <div className="absolute top-0 end-0 p-4 opacity-5"><Activity size={60} /></div>
                    <div className="flex gap-5 items-start">
                      <div className="p-3 rounded-2xl bg-gold-500/20 shrink-0">
                        <Info className="text-gold-500 w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-base text-zinc-400 font-bold leading-relaxed">
                        {content.halfLifeVisualizer.analysis?.pctNote || (isRTL
                          ? 'هذا البروتوكول الذكي محسوب بناءً على قوة الكورس التدريبي والتحميل الهرموني الكلي. ننصح دائماً بعمل تحاليل مخبرية قبل البدء للتاكد من عودة المحور الهرموني للعمل.'
                          : 'This intelligent protocol is calculated based on cycle load and total hormonal displacement. Clinical testing is recommended to confirm HPTA recovery.')}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 min-h-[600px] border-4 border-dashed border-zinc-900 rounded-[4rem]">
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-40 h-40 bg-white/5 rounded-[4rem] flex items-center justify-center mb-12 shadow-2xl backdrop-blur-3xl border border-white/10">
                <Activity className="w-20 h-20 text-zinc-800" />
              </motion.div>
              <h3 className="text-4xl font-black text-zinc-700 uppercase tracking-tighter mb-6">{content.halfLifeVisualizer.emptyStackMsg}</h3>
              <p className="max-w-md text-zinc-500 font-bold italic text-lg leading-relaxed">{isRTL ? 'أضف المواد للبدء في محاكاة مستويات الهرمون والتركيز في الدم بمرور الوقت.' : 'Start adding compounds to simulate pharmacological serum concentration levels over time.'}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HalfLifeVisualizer;
