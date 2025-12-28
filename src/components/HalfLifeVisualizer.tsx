import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Trash2, LineChart, Zap, TrendingUp, ShieldAlert, Calendar } from 'lucide-react';
import { ContentStrings } from '../types';

interface HalfLifeVisualizerProps {
  content: ContentStrings;
}

const HalfLifeVisualizer: React.FC<HalfLifeVisualizerProps> = ({ content }) => {
  const [stack, setStack] = useState<Array<{ id: string, compoundId: string, dosage: number, frequency: string, duration: number, colorClass: string, color: string }>>([]);
  const [compoundId, setCompoundId] = useState('test_e');
  const [dosage, setDosage] = useState(250);
  const [frequency, setFrequency] = useState('e3d');
  const [duration, setDuration] = useState(12);

  const colors = ['#eab308', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

  const addToStack = () => {
    const idx = stack.length % colors.length;
    setStack([...stack, {
      id: Math.random().toString(36).substr(2, 9),
      compoundId,
      dosage,
      frequency,
      duration,
      colorClass: `bg-stack-${idx}`,
      color: colors[idx]
    }]);
  };

  const removeFromStack = (id: string) => { setStack(stack.filter(s => s.id !== id)); };

  const simulationData = useMemo(() => {
    if (stack.length === 0) return null;
    const daysToSimulate = (Math.max(...stack.map(s => s.duration)) * 7) + 50;
    const dataPoints: number[] = new Array(daysToSimulate).fill(0);
    const compoundLines: { name: string, points: number[], color: string }[] = [];

    stack.forEach(item => {
      const compound = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId);
      if (!compound) return;
      const halfLife = compound.halfLife;
      const freqDays = item.frequency === 'ed' ? 1 : item.frequency === 'eod' ? 2 : item.frequency === 'e3d' ? 3 : 7;
      const totalInjections = Math.floor((item.duration * 7) / freqDays);
      const itemPoints = new Array(daysToSimulate).fill(0);

      for (let i = 0; i < totalInjections; i++) {
        const injectionDay = i * freqDays;
        const amount = item.dosage;
        for (let d = injectionDay; d < daysToSimulate; d++) {
          const daysPassed = d - injectionDay;
          const remaining = amount * Math.pow(0.5, daysPassed / halfLife);
          itemPoints[d] += remaining;
          dataPoints[d] += remaining;
        }
      }
      compoundLines.push({ name: compound.name, points: itemPoints, color: item.color });
    });

    const maxLevel = Math.max(...dataPoints);
    let pctStartDay = 0;
    if (stack.length > 0) {
      const longestHalfLifeItem = stack.reduce((prev, current) => {
        const c1 = content.halfLifeVisualizer.compounds.find(x => x.id === prev.compoundId);
        const c2 = content.halfLifeVisualizer.compounds.find(x => x.id === current.compoundId);
        return (c1?.halfLife || 0) > (c2?.halfLife || 0) ? prev : current;
      });
      const longestCompound = content.halfLifeVisualizer.compounds.find(c => c.id === longestHalfLifeItem.compoundId);
      const lastInjectionDay = (longestHalfLifeItem.duration * 7);
      pctStartDay = lastInjectionDay + (5 * (longestCompound?.halfLife || 0));
    }

    return { total: dataPoints, lines: compoundLines, maxLevel, pctStartDay, daysToSimulate };
  }, [stack, content]);

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      {/* Background Kinetic Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 blur-[120px] rounded-full animate-float-slow -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-20 relative"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-gold-500/10 border-2 border-gold-500/20 backdrop-blur-3xl shadow-2xl animate-glow"
        >
          <Activity className="w-12 h-12 text-gold-500 animate-pulse" />
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white animate-text-flash tracking-tighter">
          {content.halfLifeVisualizer.title}
        </h1>
        <p className="text-2xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-bold italic animate-glow">
          {content.halfLifeVisualizer.subtitle}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Input Panel */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="lg:col-span-4 bg-white dark:bg-zinc-900/40 p-10 rounded-[4rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-3xl space-y-8 h-fit card-shine backdrop-blur-3xl animate-glow"
        >
          <div className="space-y-3">
            <label htmlFor="half-life-compound" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold-500" />
              {content.halfLifeVisualizer.compoundLabel}
            </label>
            <select id="half-life-compound" title={content.halfLifeVisualizer.compoundLabel} value={compoundId} onChange={e => setCompoundId(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-5 text-lg font-black outline-none cursor-pointer shadow-inner appearance-none">
              {content.halfLifeVisualizer.compounds.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="dosage-input" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{content.halfLifeVisualizer.dosageLabel}</label>
              <input id="dosage-input" title={content.halfLifeVisualizer.dosageLabel} placeholder="Dosage" type="number" value={dosage} onChange={e => setDosage(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-5 text-xl font-black text-center outline-none shadow-inner" />
            </div>
            <div className="space-y-3">
              <label htmlFor="duration-input" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{content.halfLifeVisualizer.durationLabel}</label>
              <input id="duration-input" title={content.halfLifeVisualizer.durationLabel} placeholder="Duration" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-5 text-xl font-black text-center outline-none shadow-inner" />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="frequency-select" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {content.halfLifeVisualizer.frequencyLabel}
            </label>
            <select id="frequency-select" title={content.halfLifeVisualizer.frequencyLabel} value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border-2 border-transparent focus:border-gold-500 rounded-2xl p-5 text-lg font-black outline-none cursor-pointer shadow-inner appearance-none">
              {Object.entries(content.halfLifeVisualizer.frequencies).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addToStack}
            className="w-full py-6 bg-gold-500 hover:bg-gold-400 text-black font-black text-lg rounded-[2rem] shadow-[0_0_40px_rgba(234,179,8,0.2)] flex items-center justify-center gap-3 relative overflow-hidden group animate-glow"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            {content.halfLifeVisualizer.addToStackBtn}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          </motion.button>

          {/* Active Stack Mini List */}
          <AnimatePresence>
            {stack.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-10 border-t-4 border-dashed border-zinc-100 dark:border-zinc-800 space-y-4"
              >
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">{content.halfLifeVisualizer.activeStackTitle}</h4>
                {stack.map((item, idx) => {
                  const name = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId)?.name;
                  return (
                    <motion.div
                      layout
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      key={item.id}
                      className="flex justify-between items-center bg-zinc-50 dark:bg-black/40 p-5 rounded-3xl border-2 border-transparent hover:border-gold-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
                        <div>
                          <div className="font-black text-lg leading-tight">{name}</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            {item.dosage}{content.units.mg} / {item.frequency} / {item.duration}W
                          </div>
                        </div>
                      </div>
                      <button title="Remove from stack" onClick={() => removeFromStack(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Visualizer Panel */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="lg:col-span-8 bg-zinc-950 p-12 rounded-[4rem] border-4 border-zinc-900 shadow-3xl relative min-h-[500px] flex flex-col overflow-hidden animate-glow"
        >
          {simulationData ? (
            <div className="w-full h-full flex flex-col relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-3 text-white">
                  <LineChart className="w-8 h-8 text-gold-500 animate-pulse" />
                  {content.halfLifeVisualizer.serumTitle}
                </h3>
                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-3xl">
                  <TrendingUp className="w-5 h-5 text-gold-500" />
                  <span className="text-sm font-black text-zinc-300 uppercase tracking-widest">
                    {content.halfLifeVisualizer.peakLabel}: <span className="text-xl text-gold-500 font-mono">{Math.round(simulationData.maxLevel)}</span> {content.units.mg}
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full relative min-h-[350px] group/svg">
                <svg viewBox={`0 0 ${simulationData.daysToSimulate} 100`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2={simulationData.daysToSimulate} y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                  ))}

                  {/* PCT Safety Zone */}
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    x={simulationData.pctStartDay} y="0" width={simulationData.daysToSimulate - simulationData.pctStartDay} height="100" fill="#22c55e"
                  />
                  <line x1={simulationData.pctStartDay} y1="0" x2={simulationData.pctStartDay} y2="100" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />

                  <g className="opacity-0 group-hover/svg:opacity-100 transition-opacity">
                    <text x={simulationData.pctStartDay + 2} y="15" fontSize="4" fill="#22c55e" fontWeight="900" className="uppercase tracking-widest">{content.halfLifeVisualizer.pctZone}</text>
                  </g>

                  {/* Compound Lines */}
                  {simulationData.lines.map((line, idx) => (
                    <motion.polyline
                      key={idx}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.4 }}
                      transition={{ duration: 1, delay: idx * 0.2 }}
                      points={line.points.map((val, d) => `${d},${100 - (val / simulationData.maxLevel * 90)}`).join(' ')}
                      fill="none" stroke={line.color} strokeWidth="1"
                    />
                  ))}

                  {/* Total Serum Line */}
                  <motion.polyline
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                    points={simulationData.total.map((val, d) => `${d},${100 - (val / simulationData.maxLevel * 90)}`).join(' ')}
                    fill="none" stroke="white" strokeWidth="2" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  />
                </svg>

                {/* Floating Decoration */}
                <div className="absolute -bottom-10 -right-10 opacity-5">
                  <ShieldAlert className="w-64 h-64 text-green-500" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 mt-12 uppercase tracking-[0.4em]">
                <span>Day 0</span>
                <span>Active Pharmacological Window</span>
                <span>Day {simulationData.daysToSimulate}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl backdrop-blur-3xl"
              >
                <Activity className="w-16 h-16 text-zinc-700" />
              </motion.div>
              <h3 className="text-3xl font-black text-zinc-600 uppercase tracking-tighter mb-4">{content.halfLifeVisualizer.emptyStackMsg}</h3>
              <p className="max-w-xs text-zinc-700 font-bold italic opacity-50">Add compounds to simulate pharmacological serum concentration levels over time.</p>
            </div>
          )}

          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-br-full"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default HalfLifeVisualizer;
