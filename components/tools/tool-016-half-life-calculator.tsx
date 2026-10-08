'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateHalfLife } from '@/lib/tools/engines/tool-016-half-life-calculator';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-016-half-life-calculator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool016HalfLifeCalculator() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [compounds, setCompounds] = useState<any[]>([]);
  const [bodyFat, setBodyFat] = useState(20);
  const [organHealth, setOrganHealth] = useState('optimal' as 'optimal' | 'normal' | 'compromised');
  const [clearanceThreshold, setClearanceThreshold] = useState(5);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.half_life_result) setResult(savedState.half_life_result);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: any = {
      id: Date.now(),
      name_en: 'Testosterone',
      name_ar: 'اختبارون',
      family: 'testosterone',
      half_life_days: 7,
      is_lipophilic: false,
      bioavailability: 0.95,
      default_dose_mg: 500,
      description_text: 'Testosterone base compound',
    };
    setCompounds(prev => [...prev, newCompound]);
  };

  const calculate = () => {
    const input = {
      compounds,
      body_fat_percentage: bodyFat,
      organ_health: organHealth,
      clearance_threshold: clearanceThreshold,
    };
    const r = calculateHalfLife(input);
    setResult(r);
    debouncedSave({ ...savedState, half_life_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Stack:</label> <p className="text-zinc-500 text-sm" dir="ltr">{compounds.length} compounds</p></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Compound </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <div className="grid grid-cols-2 gap-4 mt-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Body Fat %:</label> <input type="number" value={bodyFat} onChange={(e) => setBodyFat(parseInt(e.target.value as any))} min="5" max="50" className="w-full rounded border p-2" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Organ Health:</label> <select value={organHealth} onChange={(e) => setOrganHealth(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="optimal">Optimal</option><option value="normal">Normal</option><option value="compromised">Compromised</option></select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Clearance Threshold %:</label> <input type="number" value={clearanceThreshold} onChange={(e) => setClearanceThreshold(parseInt(e.target.value as any))} min="1" max="99" className="w-full rounded border p-2" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Launch PCT After:</label> <p className="text-zinc-600 font-medium" dir="ltr">{result?.washout_weeks} weeks</p>
          </div>
        </div>

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || compounds.length === 0}> {isPending ? 'Calculating...' : 'Calculate Clearance'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.total_half_lives}: {result.total_half_lives}</p>
          <p className="text-zinc-500">{i18nData.effective_half_life_days}: {result.effective_half_life_days} days</p>
          <p className="text-zinc-500">{i18nData.washout_days}: {result.washout_days} days ({result.washout_weeks} weeks)</p>
          <p className="text-zinc-500">{i18nData.bottleneck_compound}: {result.bottleneck_compound.name_en}</p>
          <p className="text-zinc-500">{i18nData.confidence_score}: {result.confidence_score}%</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}

