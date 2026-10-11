'use client';

/**
 * components/tools/tool-072-inflammation-calculator.tsx
 * Tool #072 — Systemic Inflammation Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessInflammation,
  type InflammationInput,
} from '@/lib/tools/engines/tool-072-inflammation-calculator';
import i18nJson from '@/i18n/tool-072-inflammation-calculator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: InflammationInput = {
  hs_crp_mg_l: null,
  esr_mm_hr: null,
  age: 40,
  bmi: 26,
  sleep_hours: 7,
  exercise_days: 3,
  alcohol_units_week: 4,
  produce_servings: 4,
  oily_fish_servings: 1,
  sugar_servings: 2,
  stress_level: 5,
  smoker: false,
};

export default function Tool072InflammationCalculator() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<InflammationInput>(initial);
  const set = <K extends keyof InflammationInput>(k: K, v: InflammationInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessInflammation(input), [input]);

  const numField = (key: keyof InflammationInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as InflammationInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  const optionalField = (key: 'hs_crp_mg_l' | 'esr_mm_hr', label: string) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={0}
        value={input[key] ?? ''}
        onChange={(e) => set(key, e.target.value === '' ? null : Number(e.target.value))}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="inflammation-calculator-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {optionalField('hs_crp_mg_l', t.hs_crp_mg_l)}
        {optionalField('esr_mm_hr', t.esr_mm_hr)}
        {numField('age', t.age, 16, 100)}
        {numField('bmi', t.bmi, 10, 70, 0.1)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('alcohol_units_week', t.alcohol_units_week, 0, 80)}
        {numField('produce_servings', t.produce_servings, 0, 15)}
        {numField('oily_fish_servings', t.oily_fish_servings, 0, 14)}
        {numField('sugar_servings', t.sugar_servings, 0, 20)}
        {numField('stress_level', t.stress_level, 1, 10)}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.smoker} onChange={(e) => set('smoker', e.target.checked)} />
          <span className="text-sm font-medium">{t.smoker}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.inflammation_index}</span><span dir="ltr" className="font-mono">{result.inflammation_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
        <div className="flex justify-between"><span>{t.hs_crp_band}</span><span>{t[result.hs_crp_band] ?? result.hs_crp_band}</span></div>
      </div>

      {result.urgent_review_advised && (
        <div role="alert" className="mt-4 rounded border border-red-500 bg-red-50 p-3 text-red-900 text-sm">
          {t.urgent_notice}
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
