'use client';

/**
 * components/tools/tool-070-oxidative-stress.tsx
 * Tool #070 — Oxidative Stress (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessOxidativeStress,
  type OxidativeStressInput,
} from '@/lib/tools/engines/tool-070-oxidative-stress';
import i18nJson from '@/i18n/tool-070-oxidative-stress.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: OxidativeStressInput = {
  age: 40,
  cigarettes_per_day: 0,
  alcohol_units_week: 4,
  exercise_days: 3,
  sleep_hours: 7,
  produce_servings: 4,
  processed_food_servings: 2,
  stress_level: 5,
  pollution_exposure: false,
  excessive_uv: false,
};

export default function Tool070OxidativeStress() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<OxidativeStressInput>(initial);
  const set = <K extends keyof OxidativeStressInput>(k: K, v: OxidativeStressInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessOxidativeStress(input), [input]);

  const numField = (key: keyof OxidativeStressInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as OxidativeStressInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="oxidative-stress-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('cigarettes_per_day', t.cigarettes_per_day, 0, 60)}
        {numField('alcohol_units_week', t.alcohol_units_week, 0, 80)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('produce_servings', t.produce_servings, 0, 15)}
        {numField('processed_food_servings', t.processed_food_servings, 0, 15)}
        {numField('stress_level', t.stress_level, 1, 10)}
        {(['pollution_exposure', 'excessive_uv'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.oxidative_stress_index}</span><span dir="ltr" className="font-mono">{result.oxidative_stress_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.clinical_review_advised && (
        <div role="alert" className="mt-4 rounded border border-amber-500 bg-amber-50 p-3 text-amber-900 text-sm">
          {t.clinical_review_notice}
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
