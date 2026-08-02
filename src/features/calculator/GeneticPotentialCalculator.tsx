import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RefreshCcw, ScanLine, Brain, Trophy, Zap, Sparkles, BookOpen, Dna, Stethoscope, CheckCircle2, Radar } from 'lucide-react';
import BrandLogo from '../../shared/ui/BrandLogo';
import AdPlaceholder from '../../shared/ui/AdPlaceholder';
import SystemGuideCard from '../../shared/ui/SystemGuideCard';
import KineticCounter from '../../shared/ui/KineticCounter';
import { ContentStrings, Page } from '@/shared/types/types';
import { StyledBrandName } from '../../shared/ui/StyledBrandName';
import { usePreferences } from '../../context/PreferencesContext';
import { useGeneticPotential } from './hooks/useGeneticPotential';
import { UnitToggle } from '../../shared/ui/UnitToggle';

interface GeneticPotentialCalculatorProps {
  content: ContentStrings;
  navigateTo: (page: Page) => void;
}

// Radar Chart Component
const RadarChart = ({ data, color = "#EAB308" }: { data: { label: string; value: number; fullMark: number }[]; color?: string }) => {
  const size = 220;
  const center = size / 2;
  const radius = (size / 2) - 52;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const normalizedValue = Math.min(d.value / d.fullMark, 1);
    const x = center + Math.cos(angle) * (radius * normalizedValue);
    const y = center + Math.sin(angle) * (radius * normalizedValue);
    return `${x},${y}`;
  }).join(" ");

  const truncate = (label: string) => {
    if (label.length <= 12) return label;
    return label.slice(0, 5) + "…";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid */}
        {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
          <polygon
            key={idx}
            points={data.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x = center + Math.cos(angle) * (radius * scale);
              const y = center + Math.sin(angle) * (radius * scale);
              return `${x},${y}`;
            }).join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const labelX = center + Math.cos(angle) * (radius + 26);
          const labelY = center + Math.sin(angle) * (radius + 26);

          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] font-black fill-zinc-400 uppercase"
              >
                {truncate(d.label)}
              </text>
            </g>
          );
        })}

        {/* Data Path */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          points={points}
          fill={color}
          fillOpacity="0.2"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

const GeneticPotentialCalculator: React.FC<GeneticPotentialCalculatorProps> = ({ content, navigateTo }) => {
  const { unitSystem, isRTL } = usePreferences();
  const isImperial = unitSystem === 'imperial';

  const {
    formData,
    setFormData,
    handleInputChange,
    result,
    calculate,
    reset
  } = useGeneticPotential({ content, unitSystem, isRTL: isRTL || false });

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-start mb-16 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] -z-10 animate-float-slow"></div>
        <div className="mb-4">
          <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-full bg-zinc-900/5 dark:bg-card/5 border-2 border-gold-500/20 backdrop-blur-md relative overflow-hidden group shadow-2xl"
        >
          <Brain className="w-12 h-12 text-gold-500 relative z-10 animate-pulse" />

          <div className="absolute inset-0 bg-gold-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-gradient-to-r from-gold-600 via-white to-gold-600 dark:via-gold-400 bg-clip-text text-transparent tracking-tighter filter drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-text-flash">
          {content.geneticCalculator.title}
        </h1>
        <p className="text-zinc-500 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-bold italic animate-glow">
          {content.geneticCalculator.subtitle}
        </p>
      </motion.div>

      {/* ── System Guide: الإمكانات الوراثية ── */}
      <div className="mb-12">
        <SystemGuideCard
          isAr={isRTL}
          icon={Sparkles}
          title={{
            ar: 'محرك الإمكانات الوراثية GenoPeak™',
            en: 'GenoPeak™ Genetic Ceiling Engine',
          }}
          subtitle={{
            ar: 'توقع السقف العضلي الطبيعي ومقارنته بموقعك الحالي',
            en: 'Predicts your natural muscular ceiling and measures your current position',
          }}
          intro={{
            ar: 'يعتمد هذا المحرك على معادلات أنثروبومترية موثقة في الأدبيات العلمية لقراءة هيكلك العظمي (الرسغ والكاحل والطول) وتوقع السقف الطبيعي للكتلة العضلية بدقة عالية، ثم يربطك بخطة الوصول:',
            en: 'This engine relies on anthropometric equations documented in the scientific literature to read your skeletal frame (wrist, ankle, height) and predict your natural muscle ceiling with high accuracy, then maps your road to it:',
          }}
          items={[
            {
              icon: Brain,
              title: {
                ar: '1. نموذج المعادلات الأنثروبومترية',
                en: '1. Anthropometric Equation Model',
              },
              body: {
                ar: 'تدمج معادلات FFMI ونماذج الإطار الهيكلي لتحويل قياساتك إلى تقدير رقمي للسقف العضلي الطبيعي بدون منشطات.',
                en: 'Combines FFMI formulas and skeletal-frame models to convert your measurements into a numeric estimate of your natural, drug-free muscle ceiling.',
              },
            },
            {
              icon: ScanLine,
              title: {
                ar: '2. تحليل الأبعاد الهيكلية',
                en: '2. Structural Frame Analysis',
              },
              body: {
                ar: 'تحلل مقاس الرسغ والكاحل والطول لتحديد إطار جسمك (خفيف / متوسط / ثقيل) الذي يحدد سعة تراكم الكتلة العضلية لديك.',
                en: 'Analyzes wrist, ankle and height to classify your frame (small / medium / large), which governs how much muscle you can realistically carry.',
              },
            },
            {
              icon: Trophy,
              title: {
                ar: '3. توقع السقف الوراثي للكتلة',
                en: '3. Genetic Muscle Ceiling Prediction',
              },
              body: {
                ar: 'تعرض وزنك المستهدف عند نسبة دهون منخفضة ضمن السقف الطبيعي، فتعرف أقصى كتلة عضلية يمكنك بلوغها بصحة واستدامة.',
                en: 'Shows your target weight at low body fat under the natural ceiling, so you know the max muscle mass you can reach healthily and sustainably.',
              },
            },
            {
              icon: Zap,
              title: {
                ar: '4. فجوة الإمكانات وخطة الوصول',
                en: '4. Potential Gap & Roadmap',
              },
              body: {
                ar: 'تقيس الفجوة بين وضعك الحالي والسقف المتوقع وتمنحك خريطة زمنية واقعية للوصول عبر التغذية والتدريب المتراكمين.',
                en: 'Measures the gap between your current state and expected ceiling, then gives you a realistic timeline to reach it through progressive training and nutrition.',
              },
            },
          ]}
        />
      </div>

      {/* AdSlot: Top Banner */}
      <div className="mb-12 flex flex-col items-center gap-6">
        <UnitToggle className="scale-125 shadow-2xl border-white/10" />
        <AdPlaceholder slotId="genetic_top_banner" format="horizontal" content={content} />
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-background/90 p-10 rounded-[3rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden backdrop-blur-2xl card-shine group animate-glow"
          >
            <div className="space-y-8">
              <motion.h3
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-sm font-black uppercase tracking-[0.3em] text-gold-600 mb-10 flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-gold-500 rounded-full animate-ping"></div>
                <ScanLine className="w-5 h-5" />
                {content.geneticCalculator.awaitingDataTitle}
              </motion.h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                    {content.geneticCalculator.labels.height}
                    <span className="text-[9px] opacity-50">{isImperial ? 'in' : 'cm'}</span>
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.05, borderColor: "rgba(234, 179, 8, 0.5)" }}
                    type="text"
                    inputMode="decimal"
                    value={formData.height}
                    onChange={e => handleInputChange('height', e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-background border-2 border-transparent rounded-2xl p-5 text-center font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                    placeholder={isImperial ? "70" : "180"}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{content.geneticCalculator.labels.bodyFat} %</label>
                  <motion.input
                    whileFocus={{ scale: 1.05, borderColor: "rgba(234, 179, 8, 0.5)" }}
                    type="number"
                    value={formData.bodyFat}
                    onChange={e => setFormData({ ...formData, bodyFat: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-background border-2 border-transparent rounded-2xl p-5 text-center font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  {content.geneticCalculator.labels.wrist}
                  <span className="text-[9px] opacity-50">{isImperial ? 'in' : 'cm'}</span>
                  <span className="text-gold-500/50 text-xs lowercase italic font-bold ms-auto">REQUIRED</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "rgba(234, 179, 8, 0.5)" }}
                  type="text"
                  inputMode="decimal"
                  value={formData.wrist}
                  onChange={e => handleInputChange('wrist', e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-background border-2 border-transparent rounded-2xl p-5 font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                  placeholder={isImperial ? "7.0" : "17.5"}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  {content.geneticCalculator.labels.ankle}
                  <span className="text-[9px] opacity-50">{isImperial ? 'in' : 'cm'}</span>
                  <span className="text-gold-500/50 text-xs lowercase italic font-bold ms-auto">REQUIRED</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "rgba(234, 179, 8, 0.5)" }}
                  type="text"
                  inputMode="decimal"
                  value={formData.ankle}
                  onChange={e => handleInputChange('ankle', e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-background border-2 border-transparent rounded-2xl p-5 font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                  placeholder={isImperial ? "9.0" : "22.5"}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                onClick={calculate}
                className="w-full py-6 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg uppercase tracking-widest rounded-3xl shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] transition-all flex items-center justify-center gap-4 group mt-10 relative overflow-hidden animate-glow"
              >
                <Zap className="w-6 h-6 animate-pulse group-hover:scale-150 transition-transform" />
                {content.geneticCalculator.cta}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 15 }}
                className="space-y-10"
              >
                {/* Top Stats Row */}
                <div className="grid md:grid-cols-2 gap-10">
                  {/* Physics Score Card */}
                  <div className="bg-zinc-900 dark:bg-card text-white p-10 rounded-[3.5rem] relative overflow-hidden border-4 border-gold-500/50 shadow-[0_0_50px_rgba(255,255,160,0.2)] group animate-glow">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/20 rounded-full blur-[100px] group-hover:bg-gold-500/30 transition-all duration-700 animate-float-slow"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <h4 className="text-base font-black text-gold-500 uppercase tracking-[0.2em] animate-pulse">{content.geneticCalculator.labels.physiqueScore}</h4>
                        <Trophy className="w-8 h-8 text-gold-500 animate-bounce" />
                      </div>
                      <div className="text-8xl font-black font-mono mb-4 flex items-baseline gap-3 animate-text-flash">
                        <KineticCounter value={result.physiqueScore} decimals={0} />
                        <span className="text-2xl text-zinc-600 font-bold tracking-tighter">/100</span>
                      </div>
                      <div className="h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.physiqueScore}%` }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-gold-600 via-yellow-400 to-gold-600 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                        </motion.div>
                      </div>
                      <p className="mt-6 text-base text-zinc-400 font-bold uppercase tracking-widest text-center">
                        THEORETICAL MAXIMUM ATTAINED
                      </p>
                    </div>
                  </div>

                  {/* Natural Limit Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-background p-10 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 relative overflow-hidden text-center flex flex-col items-center justify-center shadow-2xl animate-glow"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <p className="text-base font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      {content.geneticCalculator.naturalLabel}
                    </p>
                    <div className="text-7xl font-black text-zinc-900 dark:text-white font-mono mb-4 tracking-tighter">
                      <KineticCounter value={result.natural} decimals={1} suffix={isImperial ? " LB" : " KG"} />
                    </div>
                    <div className="text-base font-black text-green-600 dark:text-green-400 bg-green-500/10 px-5 py-2 rounded-full uppercase tracking-widest border border-green-500/20 animate-pulse">
                      ELITE FFMI: {result.normalizedFfmi.toFixed(1)}
                    </div>
                  </motion.div>
                </div>

                {/* Radar & Enhanced Stats */}
                <div className="grid md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 bg-white dark:bg-background p-8 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 flex flex-col relative shadow-2xl group card-shine">
                    <h4 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Radar className="w-4 h-4 text-gold-500" />
                      {content.geneticCalculator.labels.analysis}
                    </h4>
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <RadarChart
                          color="#EAB308"
                          data={result.potentials.map(p => ({
                            label: p.name,
                            value: p.potential,
                            fullMark: Math.max(...result.potentials.map(x => x.potential)) * 1.1
                          }))}
                        />
                      </motion.div>
                    </div>
                    <div className="mt-6 text-center">
                      <motion.p
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-lg font-black text-gold-600 dark:text-gold-500 uppercase tracking-tighter"
                      >
                        {result.type} MORPHOTYPE
                      </motion.p>
                      <p className="text-sm text-zinc-400 font-bold uppercase mt-1 tracking-widest">Genotype Identity</p>
                    </div>

                    {/* Radar Legend */}
                    <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <h5 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">
                        {content.geneticCalculator.radarLegendTitle}
                      </h5>
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed mb-4">
                        {content.geneticCalculator.radarLegendIntro}
                      </p>
                      <ul className="space-y-2">
                        {content.geneticCalculator.radarLegend.map((item) => (
                          <li key={item.key} className="flex items-start gap-2 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-gold-500 mt-1 shrink-0" />
                            <div>
                              <span className="font-black text-zinc-700 dark:text-zinc-200 uppercase">{item.label}</span>
                              <span className="text-zinc-400 font-medium"> — {item.note}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <div className="bg-zinc-900 dark:bg-card text-white p-8 rounded-[2.5rem] border-4 border-zinc-800 shadow-2xl relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-gold-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {content.geneticCalculator.caseyExplainTitle}
                        </h4>
                        <span className="text-[10px] bg-gold-500/15 text-gold-400 font-black px-2.5 py-1 rounded-full uppercase tracking-tighter border border-gold-500/20">
                          {content.geneticCalculator.modelLabel}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-4">
                        {content.geneticCalculator.caseyExplainIntro}
                      </p>

                      <div className="mb-5 p-3 bg-white/5 rounded-xl border border-white/10 font-mono text-[11px] text-gold-300 leading-relaxed">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mb-1">{content.geneticCalculator.caseyFormulaLabel}:</span>
                        {content.geneticCalculator.caseyFormula}
                      </div>

                      <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">
                        {content.geneticCalculator.caseyStepsTitle}
                      </h5>
                      <ol className="space-y-2.5">
                        {content.geneticCalculator.caseySteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-[11px] text-zinc-300 font-bold leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-gold-500/15 text-gold-400 font-black text-[10px] flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Genetic Boundaries with detail per metric */}
                    <div className="bg-zinc-900 dark:bg-card text-white p-8 rounded-[2rem] border-4 border-zinc-800 shadow-2xl relative overflow-hidden group">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="text-sm font-black text-zinc-300 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Dna className="w-4 h-4 text-gold-500" />
                            {content.geneticCalculator.labels.boundariesLabel}
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-relaxed">
                            {content.geneticCalculator.boundariesIntro}
                          </p>
                        </div>
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="shrink-0 text-xs bg-red-600 text-white font-black px-3 py-1.5 rounded-full uppercase tracking-tighter"
                        >
                          HARD LIMIT
                        </motion.span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {result.potentials.slice(0, 4).map((m, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl group/item transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gold-500/10 text-gold-500 group-hover/item:bg-gold-500 group-hover/item:text-black transition-colors">
                              <Activity className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[8px] font-black uppercase tracking-widest text-zinc-500 group-hover/item:text-gold-500 transition-colors">{m.name}</h5>
                              <div className="text-sm font-black text-white font-mono flex items-baseline gap-1">
                                {m.potential.toFixed(1)}
                                <span className="text-[8px] text-zinc-500 lowercase">{m.unit}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-6 mb-3">
                        {content.geneticCalculator.boundariesDetailsTitle}
                      </h5>
                      <div className="grid grid-cols-1 gap-2.5">
                        {content.geneticCalculator.boundariesDetails.map((detail, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                            <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">{detail}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 pt-5 border-t border-zinc-800 flex items-center justify-between group">
                        <div>
                          <p className="text-base font-black text-gold-500 uppercase tracking-widest animate-text-flash flex items-center gap-2">
                            <Zap className="w-4 h-4 fill-gold-500" />
                            ENHANCED THERMAL LIMIT
                          </p>
                          <p className="text-xs text-zinc-500 font-bold uppercase mt-1">Pharmacological Potential (+35%)</p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          className="text-4xl font-black font-mono text-white bg-white/5 px-6 py-3 rounded-[1.5rem] border border-white/10 shadow-2xl"
                        >
                          {result.enhanced} <span className="text-lg text-zinc-500">{isImperial ? 'LB' : 'KG'}</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical & Safety Advisory */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[2rem] border-2 border-emerald-500/20 bg-emerald-500/[0.04] backdrop-blur relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-emerald-500 uppercase tracking-widest">{content.geneticCalculator.advice.title}</h4>
                        <span className="text-[9px] text-emerald-400/70 font-black uppercase tracking-widest border border-emerald-500/20 rounded-full px-2 py-0.5">
                          {content.geneticCalculator.advice.eyebrow}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-3">
                        {content.geneticCalculator.advice.body}
                      </p>
                      <ul className="space-y-1.5">
                        {content.geneticCalculator.advice.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300 font-bold leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-emerald-400/80 font-bold italic mt-3">{content.geneticCalculator.advice.footer}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Reset Action */}
                <motion.button
                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={reset}
                  className="mx-auto flex items-center gap-3 text-sm font-black text-zinc-500 uppercase tracking-[0.3em] transition-all"
                >
                  <RefreshCcw className="w-5 h-5 animate-spin-slow" />
                  RECALIBRATE BIO-DATA
                </motion.button>

              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full min-h-[640px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-[4rem] bg-zinc-50/50 dark:bg-background/40 backdrop-blur-3xl relative overflow-hidden animate-glow"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rotate-45 transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>

                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [0, 4, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5 }}
                    className="relative w-24 h-24 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-card dark:to-zinc-900 rounded-[2rem] flex items-center justify-center shadow-2xl"
                  >
                    <ScanLine className="w-11 h-11 text-gold-500" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-black" />
                    </span>
                  </motion.div>
                </div>

                <motion.h3
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                  className="mt-8 text-2xl md:text-3xl font-black text-zinc-800 dark:text-zinc-200 tracking-tight"
                >
                  {content.geneticCalculator.awaitingDataTitle}
                </motion.h3>
                <p className="mt-3 text-zinc-500 max-w-md mx-auto text-sm font-medium leading-relaxed">
                  {content.geneticCalculator.awaitingSubtitle}
                </p>

                <div className="mt-8 p-4 rounded-2xl bg-white dark:bg-card/60 border border-zinc-200 dark:border-zinc-800 max-w-xs w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {content.geneticCalculator.currentVsPotential}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold-500">
                      {content.geneticCalculator.potentialCeiling}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold mt-2 italic">
                    <StyledBrandName text={content.geneticCalculator.unknownMeasurements} />
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GeneticPotentialCalculator;
