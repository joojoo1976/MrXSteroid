'use client';

/**
 * components/tools/tool-080-mitochondrial-optimizer.tsx
 * Tool #080 — Mitochondrial Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessMitochondrialHealth,
  type MitochondrialInput,
} from '@/lib/tools/engines/tool-080-mitochondrial-optimizer';
import i18nJson from '@/i18n/tool-080-mitochondrial-optimizer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: MitochondrialInput = {
  age: 40,
  exercise_days: 3,
  sleep_hours: 7,
  diet_diversity: 3,
  cold_exposure_days: 1,
  heat_exposure_days: 1,
  stress_level: 5,
  smoker: false,
  cardiovascular_disease: false,
};

export default function Tool080MitochondrialOptimizer() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<MitochondrialInput>(initial);
  const set = <K extends keyof MitochondrialInput>(k: K, v: MitochondrialInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessMitochondrialHealth(input), [input]);

  const numField = (key: keyof MitochondrialInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as MitochondrialInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="mitochondrial-optimizer-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('diet_diversity', t.diet_diversity, 1, 5)}
        {numField('cold_exposure_days', t.cold_exposure_days, 0, 7)}
        {numField('heat_exposure_days', t.heat_exposure_days, 0, 7)}
        {numField('stress_level', t.stress_level, 1, 10)}
        {(['smoker', 'cardiovascular_disease'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.mitochondrial_health_index}</span><span dir="ltr" className="font-mono">{result.mitochondrial_health_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

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
