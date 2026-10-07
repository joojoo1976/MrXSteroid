import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-030-cycle-cost-calculator.json';

export default function Tool030CycleCostCalculator() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [goal, setGoal] = useState<'bulk' | 'cut' | 'recomp' | 'strength'>('bulk');
  const [cycleWeeks, setCycleWeeks] = useState(8);
  const [compounds, setCompounds] = useState<any[]>([]);
  const [ancillaryCompounds, setAncillaryCompounds] = useState<any[]>([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.cycle_cost_result) setResult(savedState.cycle_cost_result);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: any = {
      id: Date.now(),
      name_en: 'Testosterone',
      name_ar: 'اختبارون',
      family: 'testosterone',
      concentration_mg_ml: 250,
      weekly_dose_mg: 500,
      cycle_weeks: cycleWeeks,
      total_mg: 500 * cycleWeeks,
      total_cost_usd: 0,
    };
    setCompounds(prev => [...prev, newCompound]);
  };

  const addAncillary = () => {
    const newAnc: any = {
      id: Date.now(),
      name_en: 'Aromatase Inhibitor',
      name_ar: 'مضاد الأروماتاز',
      family: 'ai',
      concentration_mg_ml: 1,
      weekly_dose_mg: 12.5,
      cycle_weeks: cycleWeeks,
      total_mg: 12.5 * cycleWeeks,
      total_cost_usd: 0,
    };
    setAncillaryCompounds(prev => [...prev, newAnc]);
  };

  const calculate = () => {
    const input = {
      goal,
      cycle_weeks: cycleWeeks,
      compounds,
      pct_duration_weeks: 4,
      ancillary_compounds,
      user_weight_kg: 85,
    };
    const r = calculateCycleCost(input);
    setResult(r);
    debouncedSave({ ...savedState, cycle_cost_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Goal:</label> <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="recomp">Recomp</option><option value="strength">Strength</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Cycle Length (weeks):</label> <input type="number" value={cycleWeeks} onChange={(e) => setCycleWeeks(parseInt(e.target.value))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compounds:</label> <p className="text-zinc-500 text-sm dir="ltr">{compounds.length} compounds</p> <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Compound </button></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Ancillary Compounds:</label> <p className="text-zinc-500 text-sm dir="ltr">{ancillaryCompounds.length} ancillaries</p> <button onClick={addAncillary} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Ancillary </button></div>
        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || compounds.length === 0}> {isPending ? 'Calculating...' : 'Calculate Cost'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.grand_total_usd}: ${result.grand_total_usd}</p>
          <p className="text-zinc-500">{i18nData.cost_per_week_usd}: ${result.cost_per_week_usd}/week</p>
          <p className="text-zinc-500">{i18nData.most_expensive_compound}: {result.most_expensive_compound}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.cost_breakdown.compounds.map((c, i) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.cost_breakdown.ancillaries.map((c, i) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.cost_breakdown.pct.map((c, i) => <li key={i}>{c.name}: ${c.cost}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.budget_savings_tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}