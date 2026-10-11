'use client';

/**
 * components/tools/tool-059-androgen-receptor.tsx
 * Tool #059 — Androgen Receptor Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessAndrogenReceptor,
  type AndrogenReceptorInput,
} from '@/lib/tools/engines/tool-059-androgen-receptor';
import i18nJson from '@/i18n/tool-059-androgen-receptor.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: AndrogenReceptorInput = {
  age: 35,
  sleep_hours: 7.5,
  resistance_training_days: 4,
  body_fat_pct: 18,
  protein_g_per_kg: 1.8,
  stress_level: 4,
  vitamin_d_ng_ml: 35,
  ar_cag_repeats: 21,
};

export default function Tool059AndrogenReceptor() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<AndrogenReceptorInput>(initial);
  const set = <K extends keyof AndrogenReceptorInput>(k: K, v: AndrogenReceptorInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessAndrogenReceptor(input), [input]);

  const numField = (key: keyof AndrogenReceptorInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as AndrogenReceptorInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="androgen-receptor-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {numField('resistance_training_days', t.resistance_training_days, 0, 7)}
        {numField('body_fat_pct', t.body_fat_pct, 3, 60, 0.5)}
        {numField('protein_g_per_kg', t.protein_g_per_kg, 0, 4, 0.1)}
        {numField('stress_level', t.stress_level, 1, 10)}
        {numField('vitamin_d_ng_ml', t.vitamin_d_ng_ml, 0, 120)}
        {numField('ar_cag_repeats', t.ar_cag_repeats, 9, 40)}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.ar_sensitivity_index}</span><span dir="ltr" className="font-mono">{result.ar_sensitivity_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

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
