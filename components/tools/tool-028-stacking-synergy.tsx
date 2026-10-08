'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateStackingSynergy } from '@/lib/tools/engines/tool-028-stacking-synergy';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-028-stacking-synergy.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool028CompoundStackingSynergy() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [goal, setGoal] = useState('bulk' as 'bulk' | 'cut' | 'recomp' | 'strength');
  const [experience, setExperience] = useState('intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'pro');
  const [compounds, setCompounds] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.stacking_synergy_result) setResult(savedState.stacking_synergy_result);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: any = {
      id: Date.now(),
      name_en: 'Testosterone',
      name_ar: 'اختبارون',
      family: 'testosterone',
      anabolic_score: 100,
      androgenic_score: 100,
      primary_action: 'mass',
      liver_toxicity: 'low',
      estrogenic: 'moderate',
      description_text: 'Testosterone base',
    };
    setCompounds(prev => [...prev, newCompound]);
  };

  const analyze = () => {
    const input = {
      compounds,
      goal: goal,
      user_experience: experience,
    };
    const r = calculateStackingSynergy(input);
    setResult(r);
    debouncedSave({ ...savedState, stacking_synergy_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Goal:</label> <select value={goal} onChange={(e) => setGoal(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="recomp">Recomp</option><option value="strength">Strength</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Experience:</label> <select value={experience} onChange={(e) => setExperience(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="pro">Pro</option></select></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Compound </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={analyze} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || compounds.length < 2}> {isPending ? 'Analyzing...' : 'Calculate Synergy'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.synergy_score}: {result.synergy_score}/100</p>
          <p className="text-zinc-500">{i18nData.overall_assessment}: {result.overall_assessment}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.compound_pair_interactions.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommended_additions.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.avoided_pairs.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.protocol_tips.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <p className="text-zinc-500 mt-2">{i18nData.best_for_goal}: {result.best_for_goal}</p>
        </div>}
      </div>
    </div>
  );
}

