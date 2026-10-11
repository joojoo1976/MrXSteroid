'use client';

/**
 * components/tools/tool-064-sperm-production.tsx
 * Tool #064 — Sperm Production Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessSpermProduction,
  type SpermProductionInput,
} from '@/lib/tools/engines/tool-064-sperm-production';
import i18nJson from '@/i18n/tool-064-sperm-production.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: SpermProductionInput = {
  age: 32,
  bmi: 24,
  sleep_hours: 7.5,
  heat_exposure_hours: 1,
  exercise_days: 4,
  smoker: false,
  alcohol_units: 4,
  stress_level: 4,
  abstinence_days: 3,
  exogenous_androgen: false,
  fertility_intent: false,
};

export default function Tool064SpermProduction() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<SpermProductionInput>(initial);
  const set = <K extends keyof SpermProductionInput>(k: K, v: SpermProductionInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessSpermProduction(input), [input]);

  const numField = (key: keyof SpermProductionInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as SpermProductionInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="sperm-production-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('bmi', t.bmi, 12, 60, 0.1)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('heat_exposure_hours', t.heat_exposure_hours, 0, 40)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('alcohol_units', t.alcohol_units, 0, 100)}
        {numField('stress_level', t.stress_level, 1, 10)}
        {numField('abstinence_days', t.abstinence_days, 0, 30)}
        {(['smoker', 'exogenous_androgen', 'fertility_intent'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.spermatogenesis_index}</span><span dir="ltr" className="font-mono">{result.spermatogenesis_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.clinical_referral_advised && (
        <div role="alert" className="mt-4 rounded border border-amber-500 bg-amber-50 p-3 text-amber-900 text-sm">
          {t.clinical_notice}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.contributing_factors}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.education}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.education.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
