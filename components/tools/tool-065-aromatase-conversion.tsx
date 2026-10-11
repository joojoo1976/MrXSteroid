'use client';

/**
 * components/tools/tool-065-aromatase-conversion.tsx
 * Tool #065 — Aromatase Conversion Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessAromatase,
  type AromataseInput,
} from '@/lib/tools/engines/tool-065-aromatase-conversion';
import i18nJson from '@/i18n/tool-065-aromatase-conversion.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: AromataseInput = {
  body_fat_pct: 18,
  age: 35,
  total_testosterone_ng_dl: 600,
  estradiol_pg_ml: 25,
};

export default function Tool065AromataseConversion() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<AromataseInput>(initial);
  const set = <K extends keyof AromataseInput>(k: K, v: AromataseInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessAromatase(input), [input]);

  const numField = (key: keyof AromataseInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as AromataseInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="aromatase-conversion-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('body_fat_pct', t.body_fat_pct, 3, 60, 0.5)}
        {numField('age', t.age, 16, 100)}
        {numField('total_testosterone_ng_dl', t.total_testosterone_ng_dl, 0, 3000)}
        {numField('estradiol_pg_ml', t.estradiol_pg_ml, 0, 500)}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.aromatization_index}</span><span dir="ltr" className="font-mono">{result.aromatization_index}</span></div>
        <div className="flex justify-between"><span>{t.e2_t_ratio}</span><span dir="ltr" className="font-mono">{result.e2_t_ratio}</span></div>
        <div className="flex justify-between"><span>{t.ratio_band}</span><strong>{t[`ratio_${result.ratio_band}`] ?? result.ratio_band}</strong></div>
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
