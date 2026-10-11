'use client';

/**
 * components/tools/tool-069-detox-optimizer.tsx
 * Tool #069 — Detoxification Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessDetoxSupport,
  type DetoxInput,
  type Sex,
} from '@/lib/tools/engines/tool-069-detox-optimizer';
import i18nJson from '@/i18n/tool-069-detox-optimizer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: DetoxInput = {
  age: 40,
  sex: 'male',
  water_liters: 2.2,
  fiber_g: 25,
  alcohol_units_week: 4,
  sleep_hours: 7,
  exercise_days: 3,
  diet_quality: 3,
  produce_servings: 4,
  smoker: false,
  liver_condition: false,
  kidney_condition: false,
};

export default function Tool069DetoxOptimizer() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<DetoxInput>(initial);
  const set = <K extends keyof DetoxInput>(k: K, v: DetoxInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessDetoxSupport(input), [input]);

  const numField = (key: keyof DetoxInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as DetoxInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="detox-optimizer-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.sex}</span>
          <select dir="ltr" value={input.sex} onChange={(e) => set('sex', e.target.value as Sex)} className="w-full rounded border p-2">
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
        {numField('water_liters', t.water_liters, 0, 6, 0.1)}
        {numField('fiber_g', t.fiber_g, 0, 80)}
        {numField('alcohol_units_week', t.alcohol_units_week, 0, 80)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('diet_quality', t.diet_quality, 1, 5)}
        {numField('produce_servings', t.produce_servings, 0, 15)}
        {(['smoker', 'liver_condition', 'kidney_condition'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.clearance_support_index}</span><span dir="ltr" className="font-mono">{result.clearance_support_index}</span></div>
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
