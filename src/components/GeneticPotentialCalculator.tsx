import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Scale, Ruler, Activity, Info, RefreshCcw, User, ScanLine, Target, Brain, Trophy, Zap, Share2 } from 'lucide-react';
import { ContentStrings } from '../types';

interface GeneticPotentialCalculatorProps {
  content: ContentStrings;
  unitSystem?: 'metric' | 'imperial';
  isRTL?: boolean;
}

// Kinetic Counter Component
const KineticCounter = ({ value, duration = 2, decimals = 1, prefix = "", suffix = "" }: { value: number, duration?: number, decimals?: number, prefix?: string, suffix?: string }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
  const displayValue = useTransform(springValue, (latest) => `${prefix}${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{displayValue}</motion.span>;
};

// Radar Chart Component
const RadarChart = ({ data, color = "#EAB308" }: { data: { label: string; value: number; fullMark: number }[]; color?: string }) => {
  const size = 200;
  const center = size / 2;
  const radius = (size / 2) - 40;
  const angleStep = (Math.PI * 2) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const normalizedValue = Math.min(d.value / d.fullMark, 1);
    const x = center + Math.cos(angle) * (radius * normalizedValue);
    const y = center + Math.sin(angle) * (radius * normalizedValue);
    return `${x},${y}`;
  }).join(" ");

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
          const labelX = center + Math.cos(angle) * (radius + 20);
          const labelY = center + Math.sin(angle) * (radius + 20);

          return (
            <g key={i}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-zinc-400 uppercase">
                {d.label.substring(0, 3)}
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

const GeneticPotentialCalculator: React.FC<GeneticPotentialCalculatorProps> = ({ content, unitSystem = 'metric', isRTL }) => {
  const isImperial = unitSystem === 'imperial';

  const [formData, setFormData] = useState({
    height: '',
    wrist: '',
    ankle: '',
    bodyFat: '12',
    shoulders: '',
    chest: '',
    waist: '',
    thigh: '',
    calf: ''
  });

  const [result, setResult] = useState<{
    natural: number;
    enhanced: number;
    type: string;
    ffmi: number;
    normalizedFfmi: number;
    goldenRatio: number;
    physiqueScore: number;
    potentials: { name: string; current: number; potential: number; unit: string }[];
  } | null>(null);

  const calculatePotential = () => {
    const h = parseFloat(formData.height);
    const w = parseFloat(formData.wrist);
    const a = parseFloat(formData.ankle);
    const curChest = parseFloat(formData.chest) || 0;
    const curShoulders = parseFloat(formData.shoulders) || 0;
    const curWaist = parseFloat(formData.waist) || 0;

    const bf = parseFloat(formData.bodyFat) || 12;

    if (!h || !w || !a) return;

    const hIn = isImperial ? h : h / 2.54;
    const wIn = isImperial ? w : w / 2.54;
    const aIn = isImperial ? a : a / 2.54;
    const hM = isImperial ? h * 0.0254 : h / 100;

    const maxWeightPounds = Math.pow(hIn, 1.5) * (
      (Math.sqrt(wIn) / 21.0) +
      (Math.sqrt(aIn) / 15.0)
    ) * (1 + (bf - 8) / 100);

    const naturalWeight = isImperial ? maxWeightPounds : maxWeightPounds * 0.453592;
    const enhancedWeight = naturalWeight * 1.35;

    const naturalPotentials = {
      chest: (hIn * 0.62) * (isImperial ? 1 : 2.54),
      shoulders: (hIn * 0.75) * (isImperial ? 1 : 2.54),
      waist: (hIn * 0.42) * (isImperial ? 1 : 2.54),
      thigh: (aIn * 2.85) * (isImperial ? 1 : 2.54),
      calf: (aIn * 1.95) * (isImperial ? 1 : 2.54),
      arm: (wIn * 2.5) * (isImperial ? 1 : 2.54)
    };

    const potentialLeanMassKg = (isImperial ? maxWeightPounds / 2.20462 : naturalWeight) * (1 - bf / 100);
    const ffmi = potentialLeanMassKg / (hM * hM);
    const normalizedFfmi = ffmi + 6.1 * (1.8 - hM);

    const potentialShoulderWaist = naturalPotentials.shoulders / naturalPotentials.waist;

    const ffmiScore = Math.min((normalizedFfmi / 25) * 100, 100);
    const structureScore = 100 - (Math.abs(1.618 - potentialShoulderWaist) * 100);
    const physiqueScore = (ffmiScore * 0.6) + (structureScore * 0.4);

    let type = content.geneticCalculator.bodyTypes.meso;
    const radio = wIn / hIn;
    if (radio < 0.10) type = content.geneticCalculator.bodyTypes.ecto;
    else if (radio > 0.115) type = content.geneticCalculator.bodyTypes.endo;

    setResult({
      natural: Math.round(naturalWeight),
      enhanced: Math.round(enhancedWeight),
      type,
      ffmi: normalizedFfmi,
      normalizedFfmi: normalizedFfmi,
      goldenRatio: potentialShoulderWaist,
      physiqueScore: Math.round(physiqueScore),
      potentials: [
        { name: content.geneticCalculator.labels.chest, current: curChest, potential: naturalPotentials.chest, unit: isImperial ? 'in' : 'cm' },
        { name: content.geneticCalculator.labels.shoulders, current: curShoulders, potential: naturalPotentials.shoulders, unit: isImperial ? 'in' : 'cm' },
        { name: content.geneticCalculator.labels.waist, current: curWaist, potential: naturalPotentials.waist, unit: isImperial ? 'in' : 'cm' },
        { name: content.geneticCalculator.labels.thigh, current: parseFloat(formData.thigh) || 0, potential: naturalPotentials.thigh, unit: isImperial ? 'in' : 'cm' },
        { name: content.geneticCalculator.labels.calf, current: parseFloat(formData.calf) || 0, potential: naturalPotentials.calf, unit: isImperial ? 'in' : 'cm' },
      ]
    });
  };

  const reset = () => {
    setFormData({ height: '', wrist: '', ankle: '', bodyFat: '12', shoulders: '', chest: '', waist: '', thigh: '', calf: '' });
    setResult(null);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-12 ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] -z-10 animate-float-slow"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-full bg-zinc-900/5 dark:bg-zinc-100/5 border-2 border-gold-500/20 backdrop-blur-md relative overflow-hidden group shadow-2xl"
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

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-zinc-900/90 p-10 rounded-[3rem] border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden backdrop-blur-2xl card-shine group animate-glow"
          >
            <div className="space-y-8">
              <motion.h3
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-xs font-black uppercase tracking-[0.3em] text-gold-600 mb-10 flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-gold-500 rounded-full animate-ping"></div>
                <ScanLine className="w-5 h-5" />
                {content.geneticCalculator.awaitingDataTitle}
              </motion.h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{content.geneticCalculator.labels.height}</label>
                  <motion.input
                    whileFocus={{ scale: 1.05, borderColor: "rgba(234, 179, 8, 0.5)" }}
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent rounded-2xl p-5 text-center font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                    placeholder={isImperial ? "70" : "180"}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{content.geneticCalculator.labels.bodyFat} %</label>
                  <motion.input
                    whileFocus={{ scale: 1.05, borderColor: "rgba(234, 179, 8, 0.5)" }}
                    type="number"
                    value={formData.bodyFat}
                    onChange={e => setFormData({ ...formData, bodyFat: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent rounded-2xl p-5 text-center font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  {content.geneticCalculator.labels.wrist}
                  <span className="text-gold-500/50 text-[10px] lowercase italic font-bold">REQUIRED</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "rgba(234, 179, 8, 0.5)" }}
                  type="number"
                  value={formData.wrist}
                  onChange={e => setFormData({ ...formData, wrist: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent rounded-2xl p-5 font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                  placeholder={isImperial ? "7.0" : "17.5"}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  {content.geneticCalculator.labels.ankle}
                  <span className="text-gold-500/50 text-[10px] lowercase italic font-bold">REQUIRED</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02, borderColor: "rgba(234, 179, 8, 0.5)" }}
                  type="number"
                  value={formData.ankle}
                  onChange={e => setFormData({ ...formData, ankle: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border-2 border-transparent rounded-2xl p-5 font-mono font-black text-2xl focus:ring-4 ring-gold-500/20 outline-none transition-all shadow-inner"
                  placeholder={isImperial ? "9.0" : "22.5"}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                onClick={calculatePotential}
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
                  <div className="bg-zinc-900 dark:bg-zinc-950 text-white p-10 rounded-[3.5rem] relative overflow-hidden border-4 border-gold-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] group animate-glow">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/20 rounded-full blur-[100px] group-hover:bg-gold-500/30 transition-all duration-700 animate-float-slow"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <h4 className="text-sm font-black text-gold-500 uppercase tracking-[0.2em] animate-pulse">{content.geneticCalculator.labels.physiqueScore}</h4>
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
                      <p className="mt-6 text-sm text-zinc-400 font-bold uppercase tracking-widest text-center">
                        THEORETICAL MAXIMUM ATTAINED
                      </p>
                    </div>
                  </div>

                  {/* Natural Limit Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-zinc-900 p-10 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 relative overflow-hidden text-center flex flex-col items-center justify-center shadow-2xl animate-glow"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      {content.geneticCalculator.naturalLabel}
                    </p>
                    <div className="text-7xl font-black text-zinc-900 dark:text-white font-mono mb-4 tracking-tighter">
                      <KineticCounter value={result.natural} decimals={1} suffix={isImperial ? " LB" : " KG"} />
                    </div>
                    <div className="text-sm font-black text-green-600 dark:text-green-400 bg-green-500/10 px-5 py-2 rounded-full uppercase tracking-widest border border-green-500/20 animate-pulse">
                      ELITE FFMI: {result.normalizedFfmi.toFixed(1)}
                    </div>
                  </motion.div>
                </div>

                {/* Radar & Enhanced Stats */}
                <div className="grid md:grid-cols-12 gap-10">
                  <div className="md:col-span-5 bg-white dark:bg-zinc-900 p-8 rounded-[3.5rem] border-4 border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center relative shadow-2xl group card-shine">
                    <h4 className="absolute top-8 left-8 text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">{content.geneticCalculator.labels.analysis}</h4>
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
                    <div className="mt-8 text-center">
                      <motion.p
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-lg font-black text-gold-600 dark:text-gold-500 uppercase tracking-tighter"
                      >
                        {result.type} MORPHOTYPE
                      </motion.p>
                      <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-widest">Genotype Identity</p>
                    </div>
                  </div>

                  <div className="md:col-span-7 bg-zinc-900 text-white p-10 rounded-[3.5rem] border-4 border-zinc-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] animate-float-slow"></div>
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Genetic Boundaries</h4>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-[10px] bg-red-600 text-white font-black px-3 py-1.5 rounded-full uppercase tracking-tighter"
                      >
                        HARD LIMIT
                      </motion.span>
                    </div>

                    <div className="space-y-8">
                      {result.potentials.slice(0, 4).map((m, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex justify-between text-sm font-black text-zinc-300">
                            <span className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full"></div>
                              {m.name}
                            </span>
                            <span className="font-mono text-gold-500">{m.potential.toFixed(1)} {m.unit}</span>
                          </div>
                          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: "100%" }}
                              transition={{ delay: 0.5 + (i * 0.2), duration: 1.5, type: "spring" }}
                              className="h-full bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800 flex items-center justify-between group">
                      <div>
                        <p className="text-sm font-black text-gold-500 uppercase tracking-widest animate-text-flash flex items-center gap-2">
                          <Zap className="w-4 h-4 fill-gold-500" />
                          ENHANCED THERMAL LIMIT
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Pharmacological Potential (+35%)</p>
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

                {/* Reset Action */}
                <motion.button
                  whileHover={{ scale: 1.1, color: "#ef4444" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={reset}
                  className="mx-auto flex items-center gap-3 text-xs font-black text-zinc-500 uppercase tracking-[0.3em] transition-all"
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
                className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-[4rem] bg-zinc-50/50 dark:bg-zinc-900/40 backdrop-blur-3xl relative overflow-hidden animate-glow"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rotate-45 transform translate-x-16 -translate-y-16"></div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-32 h-32 bg-zinc-200/50 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner"
                >
                  <Activity className="w-16 h-16 text-zinc-400 dark:text-zinc-600" />
                </motion.div>
                <h3 className="text-3xl font-black text-zinc-800 dark:text-zinc-200 mb-4 tracking-tight">{content.geneticCalculator.awaitingDataTitle}</h3>
                <p className="text-zinc-500 max-w-sm mx-auto text-lg font-medium leading-relaxed italic">{content.geneticCalculator.unknownMeasurements}</p>
                <div className="mt-10 flex gap-2">
                  <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
