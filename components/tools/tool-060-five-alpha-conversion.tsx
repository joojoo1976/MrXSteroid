'use client';

/**
 * components/tools/tool-060-five-alpha-conversion.tsx
 * Tool #060 — 5-Alpha Conversion Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessFiveAlphaConversion,
  type FiveAlphaInput,
} from '@/lib/tools/engines/tool-060-five-alpha-conversion';
import i18nJson from '@/i18n/tool-060-five-alpha-conversion.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: FiveAlphaInput = {
  total_testosterone_ng_dl: 600,
  age: 35,
  body_fat_pct: 18,
  scalp_sensitivity: 5,
  mpb_family_history: false,
  sebum_activity: 1,
};

export default function Tool060FiveAlphaConversion() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<FiveAlphaInput>(initial);
  const set = <K extends keyof FiveAlphaInput>(k: K, v: FiveAlphaInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessFiveAlphaConversion(input), [input]);

  const numField = (key: keyof FiveAlphaInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as FiveAlphaInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="five-alpha-conversion-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('total_testosterone_ng_dl', t.total_testosterone_ng_dl, 0, 3000)}
        {numField('age', t.age, 16, 100)}
        {numField('body_fat_pct', t.body_fat_pct, 3, 60, 0.5)}
        {numField('scalp_sensitivity', t.scalp_sensitivity, 1, 10)}
        {numField('sebum_activity', t.sebum_activity, 0, 3)}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.mpb_family_history} onChange={(e) => set('mpb_family_history', e.target.checked)} />
          <span className="text-sm font-medium">{t.mpb_family_history}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.five_ar_activity_index}</span><span dir="ltr" className="font-mono">{result.five_ar_activity_index}</span></div>
        <div className="flex justify-between"><span>{t.dht_conversion_fraction_pct}</span><span dir="ltr" className="font-mono">{result.dht_conversion_fraction_pct}</span></div>
        <div className="flex justify-between"><span>{t.estimated_dht_ng_dl}</span><span dir="ltr" className="font-mono">{result.estimated_dht_ng_dl}</span></div>
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
