'use client';

/**
 * components/tools/tool-079-fat-metabolism.tsx
 * Tool #079 — Fat Metabolism (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessFatMetabolism,
  type FatMetabolismInput,
} from '@/lib/tools/engines/tool-079-fat-metabolism';
import i18nJson from '@/i18n/tool-079-fat-metabolism.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: FatMetabolismInput = {
  age: 40,
  cardio_days: 3,
  resistance_days: 3,
  daily_steps: 8000,
  carb_grams: 250,
  protein_adequacy: 3,
  body_fat_pct: 22,
  fasting_hours: 12,
};

export default function Tool079FatMetabolism() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<FatMetabolismInput>(initial);
  const set = <K extends keyof FatMetabolismInput>(k: K, v: FatMetabolismInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessFatMetabolism(input), [input]);

  const numField = (key: keyof FatMetabolismInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as FatMetabolismInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="fat-metabolism-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('cardio_days', t.cardio_days, 0, 7)}
        {numField('resistance_days', t.resistance_days, 0, 7)}
        {numField('daily_steps', t.daily_steps, 0, 40000)}
        {numField('carb_grams', t.carb_grams, 0, 800)}
        {numField('protein_adequacy', t.protein_adequacy, 1, 5)}
        {numField('body_fat_pct', t.body_fat_pct, 3, 60, 0.5)}
        {numField('fasting_hours', t.fasting_hours, 0, 24)}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.fat_oxidation_index}</span><span dir="ltr" className="font-mono">{result.fat_oxidation_index}</span></div>
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
