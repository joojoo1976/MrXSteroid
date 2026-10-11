'use client';

/**
 * components/tools/tool-057-free-testosterone.tsx
 * Tool #057 — Free Testosterone Manager (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessFreeTestosterone,
  type FreeTestosteroneInput,
  type Sex,
} from '@/lib/tools/engines/tool-057-free-testosterone';
import i18nJson from '@/i18n/tool-057-free-testosterone.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: FreeTestosteroneInput = {
  total_testosterone_ng_dl: 600,
  shbg_nmol_l: 30,
  albumin_g_l: 43,
  age: 35,
  sex: 'male',
};

export default function Tool057FreeTestosterone() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<FreeTestosteroneInput>(initial);
  const set = <K extends keyof FreeTestosteroneInput>(k: K, v: FreeTestosteroneInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessFreeTestosterone(input), [input]);

  const numField = (key: keyof FreeTestosteroneInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as FreeTestosteroneInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="free-testosterone-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('total_testosterone_ng_dl', t.total_testosterone_ng_dl, 0, 3000)}
        {numField('shbg_nmol_l', t.shbg_nmol_l, 1, 300)}
        {numField('albumin_g_l', t.albumin_g_l, 10, 80)}
        {numField('age', t.age, 16, 100)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.sex}</span>
          <select
            dir="ltr"
            value={input.sex}
            onChange={(e) => set('sex', e.target.value as Sex)}
            className="w-full rounded border p-2"
          >
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.free_testosterone}</span><span dir="ltr" className="font-mono">{result.free_testosterone_ng_dl}</span></div>
        <div className="flex justify-between"><span>{t.free_fraction}</span><span dir="ltr" className="font-mono">{result.free_fraction_pct}</span></div>
        <div className="flex justify-between"><span>{t.bioavailable}</span><span dir="ltr" className="font-mono">{result.bioavailable_ng_dl}</span></div>
        <div className="flex justify-between"><span>{t.shbg_bound}</span><span dir="ltr" className="font-mono">{result.shbg_bound_ng_dl}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.clinical_review_advised && (
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
        <h3 className="font-bold mb-2">{t.recommendations}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
