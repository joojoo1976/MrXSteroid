import React, { useState, useMemo } from 'react';
import { Activity, Plus, Trash2, LineChart } from 'lucide-react';
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
    // Optimized reduce: ensure we have at least one item before reducing, though stack.length check covers it.
    // Also handle case where compound might not be found (defensive coding).
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
    <div className="max-w-5xl mx-auto py-10">
      <div className="text-center mb-10"><Activity className="w-16 h-16 text-gold-500 mx-auto mb-4" /><h1 className="text-3xl font-black mb-2">{content.halfLifeVisualizer.title}</h1><p className="text-zinc-500 max-w-2xl mx-auto">{content.halfLifeVisualizer.subtitle}</p></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 h-fit space-y-6">
          <div><label htmlFor="compound-select" className="text-xs font-bold text-zinc-500 uppercase block mb-2">{content.halfLifeVisualizer.compoundLabel}</label><select id="compound-select" value={compoundId} onChange={e => setCompoundId(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none">{content.halfLifeVisualizer.compounds.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4"><div><label htmlFor="dosage-input" className="text-xs font-bold text-zinc-500 uppercase block mb-2">{content.halfLifeVisualizer.dosageLabel}</label><input id="dosage-input" type="number" value={dosage} onChange={e => setDosage(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none" /></div><div><label htmlFor="duration-input" className="text-xs font-bold text-zinc-500 uppercase block mb-2">{content.halfLifeVisualizer.durationLabel}</label><input id="duration-input" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none" /></div></div>
          <div><label htmlFor="frequency-select" className="text-xs font-bold text-zinc-500 uppercase block mb-2">{content.halfLifeVisualizer.frequencyLabel}</label><select id="frequency-select" value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none">{Object.entries(content.halfLifeVisualizer.frequencies).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}</select></div>
          <button onClick={addToStack} className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"><Plus className="w-5 h-5" /> {content.halfLifeVisualizer.addToStackBtn}</button>
          {stack.length > 0 && (<div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3"><h4 className="text-sm font-bold text-zinc-500 uppercase">{content.halfLifeVisualizer.activeStackTitle}</h4>{stack.map((item, idx) => { const name = content.halfLifeVisualizer.compounds.find(c => c.id === item.compoundId)?.name; return (<div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${item.colorClass}`}></div><div><div className="font-bold">{name}</div><div className="text-xs text-zinc-500">{item.dosage}{content.units.mg} / {content.halfLifeVisualizer.frequencies[item.frequency as keyof typeof content.halfLifeVisualizer.frequencies]} / {item.duration}{content.units.weeks}</div></div></div><button aria-label="Remove compound from stack" onClick={() => removeFromStack(item.id)} className="text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>) })}</div>)}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 relative min-h-[400px]">
          {simulationData ? (
            <div className="w-full h-full min-h-[350px] flex flex-col">
              <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex items-center gap-2"><LineChart className="w-5 h-5 text-gold-500" /> {content.halfLifeVisualizer.serumTitle}</h3><div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{content.halfLifeVisualizer.peakLabel}: {Math.round(simulationData.maxLevel)} {content.units.mg} equivalent</div></div>
              <div className="flex-1 w-full relative">
                <svg viewBox={`0 0 ${simulationData.daysToSimulate} 100`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {[0, 25, 50, 75, 100].map(y => (<line key={y} x1="0" y1={y} x2={simulationData.daysToSimulate} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />))}
                  <rect x={simulationData.pctStartDay} y="0" width={simulationData.daysToSimulate - simulationData.pctStartDay} height="100" fill="#22c55e" fillOpacity="0.1" />
                  <line x1={simulationData.pctStartDay} y1="0" x2={simulationData.pctStartDay} y2="100" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={simulationData.pctStartDay + 2} y="10" fontSize="4" fill="#22c55e" fontWeight="bold">{content.halfLifeVisualizer.pctZone}</text>
                  {simulationData.lines.map((line, idx) => { const points = line.points.map((val, d) => `${d},${100 - (val / simulationData.maxLevel * 90)}`).join(' '); return <polyline key={idx} points={points} fill="none" stroke={line.color} strokeWidth="1" opacity="0.6" /> })}
                  <polyline points={simulationData.total.map((val, d) => `${d},${100 - (val / simulationData.maxLevel * 90)}`).join(' ')} fill="none" stroke="currentColor" className="text-zinc-900 dark:text-white" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono"><span>{content.halfLifeVisualizer.xAxis} 0</span><span>{content.halfLifeVisualizer.xAxis} {Math.round(simulationData.daysToSimulate / 2)}</span><span>{content.halfLifeVisualizer.xAxis} {simulationData.daysToSimulate}</span></div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400"><Activity className="w-16 h-16 mb-4 opacity-20" /><p>{content.halfLifeVisualizer.emptyStackMsg}</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HalfLifeVisualizer;
