'use client';

/**
 * components/tools/tool-076-blood-viscosity.tsx
 * Tool #076 — Blood Viscosity (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessViscosity,
  type ViscosityInput,
} from '@/lib/tools/engines/tool-076-blood-viscosity';
import i18nJson from '@/i18n/tool-076-blood-viscosity.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: ViscosityInput = {
  age: 45,
  sex: 'male',
  hematocrit_pct: 46,
  water_liters: 2.2,
  ldl_mg_dl: 120,
  triglycerides_mg_dl: 140,
  fibrinogen_mg_dl: null,
  smoker: false,
};

export default function Tool076BloodViscosity() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<ViscosityInput>(initial);
  const set = <K extends keyof ViscosityInput>(k: K, v: ViscosityInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessViscosity(input), [input]);

  const numField = (key: keyof ViscosityInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as ViscosityInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="blood-viscosity-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.sex}</span>
          <select dir="ltr" value={input.sex} onChange={(e) => set('sex', e.target.value as 'male' | 'female')} className="w-full rounded border p-2">
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
        </label>
        {numField('hematocrit_pct', t.hematocrit_pct, 20, 70)}
        {numField('water_liters', t.water_liters, 0, 6, 0.1)}
        {numField('ldl_mg_dl', t.ldl_mg_dl, 30, 400)}
        {numField('triglycerides_mg_dl', t.triglycerides_mg_dl, 20, 1000)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.fibrinogen_mg_dl}</span>
          <input
            type="number"
            dir="ltr"
            min={50}
            value={input.fibrinogen_mg_dl ?? ''}
            onChange={(e) => set('fibrinogen_mg_dl', e.target.value === '' ? null : Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.smoker} onChange={(e) => set('smoker', e.target.checked)} />
          <span className="text-sm font-medium">{t.smoker}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.viscosity_index}</span><span dir="ltr" className="font-mono">{result.viscosity_index}</span></div>
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
