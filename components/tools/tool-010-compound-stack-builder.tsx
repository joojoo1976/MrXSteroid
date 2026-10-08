'use client';

import React, { useState } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import type { StackCompound } from '@/lib/tools/schemas/tool-010-compound-stack-builder';
import i18nJson from '@/i18n/tool-010-compound-stack-builder.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

function synergyOf(compounds: StackCompound[]): { rating: 'negative' | 'neutral' | 'positive'; score: number; tips: string[] } {
  let score = 0;
  const tips: string[] = [];
  if (compounds.length === 0) return { rating: 'neutral', score: 0, tips: ['Add compounds to evaluate synergy.'] };
  const families = new Set(compounds.map((c) => c.family));
  if (families.size < compounds.length) {
    score -= 20;
    tips.push('Duplicate families detected — overlap increases suppression without proportional benefit.');
  } else {
    score += 10;
  }
  const avgArom = compounds.reduce((s, c) => s + c.aromatization_factor, 0) / compounds.length;
  if (avgArom > 0.6) {
    score -= 10;
    tips.push('High average aromatization — plan AI support and E2 monitoring.');
  }
  const mass = compounds.filter((c) => c.primary_effect === 'mass').length;
  const cutting = compounds.filter((c) => c.primary_effect === 'cutting').length;
  if (mass > 0 && cutting > 0) {
    score -= 10;
    tips.push('Mixed mass + cutting goals in one stack — pick a primary goal.');
  } else {
    score += 10;
  }
  if (tips.length === 0) tips.push('Stack looks coherent — keep testosterone as the base and monitor bloodwork.');
  return { rating: score < 0 ? 'negative' : score > 10 ? 'positive' : 'neutral', score, tips };
}

export default function Tool010CompoundStackBuilder() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [name, setName] = useState('My Stack');
  const [compounds, setCompounds] = useState<StackCompound[]>([]);
  const [family, setFamily] = useState('testosterone');
  const [weeklyDose, setWeeklyDose] = useState(300);
  const [weeks, setWeeks] = useState(10);

  const addCompound = () => {
    const c: StackCompound = {
      id: Date.now(),
      name_en: family,
      name_ar: family,
      family,
      weekly_dose_mg: weeklyDose,
      duration_weeks: weeks,
      synergy_score: 0,
      primary_effect: 'mass',
      aromatization_factor: family === 'testosterone' ? 1 : 0.3,
    };
    const next = [...compounds, c];
    setCompounds(next);
    debouncedSave({ ...savedState, stack_builder: { name, compounds: next } });
  };

  const { rating, score, tips } = synergyOf(compounds);
  const totalWeekly = compounds.reduce((s, c) => s + c.weekly_dose_mg, 0);

  return (
    <div className="pct-timing-tool p-6" dir="ltr">
      <h2 className="text-2xl font-bold mb-6">{i18nData.en.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Stack name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value as any)} className="w-full rounded border p-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Family:</label>
            <input type="text" value={family} onChange={(e) => setFamily(e.target.value as any)} className="w-full rounded border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">mg/week:</label>
            <input type="number" value={weeklyDose} onChange={(e) => setWeeklyDose(parseInt(e.target.value as any) || 0)} min="0" max="2000" className="w-full rounded border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Weeks:</label>
            <input type="number" value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value as any) || 1)} min="1" max="52" className="w-full rounded border p-2" />
          </div>
        </div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}>
          {i18nData.en.build_stack}
        </button>
        <div className="mt-6 p-4 rounded bg-zinc-50">
          <p className="font-bold">{i18nData.en.stack}: {name} — {compounds.length} compounds, {totalWeekly} mg/week</p>
          <p className="text-sm text-zinc-600">{i18nData.en.synergy}: {rating} ({score})</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}