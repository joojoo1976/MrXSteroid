import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Calendar, ChevronDown, Clock,
  Info, Gauge, FlaskConical, Droplet, RotateCcw,
  Zap, Plus, Trash2, TrendingUp, LineChart, Activity,
  Target, Beaker, Sparkles, Scale, Ruler, BookOpen, HelpCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Label
} from 'recharts';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import { ContentStrings } from '@/shared/types/types';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import KineticCounter from '../../shared/ui/KineticCounter';
import SystemGuideCard from '../../shared/ui/SystemGuideCard';
import { usePreferences } from '../../context/PreferencesContext';
import { useHalfLifeVisualizer } from './hooks/useHalfLifeVisualizer';
import { clearanceDaysFromHalfLife } from './lib/pharmaEngine';

// 1 oz = 28.3495 g = 28 349.5 mg — the mg→oz factor used across the UI.
const MG_PER_OZ = 28349.523125;
/** Formats a mg dosage as ounces for the imperial display. */
const mgToOz = (mg: number): string => (mg / MG_PER_OZ).toFixed(3).replace(/\.?0+$/, '');

interface HalfLifeVisualizerProps {
  content: ContentStrings;
}

interface ChartPayloadEntry {
  name: string;
  value: number;
  color: string;
  payload: Record<string, number | string>;
}

// CRITICAL FIX: null-safe CustomTooltip — fixes TypeError: Cannot read properties of undefined (reading 'tooltipDay')
const CustomTooltip = ({ active, payload, label, content }: {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string | number;
  content?: ContentStrings;
}) => {
  const { isRTL } = usePreferences();
  if (!active || !payload || payload.length === 0 || !content) return null;
  const hlViz = content?.halfLifeVisualizer;
  if (!hlViz) return null;
  const totalVal = payload.reduce((acc: number, curr) => acc + (curr.name === 'total' ? 0 : curr.value), 0);
  return (
    <div className="bg-black/95 border border-gold-500/40 p-5 rounded-2xl backdrop-blur-3xl shadow-2xl min-w-[200px]">
      <p className="text-zinc-400 font-black text-xs mb-3 border-b border-white/10 pb-2 uppercase tracking-widest">
        {hlViz.tooltipDay ?? 'Day'} {label}
      </p>
      <div className="space-y-2">
        {payload.map((entry, index: number) => {
          // Serum series keys are `<compoundId>_<stackItemId>` — match by id prefix
          // so compound ids containing underscores (test_e, tren_a, win_o …) resolve.
          const comp = hlViz.compounds?.find(c => entry.name.startsWith(c.id + '_')) ?? hlViz.compounds?.find(c => c.id === entry.name);
          const dispName = comp ? (isRTL && comp.nameAr ? comp.nameAr : comp.name) : entry.name;
          return (
            <div key={index} className="flex justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-white font-bold text-xs truncate max-w-[120px]">{dispName}</span>
              </div>
              <span className="text-gold-400 font-mono font-black text-sm">{Math.round(entry.value)} {content.units?.mg ?? 'mg'}</span>
            </div>
          );
        })}
      </div>
      {totalVal > 0 && (
        <div className="mt-3 pt-3 border-t border-gold-500/20 flex justify-between items-center">
          <span className="text-gold-500 font-black uppercase text-[10px] tracking-widest">{content.hlTotal ?? 'TOTAL'}</span>
          <span className="text-white font-black text-base">{Math.round(totalVal)} {content.units?.mg ?? 'mg'}</span>
        </div>
      )}
    </div>
  );
};

const HalfLifeVisualizer: React.FC<HalfLifeVisualizerProps> = ({ content }) => {
  const { isRTL, unitSystem, setUnitSystem } = usePreferences();
  const [showSlider, setShowSlider] = useState(false);

  const {
    stack, compoundId, setCompoundId, dosage, setDosage,
    frequency, setFrequency, duration, setDuration,
    startWeek, setStartWeek, selectedCompound, effectiveDose,
    addToStack, removeFromStack, clearStack, simulationData, colors
  } = useHalfLifeVisualizer({ content, isRTL: isRTL || false, unitSystem });

  const hlViz = content?.halfLifeVisualizer;
  const clearanceDays = selectedCompound ? clearanceDaysFromHalfLife(selectedCompound.halfLife) : 0;

  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="absolute top-0 end-0 w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10" />
      <div className="absolute bottom-0 start-0 w-[400px] h-[400px] bg-blue-500/3 blur-[100px] rounded-full -z-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -40 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-20">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl animate-glow">
          <FlaskConical className="w-12 h-12 text-gold-500 animate-pulse" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {hlViz?.title}
        </h1>
        <p className="text-xl md:text-2xl text-zinc-500 max-w-4xl mx-auto font-bold leading-relaxed">{hlViz?.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            { icon: Beaker, label: isRTL ? 'معادلة باتمان الدوائية' : 'Bateman PK Equation' },
            { icon: Clock, label: isRTL ? 'دقة 6 ساعات' : '6-Hour Sub-Daily Resolution' },
            { icon: ShieldAlert, label: isRTL ? 'بروتوكول PCT تلقائي' : 'Auto PCT Protocol' },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 px-4 py-2 rounded-full text-xs text-zinc-400 font-bold">
              <p.icon size={12} className="text-gold-500" />{p.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── System Guide: محاكي نصف العمر ── */}
      <div className="mb-12">
        <SystemGuideCard
          isAr={isRTL}
          icon={Sparkles}
          title={{
            ar: 'محرك الحرائك الدوائية المتقدم',
            en: 'Advanced Pharmacokinetic Half-Life Engine',
          }}
          subtitle={{
            ar: 'محاكاة التركيز الدوائي لحظة بلحظة بدقة 6 ساعات',
            en: 'Sub-daily drug concentration simulation with 6-hour resolution',
          }}
          intro={{
            ar: 'يعتمد هذا المحاكي على معادلة باتمان الدوائية (Bateman Equation) لرسم منحنى تركيز كل مركب في دمك لحظة بلحظة، ويربط عمر النصف بموعد التصفية وبدء بروتوكول PCT تلقائياً:',
            en: 'This simulator relies on the Bateman pharmacokinetic equation to plot each compound blood concentration curve in real time, linking half-life to clearance timing and automatic PCT scheduling:',
          }}
          items={[
            {
              icon: FlaskConical,
              title: {
                ar: '1. معادلة باتمان الدوائية',
                en: '1. Bateman PK Equation',
              },
              body: {
                ar: 'تجمع بين معدل الامتصاص والتحلل لرسم منحنى التركيز الفعلي في الدم، فتتجنب هدر الجرعات أو التراكم الخطير فوق الحد الآمن.',
                en: 'Combines absorption and elimination rates to plot true blood concentration curves, avoiding wasted doses and unsafe accumulation.',
              },
            },
            {
              icon: Clock,
              title: {
                ar: '2. دقة زمنية تصل لـ 6 ساعات',
                en: '2. Up to 6-Hour Temporal Resolution',
              },
              body: {
                ar: 'تولّد نقاطاً زمنية كثيفة لمراقبة القمم والقيعان (الذروة والحضيض) لكل مركب، وهو أمر حاسم للجرعات المتكررة والتراكيب الزيتية طويلة الأجل.',
                en: 'Generates dense time points to track peaks and troughs of every compound — critical for frequent dosing and long-ester oils.',
              },
            },
            {
              icon: LineChart,
              title: {
                ar: '3. محاكي التراكم وحالة الاستقرار',
                en: '3. Accumulation & Steady-State Simulator',
              },
              body: {
                ar: 'تحسب حالة الاستقرار (Steady-State) وتعدد الجرعات والتراكب بين المركبات، لتعرف بالضبط متى تصل تركيزاتك للذروة الفعلية.',
                en: 'Models steady-state, multi-dose and compound stacking so you know exactly when your blood levels reach true peak.',
              },
            },
            {
              icon: ShieldAlert,
              title: {
                ar: '4. بروتوكول PCT والتصفية التلقائية',
                en: '4. Auto PCT & Clearance Protocol',
              },
              body: {
                ar: 'تعتمد التصفية الدوائية على 5.32× من عمر النصف، وتولّد توقيت بدء PCT تلقائياً لمنع الوصول لقاع هرموني خطير بعد الكورس.',
                en: 'Uses 5.32× half-life clearance and auto-generates PCT start timing to prevent a dangerous hormonal crash post-cycle.',
              },
            },
          ]}
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-950/60 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800/60 shadow-2xl space-y-7 backdrop-blur-3xl card-shine">

            {/* Metric/Imperial Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-gold-500" />
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">{content.hlUnitToggleLabel ?? 'Measurement'}</span>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-900 gap-1" role="group" aria-label={content.hlUnitToggleLabel ?? 'Measurement System'}>
                <button type="button" onClick={() => setUnitSystem('metric')} aria-pressed={unitSystem === 'metric'}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                    unitSystem === 'metric' ? 'bg-gold-500 text-black shadow-md shadow-gold-500/30' : 'text-zinc-400 hover:text-white'
                  }`}>
                  <Scale size={12} className={unitSystem === 'metric' ? 'text-black' : 'text-gold-500'} />{content.hlMetric ?? 'METRIC'}
                </button>
                <button type="button" onClick={() => setUnitSystem('imperial')} aria-pressed={unitSystem === 'imperial'}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                    unitSystem === 'imperial' ? 'bg-gold-500 text-black shadow-md shadow-gold-500/30' : 'text-zinc-400 hover:text-white'
                  }`}>
                  <Ruler size={12} className={unitSystem === 'imperial' ? 'text-black' : 'text-gold-500'} />{content.hlImperial ?? 'IMPERIAL'}
                </button>
              </div>
            </div>

            {/* Compound Selector */}
            <div className="space-y-4">
              <label htmlFor="half-life-compound" className="text-xs font-black uppercase tracking-[0.3em] text-gold-500 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {hlViz?.compoundLabel}
              </label>
              <div className="relative z-20">
                <select id="half-life-compound" value={compoundId} onChange={e => setCompoundId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus:border-gold-500 rounded-2xl p-5 pe-12 text-base font-black outline-none cursor-pointer appearance-none transition-all text-zinc-900 dark:text-white">
                  {hlViz?.compounds?.map(c => <option key={c.id} value={c.id}>{isRTL && c.nameAr ? c.nameAr : c.name}</option>)}
                </select>
                <ChevronDown className="absolute top-1/2 end-5 -translate-y-1/2 text-gold-500 pointer-events-none w-5 h-5" />
              </div>

              {/* Half-Life & Clearance Cards */}
              {selectedCompound && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/30 rounded-2xl p-4 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{content.hlHalfLifeLabel ?? 'Half-Life'}</div>
                    <KineticCounter value={selectedCompound.halfLife} decimals={1} className="text-3xl font-black text-gold-400 font-mono leading-tight" />
                    <div className="text-[10px] text-zinc-500 font-bold mt-1">{isRTL ? 'أيام' : 'Days'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-4 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{content.hlClearanceLabel ?? 'Clearance'}</div>
                    <KineticCounter value={clearanceDays} decimals={1} className="text-3xl font-black text-green-400 font-mono leading-tight" />
                    <div className="text-[10px] text-zinc-500 font-bold mt-1">{isRTL ? 'أيام ~95%' : 'Days · ~95%'}</div>
                  </div>
                </motion.div>
              )}
              {/* Medical Alert per Compound */}
              {selectedCompound && (isRTL ? selectedCompound.medicalAlertAr : selectedCompound.medicalAlert) && (
                <motion.div
                  key={selectedCompound.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4"
                >
                  <div className="absolute top-0 end-0 opacity-5 pointer-events-none">
                    <ShieldAlert size={80} className="text-amber-400" />
                  </div>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-amber-500/20">
                      <ShieldAlert size={14} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 mb-1">
                        {isRTL ? 'تنبيه طبي' : 'MEDICAL ALERT'}
                      </div>
                      <p className="text-[11px] font-bold text-zinc-300 leading-relaxed">
                        {isRTL ? selectedCompound.medicalAlertAr : selectedCompound.medicalAlert}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Dosage Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="dosage-input" className="text-xs font-black uppercase tracking-widest text-zinc-400">{hlViz?.dosageLabel} ({unitSystem === 'imperial' ? 'oz' : 'mg'})</label>
                <button type="button" onClick={() => setShowSlider(!showSlider)}
                  className="text-[10px] font-black text-gold-500 border border-gold-500/20 px-2.5 py-1 rounded-lg hover:bg-gold-500/10 transition-colors">
                  {showSlider ? (isRTL ? '# رقمي' : '# Number') : (isRTL ? '⟺ شريط' : '⟺ Slider')}
                </button>
              </div>
              {showSlider ? (
                <div className="space-y-3">
                  <input type="range" min={25} max={1000} step={25} value={dosage}
                    onChange={e => setDosage(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-gold-500 bg-zinc-800" />
                  <div className="flex justify-between text-[10px] font-black text-zinc-600">
                    <span>{unitSystem === 'imperial' ? `${mgToOz(25)}oz` : '25mg'}</span><span className="text-gold-500 text-sm">{unitSystem === 'imperial' ? mgToOz(dosage) + 'oz' : dosage + 'mg'}</span><span>{unitSystem === 'imperial' ? `${mgToOz(1000)}oz` : '1000mg'}</span>
                  </div>
                </div>
              ) : (
                <input id="dosage-input" type="number" min={0} max={9999} step={25} inputMode="numeric" value={dosage}
                  onChange={e => setDosage(Math.max(0, Number(e.target.value)))}
                  placeholder="250" title={hlViz?.dosageLabel}
                  className={`w-full bg-zinc-900 text-white border-2 focus:border-gold-500 rounded-2xl p-4 text-xl font-black text-center outline-none shadow-inner transition-colors ${
                    dosage > 1000 ? 'border-red-500 text-red-400' : 'border-zinc-800'
                  }`} />
              )}
              {selectedCompound?.esterWeight && (
                <div className="text-[11px] text-zinc-500 font-black uppercase text-center tracking-tight bg-zinc-900/50 py-2 px-3 rounded-xl border border-white/5">
                  {content.hlEffectiveDose ?? 'Active'}: <span className="text-gold-500 font-mono">{effectiveDose}mg</span>
                </div>
              )}
              <AnimatePresence>
                {dosage > 1000 && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="text-[11px] font-black text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2">
                    <ShieldAlert size={14} /> {hlViz?.hazardWarning}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Duration & Start Week */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="duration-input" className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">{hlViz?.durationLabel}</label>
                <input id="duration-input" type="number" min={1} max={52} step={1} inputMode="numeric" value={duration}
                  onChange={e => setDuration(Math.max(1, Math.min(52, Number(e.target.value))))}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 text-white focus:border-gold-500 rounded-2xl p-4 text-xl font-black text-center outline-none shadow-inner" />
              </div>
              <div className="space-y-2">
                <label htmlFor="start-week-input" className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block">{hlViz?.startWeekLabel}</label>
                <input id="start-week-input" type="number" min={1} max={52} step={1} inputMode="numeric" value={startWeek}
                  onChange={e => setStartWeek(Math.max(1, Math.min(52, Number(e.target.value))))}
                  className="w-full bg-zinc-900 border-2 border-zinc-800 text-white focus:border-gold-500 rounded-2xl p-4 text-xl font-black text-center outline-none shadow-inner" />
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <label htmlFor="frequency-select" className="text-xs font-black uppercase tracking-widest text-zinc-400">{hlViz?.frequencyLabel}</label>
              <select id="frequency-select" value={frequency} onChange={e => setFrequency(e.target.value)}
                className="w-full bg-zinc-900 border-2 border-zinc-800 text-white focus:border-gold-500 rounded-2xl p-4 text-base font-black outline-none appearance-none cursor-pointer transition-colors">
                {Object.entries(hlViz?.frequencies ?? {}).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
              </select>
            </div>

            {/* Add Button */}
            <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={addToStack}
              className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 text-black font-black text-base rounded-2xl shadow-xl shadow-gold-500/20 flex items-center justify-center gap-3 relative overflow-hidden group transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              {hlViz?.addToStackBtn}
            </motion.button>

            {/* Stack List */}
            {stack.length > 0 && (
              <div className="pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">{hlViz?.activeStackTitle}</h4>
                  <button type="button" onClick={() => { if (window.confirm(content.hlClearStackConfirm ?? 'Clear all?')) clearStack(); }}
                    className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1 border border-red-500/20 px-2.5 py-1 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors">
                    <RotateCcw size={10} /> {content.hlClearStack}
                  </button>
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                  {stack.map((item) => {
                    const c = hlViz?.compounds?.find(cc => cc.id === item.compoundId);
                    const dispName = c ? (isRTL && c.nameAr ? c.nameAr : c.name) : item.compoundId;
                    return (
                      <div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-transparent hover:border-gold-500/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <div>
                            <div className="text-sm font-black truncate max-w-[120px] dark:text-white">{dispName}</div>
                            <div className="text-[10px] text-zinc-500">{unitSystem === 'imperial' ? mgToOz(item.dosage) + 'oz' : item.dosage + 'mg'} · {item.duration}{isRTL ? 'أسبوع' : 'w'}</div>
                          </div>
                        </div>
                        <button onClick={() => removeFromStack(item.id)} className="text-zinc-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all" title={content.labClose}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <AdPlaceholder slotId="halflife_sidebar" format="rectangle" content={content} />
        </motion.div>

        {/* Results */}
        <motion.div initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="lg:col-span-8 space-y-8">
          {simulationData ? (
            <div className="space-y-8">

              {/* Stats Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Gauge, color: simulationData.stabilityScore > 80 ? 'text-green-400' : simulationData.stabilityScore > 55 ? 'text-yellow-400' : 'text-red-400',
                    label: hlViz?.stabilityTitle ?? 'Stability', sub: hlViz?.consistencyLabel,
                    animVal: simulationData.stabilityScore, suffix: '%', badge: null
                  },
                  {
                    icon: TrendingUp, color: 'text-gold-500',
                    label: hlViz?.peakLabel ?? 'Cmax Peak', sub: unitSystem === 'imperial' ? (isRTL ? 'أوقية / مصل' : 'oz active / serum') : hlViz?.mgSerumLabel,
                    animVal: unitSystem === 'imperial' ? Math.round(simulationData.maxLevel / MG_PER_OZ * 10000) / 10000 : Math.round(simulationData.maxLevel), suffix: unitSystem === 'imperial' ? 'oz' : 'mg', badge: 'PEAK'
                  },
                  {
                    icon: ShieldAlert,
                    color: simulationData.pctIntensity > 3 ? 'text-red-500' : simulationData.pctIntensity > 1 ? 'text-yellow-400' : 'text-green-400',
                    label: hlViz?.loadLevelLabel ?? 'Load Level', sub: null,
                    animVal: null,
                    staticVal: simulationData.pctIntensity > 2 ? (hlViz?.riskLevels?.high ?? 'HIGH') : (hlViz?.riskLevels?.low ?? 'OPTIMAL'),
                    badge: null
                  },
                ].map((stat, i) => (
                  <motion.div key={i} variants={itemVariants} initial="hidden" animate="visible"
                    className="bg-zinc-900/50 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/5 hover:border-gold-500/20 transition-all group overflow-hidden relative">
                    <div className="absolute -top-6 -end-6 w-24 h-24 bg-white/3 blur-3xl group-hover:bg-gold-500/5 transition-all rounded-full" />
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-3.5 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                        <stat.icon size={22} />
                      </div>
                      {stat.badge && <div className="text-[10px] bg-gold-500/10 text-gold-500 px-2.5 py-1 rounded-full font-black tracking-widest animate-pulse border border-gold-500/20">{stat.badge}</div>}
                    </div>
                    {stat.animVal !== null && stat.animVal !== undefined
                      ? <KineticCounter value={stat.animVal} suffix={stat.suffix} className={`text-4xl font-black mb-1 drop-shadow-lg ${stat.color}`} />
                      : <div className={`text-2xl font-black mb-1 drop-shadow-lg leading-tight ${stat.color}`}>{stat.staticVal}</div>
                    }
                    <div className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-black opacity-80 mt-1">{stat.label}</div>
                    {stat.sub && <div className="text-xs text-zinc-600 font-bold italic mt-1">{stat.sub}</div>}
                  </motion.div>
                ))}
              </div>

              {/* Half-Life Summary Row */}
              <div className={`grid gap-4 ${simulationData.halfLifeSummary.length > 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
                {simulationData.halfLifeSummary.map((hs, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-zinc-900/50 border border-white/5 hover:border-gold-500/15 rounded-2xl p-5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                      <div>
                        <div className="font-black text-white text-sm">{hs.name}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{isRTL ? 'عمر النصف' : 'Half-Life'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <KineticCounter value={hs.halfLifeDays} decimals={1} className="font-mono font-black text-gold-400 text-2xl" />
                        <div className="text-[10px] text-zinc-600 font-bold">{isRTL ? 'أيام' : 'Days'}</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <KineticCounter value={hs.clearanceDays} decimals={1} className="font-mono font-black text-green-400 text-2xl" />
                        <div className="text-[10px] text-zinc-600 font-bold">{isRTL ? 'تخليص' : 'Clear'}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Main Chart */}
              <div className="bg-zinc-950 p-8 md:p-10 rounded-[3rem] border border-zinc-900 shadow-2xl h-[520px] relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                  <h2 className="font-black text-xl uppercase tracking-tighter flex items-center gap-3 text-white">
                    <LineChart className="w-6 h-6 text-gold-500" />{hlViz?.serumTitle}
                  </h2>
                  <div className="flex gap-3">
                    <div className="bg-gold-500/10 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-gold-500/20">
                      <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                      <span className="text-sm font-black text-gold-400">Cmax: {unitSystem === 'imperial' ? mgToOz(simulationData.maxLevel) + 'oz' : Math.round(simulationData.maxLevel) + (content.units?.mg ?? 'mg')}</span>
                    </div>
                    <div className="bg-green-500/10 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-green-500/20">
                      <Clock className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-sm font-black text-green-400">PCT: {isRTL ? 'اليوم' : 'Day'} {Math.round(simulationData.pctStartDay)}</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="78%">
                  <AreaChart data={simulationData.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      {simulationData.compoundNames.map((name, i) => (
                        <linearGradient key={name} id={`grad_${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" vertical={false} />
                    <XAxis dataKey="day" stroke="#3f3f46" fontSize={12} tickLine={false} axisLine={false}
                      tickFormatter={(v) => v % 7 === 0 ? `${hlViz?.xAxis ?? 'D'}${v}` : ''} />
                    <YAxis hide domain={[0, simulationData.maxLevel * 1.6]} />
                    <Tooltip content={<CustomTooltip content={content} />} />
                    <ReferenceArea y1={0} y2={50} fill="rgba(34,197,94,0.04)"
                      label={{ value: content.hlNaturalZone ?? 'NATURAL', position: 'insideBottomLeft', fill: '#22c55e', fontSize: 11, fontWeight: '900', opacity: 0.4 }} />
                    <ReferenceArea y1={800} y2={simulationData.maxLevel * 1.6} fill="rgba(239,68,68,0.03)"
                      label={{ value: content.hlBlastZone ?? 'BLAST ZONE', position: 'insideTopLeft', fill: '#ef4444', fontSize: 11, fontWeight: '900', opacity: 0.4 }} />
                    {simulationData.compoundNames.map((name, i) => (
                      <Area key={name} type="monotone" dataKey={name}
                        stroke={colors[i % colors.length]} strokeWidth={2.5}
                        fillOpacity={1} fill={`url(#grad_${i})`}
                        stackId="1" animationDuration={1800} dot={false}
                        activeDot={{ r: 5, fill: colors[i % colors.length], strokeWidth: 2, stroke: '#000' }} />
                    ))}
                    <ReferenceLine x={simulationData.pctStartDay} stroke="#22c55e" strokeDasharray="6 4" strokeWidth={2}>
                      <Label value={(hlViz?.pctZone ?? 'PCT').toUpperCase()} position="insideTopRight" fill="#22c55e" fontSize={12} fontWeight="900" />
                    </ReferenceLine>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Timeline + Compound Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 space-y-5">
                  <h3 className="font-black text-base uppercase tracking-widest text-gold-500 flex items-center gap-3">
                    <Calendar className="w-5 h-5 animate-pulse" />{hlViz?.peakTimelineTitle ?? 'Cycle Timeline'}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: content.hlActiveDays ?? 'Active Days', val: simulationData.totalActiveDays, color: 'text-white', unit: isRTL ? 'يوم' : 'Days' },
                      { label: content.hlStartsDay ?? 'PCT Day', val: Math.round(simulationData.pctStartDay), color: 'text-green-400', unit: isRTL ? 'يوم' : 'Days' },
                      { label: content.hlClearanceLabel ?? 'Full Clearance', val: Math.round(simulationData.clearanceDay), color: 'text-yellow-400', unit: isRTL ? 'يوم' : 'Days' },
                      { label: content.hlTroughLabel ?? 'Trough (Cmin)', val: Math.round(simulationData.troughLevel), color: 'text-blue-400', unit: content.units?.mg ?? 'mg' },
                      { label: content.hlAvgPeak ?? 'Avg. Peak', val: simulationData.weeklyAveragePeak, color: 'text-gold-500', unit: content.units?.mg ?? 'mg' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="text-sm font-bold text-zinc-400">{row.label}</span>
                        <span className={`font-mono font-black text-lg ${row.color} flex items-center gap-1`}>
                          <KineticCounter value={row.val} />
                          <span className="text-xs font-bold text-zinc-500 ms-1">{row.unit}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 space-y-5">
                  <h3 className="font-black text-base uppercase tracking-widest text-gold-500 flex items-center gap-3">
                    <Activity className="w-5 h-5 animate-pulse" />{hlViz?.compoundBreakdownTitle ?? 'Peak Analysis'}
                  </h3>
                  <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {simulationData.weeklyPeakByCompound.map((item, idx) => {
                      const pct = simulationData.maxLevel > 0 ? (item.peak / simulationData.maxLevel) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm font-bold text-zinc-300 truncate max-w-[140px]">{item.name}</span>
                            </div>
                            <span className="font-mono font-black text-white text-sm">{item.peak} {content.units?.mg ?? 'mg'}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: idx * 0.1, ease: 'circOut' }}
                              className="h-full rounded-full" style={{ backgroundColor: item.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Analysis + PCT */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gold-500 p-8 rounded-[3rem] text-black shadow-2xl shadow-gold-500/20 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 end-0 p-8 opacity-10 pointer-events-none"><Activity size={100} /></div>
                  <div className="space-y-6 relative z-10 flex flex-col h-full">
                    <div>
                      <h4 className="font-black text-base uppercase tracking-widest mb-3 flex items-center gap-3">
                        <Zap size={18} /><StyledBrandName text={hlViz?.analysis?.adviceTitle ?? 'Mr. X Verdict'} />
                      </h4>
                      <p className="text-base font-black italic leading-snug">"<StyledBrandName text={hlViz?.analysis?.advice ?? ''} />"</p>
                    </div>
                    <div className="space-y-3 pt-5 border-t border-black/10 mt-auto">
                      {[
                        { icon: TrendingUp, title: hlViz?.analysis?.stabilityAdviceTitle ?? '', text: simulationData.stabilityTips },
                        { icon: ShieldAlert, title: hlViz?.analysis?.safetyAdviceTitle ?? '', text: simulationData.safetyTips },
                        { icon: RotateCcw, title: content.hlPctAdvice ?? '', text: simulationData.pctTips },
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 bg-black/8 rounded-2xl border border-black/5 hover:bg-black/12 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-black/10 rounded-xl"><tip.icon size={16} /></div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-0.5">{tip.title}</div>
                            <p className="text-xs font-black text-black leading-snug">{tip.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5 backdrop-blur-3xl space-y-6 flex flex-col shadow-[0_0_60px_-12px_rgba(234,179,8,0.15)] relative overflow-hidden group">
                  <div className="absolute -top-20 -end-20 w-56 h-56 bg-gold-500/8 blur-[80px] group-hover:bg-gold-500/15 transition-all rounded-full" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                      <h3 className="flex items-center gap-2 text-gold-500 font-black uppercase text-sm tracking-[0.2em]">
                        <Calendar className="w-5 h-5" />{hlViz?.analysis?.pctTableTitle}
                      </h3>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                        simulationData.pctIntensity > 3 ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                        simulationData.pctIntensity > 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                        'bg-green-500/20 text-green-400 border border-green-500/20'
                      }`}>
                        {content.hlProtocolLevel}: {simulationData.pctIntensity > 3 ? content.hlUltraLevel : simulationData.pctIntensity > 1 ? content.hlModerateLevel : content.hlLiteLevel}
                      </span>
                    </div>
                    <motion.div animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 20px rgba(34,197,94,0.4)', '0 0 0px rgba(34,197,94,0)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-5 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-black text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" />
                      {content.hlStartsDay} <KineticCounter value={Math.round(simulationData.pctStartDay)} className="ms-1" />
                    </motion.div>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-500">
                      <span>{content.hlRecoveryPower}</span>
                      <KineticCounter value={simulationData.pctIntensity * 20} suffix="%" className="text-gold-500" />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${simulationData.pctIntensity * 20}%` }}
                        transition={{ duration: 1.5, ease: 'circOut' }}
                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 relative overflow-hidden">
                        <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex-grow overflow-hidden rounded-2xl border border-white/5 bg-black/40 shadow-inner relative z-10">
                    <table className="w-full text-start table-auto border-collapse">
                      <thead className="bg-white/5 text-[11px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5">
                        <tr>
                          <th className="p-3 text-start">{content.hlDrug}</th>
                          <th className="p-3 text-center">{content.hlFirst10Days}</th>
                          <th className="p-3 text-center">{content.hlWeeks2to4}</th>
                          <th className="p-3 text-center">{content.hlFreq}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-bold text-white divide-y divide-white/5">
                        <AnimatePresence>
                          {simulationData.pctProtocol.map((p: { drug: string; loading: string; maintenance: string; note: string }, idx: number) => (
                            <motion.tr key={idx} initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }} className="hover:bg-gold-500/5 transition-colors group/row">
                              <td className="p-3 font-black">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded-md bg-gold-500/10"><Droplet className="w-3 h-3 text-gold-500" /></div>
                                  <span className="text-xs text-zinc-200 group-hover/row:text-gold-400 transition-colors uppercase truncate max-w-[80px] md:max-w-none">{p.drug}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center border-x border-white/5">
                                <span className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-500 font-mono text-xs border border-gold-500/20 block mx-auto w-fit">{p.loading}</span>
                              </td>
                              <td className="p-3 text-center border-x border-white/5">
                                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-300 font-mono text-xs border border-white/10 block mx-auto w-fit">{p.maintenance}</span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="text-xs font-black text-zinc-600 uppercase bg-white/5 px-2 py-1 rounded-md">{p.note}</span>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                  <motion.div whileHover={{ y: -3 }} className="p-5 bg-gradient-to-br from-gold-500/8 to-transparent rounded-2xl border border-gold-500/15 relative overflow-hidden z-10">
                    <div className="flex gap-4 items-start">
                      <div className="p-2.5 rounded-xl bg-gold-500/20 shrink-0"><Info className="text-gold-500 w-4 h-4 animate-pulse" /></div>
                      <p className="text-xs text-zinc-500 font-bold leading-relaxed">{hlViz?.analysis?.pctNote ?? ''}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-16 min-h-[600px] border-2 border-dashed border-zinc-900 rounded-[3rem]">
              <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 5 }}
                className="w-32 h-32 bg-white/3 rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl border border-white/8">
                <FlaskConical className="w-16 h-16 text-zinc-800" />
              </motion.div>
              <h3 className="text-3xl font-black text-zinc-700 uppercase tracking-tighter mb-4">{hlViz?.emptyStackMsg}</h3>
              <p className="max-w-sm text-zinc-600 font-bold text-base leading-relaxed">
                {isRTL
                  ? 'أضف مركباتك الأندروجينية للحصول على منحنى الحركية الدوائية الفوري وتوقيت PCT المُحسَّب.'
                  : 'Add your compounds to generate a real-time pharmacokinetic serum curve and precision PCT timing.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── SEO / Educational Content Section ── */}
      {hlViz?.seoContent && (
        <div className="mt-24 space-y-12">
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-black uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" /> {hlViz.seoContent.badge}
            </span>
            <h2 id="halflife-seo-h2" className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white leading-tight">
              {hlViz.seoContent.h2}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-semibold leading-relaxed">{hlViz.seoContent.intro}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {hlViz.seoContent.blocks.map((block, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group bg-white dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 rounded-[2rem] p-6 hover:border-gold-500/30 transition-all shadow-xl card-shine">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 font-black text-sm group-hover:scale-110 transition-transform">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-lg font-black mb-2 dark:text-white">{block.h3}</h3>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">{block.p}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3 dark:text-white">
              <HelpCircle className="w-6 h-6 text-gold-500" /> {hlViz.seoContent.faqTitle}
            </h3>
            <div className="space-y-3">
              {hlViz.seoContent.faq.map((item, i) => (
                <details key={i} className="group bg-white dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden open:border-gold-500/30 transition-all">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 list-none font-black text-sm md:text-base dark:text-white [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="w-4 h-4 text-gold-500 flex-shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalfLifeVisualizer;
