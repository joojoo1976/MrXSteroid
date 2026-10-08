'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculatePeptideProtocol } from '@/lib/tools/engines/tool-021-peptide-protocol';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-021-peptide-protocol.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool021PeptideProtocolPlanner() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [userWeight, setUserWeight] = useState(85);
  const [goal, setGoal] = useState('recovery' as 'recovery' | 'muscle_growth' | 'fat_loss' | 'anti_aging');
  const [protocolDuration, setProtocolDuration] = useState(8);
  const [injectionFrequency, setInjectionFrequency] = useState('every-other-day' as 'daily' | 'every-other-day' | '3x-week' | 'weekly');
  const [selectedCompounds, setSelectedCompounds] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.peptide_result) setResult(savedState.peptide_result);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: any = {
      id: Date.now(),
      name_en: 'BPC-157',
      name_ar: 'BPC-157',
      category: 'bpc-157' as 'hgh' | 'igf-1' | 'bpc-157' | 'tb-500' | 'cjc-1295' | 'other',
      concentration_mg_ml: 2,
      default_dose_mcg_kg: 0.01,
      half_life_hours: 4,
      administration: 'subcutaneous',
      description_text: 'Body protection compound',
    };
    setSelectedCompounds(prev => [...prev, newCompound]);
  };

  const calculate = () => {
    const input = {
      user_weight_kg: userWeight,
      target_compounds: selectedCompounds,
      goal: goal,
      protocol_duration_weeks: protocolDuration,
      injection_frequency: injectionFrequency,
    };
    const r = calculatePeptideProtocol(input);
    setResult(r);
    debouncedSave({ ...savedState, peptide_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">User Weight (kg):</label> <input type="number" value={userWeight} onChange={(e) => setUserWeight(parseInt(e.target.value as any))} min="40" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Goal:</label> <select value={goal} onChange={(e) => setGoal(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="recovery">Recovery</option><option value="muscle_growth">Muscle Growth</option><option value="fat_loss">Fat Loss</option><option value="anti_aging">Anti-Aging</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Protocol Duration (weeks):</label> <input type="number" value={protocolDuration} onChange={(e) => setProtocolDuration(parseInt(e.target.value as any))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Injection Frequency:</label> <select value={injectionFrequency} onChange={(e) => setInjectionFrequency(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="daily">Daily</option><option value="every-other-day">Every Other Day</option><option value="3x-week">3x Per Week</option><option value="weekly">Weekly</option></select></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Peptide Compound </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || selectedCompounds.length === 0}> {isPending ? 'Calculating...' : 'Calculate Protocol'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.daily_dose_mcg}: {result.daily_dose_mcg}mcg</p>
          <p className="text-zinc-500">{i18nData.total_cycle_dose_mg}: {result.total_cycle_dose_mg}mg</p>
          <p className="text-zinc-500">{i18nData.injection_frequency_days}: every {result.injection_frequency_days} day(s)</p>
          <p className="text-zinc-500">{i18nData.total_injections}: {result.total_injections} total</p>
          <p className="text-zinc-500">{i18nData.protocol_weeks}: {result.protocol_weeks} weeks</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.timing_recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.storage_requirements.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.side_effect_warnings.map((w: any, i: any) => <li key={i}>{w}</li>)}
          </ul>
          <p className="text-zinc-500 mt-2">{i18nData.post_protocol_therapy ? 'Post-protocol therapy recommended' : 'No post-protocol therapy required'}</p>
        </div>}
      </div>
    </div>
  );
}

