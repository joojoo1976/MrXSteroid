'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateTDEE } from '@/lib/tools/engines/tool-012-calorie-adjuster';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-012-calorie-adjuster.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool012CalorieAdjuster() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [input, setInput] = useState({
    age: 25, gender: 'male' as 'male' | 'female',
    height_cm: 180, height_in: 0,
    current_weight_kg: 85, current_weight_lbs: 0,
    activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'bulk' as 'bulk' | 'cut' | 'maintain',
    weeks_per_phase: 8,
  });

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.calorie_target) setResult(savedState.calorie_target);
  }, [savedState]);

  const calculate = () => {
    const r = calculateTDEE(input);
    setResult(r);
    debouncedSave({ ...savedState, calorie_target: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={input.age} onChange={(e) => setInput({...input, age: parseInt(e.target.value as any)})} min="14" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Gender:</label> <select value={input.gender} onChange={(e) => setInput({...input, gender: e.target.value as any})} className="w-full rounded border p-2" dir="ltr"><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Weight (kg):</label> <input type="number" value={input.current_weight_kg} onChange={(e) => setInput({...input, current_weight_kg: parseFloat(e.target.value as any)})} min="30" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Activity Level:</label> <select value={input.activity_level} onChange={(e) => setInput({...input, activity_level: e.target.value as any})} className="w-full rounded border p-2" dir="ltr"><option value="sedentary">Sedentary</option><option value="light">Light</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="very_active">Very Active</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Goal:</label> <select value={input.goal} onChange={(e) => setInput({...input, goal: e.target.value as any})} className="w-full rounded border p-2" dir="ltr"><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="maintain">Maintain</option></select></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Calculate Target'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr"><p className="text-zinc-600 font-bold">TDEE: {result.tdee} kcal/day</p><p className="text-zinc-500">Target: {result.target_calories} kcal/day</p></div>}
      </div>
    </div>
  );
}
