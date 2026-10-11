'use client';

/**
 * components/tools/tool-073-immune-optimizer.tsx
 * Tool #073 — Immune System Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessImmuneSupport,
  type ImmuneInput,
} from '@/lib/tools/engines/tool-073-immune-optimizer';
import i18nJson from '@/i18n/tool-073-immune-optimizer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: ImmuneInput = {
  age: 40,
  sleep_hours: 7,
  protein_adequacy: 3,
  produce_servings: 4,
  exercise_days: 3,
  stress_level: 5,
  alcohol_units_week: 4,
  smoker: false,
  vitamin_d_deficiency: false,
  recurrent_infections: false,
  fever_breathing_difficulty: false,
};

export default function Tool073ImmuneOptimizer() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<ImmuneInput>(initial);
  const set = <K extends keyof ImmuneInput>(k: K, v: ImmuneInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessImmuneSupport(input), [input]);

  const numField = (key: keyof ImmuneInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as ImmuneInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="immune-optimizer-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('protein_adequacy', t.protein_adequacy, 1, 5)}
        {numField('produce_servings', t.produce_servings, 0, 15)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('stress_level', t.stress_level, 1, 10)}
        {numField('alcohol_units_week', t.alcohol_units_week, 0, 80)}
        {(['smoker', 'vitamin_d_deficiency', 'recurrent_infections', 'fever_breathing_difficulty'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.immune_support_index}</span><span dir="ltr" className="font-mono">{result.immune_support_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.emergency && result.emergency_message && (
        <div role="alert" className="mt-4 rounded border border-red-600 bg-red-50 p-3 text-red-900 text-sm font-medium">
          {result.emergency_message}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.contributing_factors}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.recommendations}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
