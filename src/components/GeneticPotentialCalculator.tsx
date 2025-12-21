import React, { useState } from 'react';
import { Scale, Ruler, Activity, Info, RefreshCcw, User, Lock, ScanLine } from 'lucide-react';
import { ContentStrings } from '../types';

interface GeneticPotentialCalculatorProps {
  content: ContentStrings;
}

const GeneticPotentialCalculator: React.FC<GeneticPotentialCalculatorProps> = ({ content }) => {
  const [formData, setFormData] = useState({ height: '', wrist: '', ankle: '', bodyFat: '10' });
  const [result, setResult] = useState<{ natural: number, enhanced: number, type: string } | null>(null);

  const calculatePotential = () => {
    const h = parseFloat(formData.height) / 2.54; const w = parseFloat(formData.wrist) / 2.54; const a = parseFloat(formData.ankle) / 2.54; const bf = parseFloat(formData.bodyFat) / 100;
    if (!h || !w || !a) return;
    const base = Math.pow(h, 1.5); const bone = (Math.sqrt(w) / 22.6670) + (Math.sqrt(a) / 17.0104); const leanMassLbs = base * bone; const totalWeightLbs = leanMassLbs / (1 - bf); const totalWeightKg = totalWeightLbs * 0.453592; const enhancedKg = totalWeightKg * 1.25;
    let type = "Mesomorph"; const ratio = w / h; if (ratio < 0.10) type = "Ectomorph"; else if (ratio > 0.115) type = "Endomorph";
    setResult({ natural: Math.round(totalWeightKg), enhanced: Math.round(enhancedKg), type });
  };

  const reset = () => { setFormData({ height: '', wrist: '', ankle: '', bodyFat: '10' }); setResult(null); }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="text-center mb-12"><Scale className="w-16 h-16 text-gold-500 mx-auto mb-4" /><h1 className="text-3xl font-black mb-2">{content.geneticCalculator.title}</h1><p className="text-zinc-500 max-w-2xl mx-auto">{content.geneticCalculator.subtitle}</p></div>
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl h-fit">
           <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase">{content.geneticCalculator.labels.height}</label><div className="relative"><Ruler className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-zinc-400" /><input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 focus:border-gold-500 outline-none font-mono" placeholder="180" /></div></div>
              <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase">{content.geneticCalculator.labels.bodyFat}</label><div className="relative"><Activity className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-zinc-400" /><input type="number" value={formData.bodyFat} onChange={e => setFormData({...formData, bodyFat: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 pl-10 focus:border-gold-500 outline-none font-mono" placeholder="10" /></div></div>
              <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">{content.geneticCalculator.labels.wrist} <Info className="w-3 h-3 text-zinc-400" /></label><input type="number" value={formData.wrist} onChange={e => setFormData({...formData, wrist: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:border-gold-500 outline-none font-mono" placeholder="17.5" /><p className="text-[10px] text-zinc-400">Bone thickness indicator</p></div>
              <div className="space-y-2"><label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">{content.geneticCalculator.labels.ankle} <Info className="w-3 h-3 text-zinc-400" /></label><input type="number" value={formData.ankle} onChange={e => setFormData({...formData, ankle: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 focus:border-gold-500 outline-none font-mono" placeholder="22.5" /><p className="text-[10px] text-zinc-400">Lower body structure</p></div>
           </div>
           <div className="flex gap-4 mt-8"><button onClick={calculatePotential} className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg">{content.geneticCalculator.cta}</button><button onClick={reset} className="px-4 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl hover:text-red-500 transition-colors"><RefreshCcw className="w-5 h-5" /></button></div>
        </div>
        <div className="flex flex-col justify-center">
           {result ? (
             <div className="animate-fade-in space-y-6">
                <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 relative overflow-hidden group"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><User className="w-24 h-24" /></div><div className="relative z-10"><p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{content.geneticCalculator.naturalLabel}</p><div className="text-4xl font-black text-zinc-700 dark:text-zinc-200">{result.natural} <span className="text-lg font-medium text-zinc-400">kg</span></div><div className="mt-4 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-zinc-500 w-[70%]"></div></div><div className="mt-2 text-xs text-zinc-400 font-mono">Based on Casey Butt Model</div></div></div>
                <div className="bg-zinc-900 p-6 rounded-3xl border border-gold-500/30 shadow-2xl relative overflow-hidden group"><div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl group-hover:bg-gold-500/20 transition-colors"></div><div className="relative z-10"><div className="flex justify-between items-start"><div><p className="text-sm font-bold text-gold-500 uppercase tracking-widest mb-1">{content.geneticCalculator.enhancedLabel}</p><div className="text-5xl font-black text-white">{result.enhanced} <span className="text-lg font-medium text-zinc-500">kg</span></div></div><div className="text-right"><div className="text-xs text-zinc-500 uppercase mb-1">{content.geneticCalculator.differenceLabel}</div><div className="text-xl font-bold text-green-500">+{result.enhanced - result.natural} kg</div></div></div><div className="mt-6 h-2 bg-zinc-800 rounded-full overflow-hidden relative"><div className="h-full bg-zinc-600 w-[70%] absolute top-0 left-0 opacity-30"></div><div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 w-[95%] shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div></div><div className="mt-4 flex items-center justify-between text-xs"><span className="text-zinc-400">{content.geneticCalculator.yourBodyType}: <strong className="text-white">{result.type}</strong></span><div className="flex items-center gap-1 text-gold-500"><Lock className="w-3 h-3" /> {content.geneticCalculator.unlockMsg}</div></div></div></div>
                <p className="text-[10px] text-center text-zinc-500 max-w-md mx-auto">{content.geneticCalculator.disclaimer}</p>
             </div>
           ) : (
             <div className="h-full bg-zinc-100 dark:bg-zinc-800/30 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 p-10 text-center"><ScanLine className="w-16 h-16 mb-4 opacity-30" /><h3 className="font-bold text-lg mb-2">Awaiting Data...</h3><p className="text-sm max-w-xs">{content.geneticCalculator.unknownMeasurements}</p></div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GeneticPotentialCalculator;
