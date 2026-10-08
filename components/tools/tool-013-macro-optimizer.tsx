'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateMacros } from '@/lib/tools/engines/tool-013-macro-optimizer';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-013-macro-optimizer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool013MacroOptimizer() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [input, setInput] = useState({
    weight_kg: 85, goal: 'bulk' as 'bulk' | 'cut' | 'maintain',
    protein_per_kg: 2.0, fats_per_kg: 0.8,
    activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    meals_per_day: 4,
  });

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.macro_targets) setResult(savedState.macro_targets);
  }, [savedState]);

  const calculate = () => {
    const r = calculateMacros(input);
    setResult(r);
    debouncedSave({ ...savedState, macro_targets: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Weight (kg):</label> <input type="number" value={input.weight_kg} onChange={(e) => setInput({...input, weight_kg: parseFloat(e.target.value as any)})} min="30" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Goal:</label> <select value={input.goal} onChange={(e) => setInput({...input, goal: e.target.value as any})} className="w-full rounded border p-2" dir="ltr"><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="maintain">Maintain</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Protein per kg:</label> <input type="number" value={input.protein_per_kg} onChange={(e) => setInput({...input, protein_per_kg: parseFloat(e.target.value as any)})} min="1" max="5" step="0.1" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Fats per kg:</label> <input type="number" value={input.fats_per_kg} onChange={(e) => setInput({...input, fats_per_kg: parseFloat(e.target.value as any)})} min="0.5" max="2" step="0.1" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Activity Level:</label> <select value={input.activity_level} onChange={(e) => setInput({...input, activity_level: e.target.value as any})} className="w-full rounded border p-2" dir="ltr"><option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very_active">Very Active</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Meals per Day:</label> <input type="number" value={input.meals_per_day} onChange={(e) => setInput({...input, meals_per_day: parseInt(e.target.value as any)})} min="1" max="8" className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Calculate Macros'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr"><p className="text-zinc-600 font-bold">Protein: {result.protein_g}g/day ({result.protein_per_meal}g/meal)</p><p className="text-zinc-500">Fats: {result.fats_g}g/day</p><p className="text-zinc-500">Carbs: {result.carbs_g}g/day</p><p className="text-zinc-500">Calories: {result.total_calories} kcal</p></div>}
      </div>
    </div>
  );
}
