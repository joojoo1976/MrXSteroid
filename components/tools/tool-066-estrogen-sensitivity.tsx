'use client';

/**
 * components/tools/tool-066-estrogen-sensitivity.tsx
 * Tool #066 — Estrogen Sensitivity Manager (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessEstrogenSensitivity,
  type EstrogenSensitivityInput,
} from '@/lib/tools/engines/tool-066-estrogen-sensitivity';
import i18nJson from '@/i18n/tool-066-estrogen-sensitivity.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: EstrogenSensitivityInput = {
  water_retention: 0,
  nipple_sensitivity: 0,
  mood_swings: 1,
  libido_change: 0,
  bloating: 0,
  joint_aches: 0,
  estradiol_pg_ml: 25,
  body_fat_pct: 18,
  painful_breast_changes: false,
};

const SYMPTOMS = [
  'water_retention',
  'nipple_sensitivity',
  'mood_swings',
  'libido_change',
  'bloating',
  'joint_aches',
] as const;

export default function Tool066EstrogenSensitivity() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<EstrogenSensitivityInput>(initial);
  const set = <K extends keyof EstrogenSensitivityInput>(k: K, v: EstrogenSensitivityInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessEstrogenSensitivity(input), [input]);

  return (
    <div className="estrogen-sensitivity-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SYMPTOMS.map((k) => (
          <label key={k} className="block">
            <span className="block text-sm font-medium mb-1">{t[k]}</span>
            <input
              type="number"
              dir="ltr"
              min={0}
              max={3}
              value={input[k]}
              onChange={(e) => set(k, Number(e.target.value) as EstrogenSensitivityInput[typeof k])}
              className="w-full rounded border p-2"
            />
          </label>
        ))}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.estradiol_pg_ml}</span>
          <input
            type="number"
            dir="ltr"
            min={0}
            max={500}
            value={input.estradiol_pg_ml}
            onChange={(e) => set('estradiol_pg_ml', Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.body_fat_pct}</span>
          <input
            type="number"
            dir="ltr"
            min={3}
            max={60}
            step={0.5}
            value={input.body_fat_pct}
            onChange={(e) => set('body_fat_pct', Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.painful_breast_changes} onChange={(e) => set('painful_breast_changes', e.target.checked)} />
          <span className="text-sm font-medium">{t.painful_breast_changes}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.estrogen_sensitivity_index}</span><span dir="ltr" className="font-mono">{result.estrogen_sensitivity_index}</span></div>
        <div className="flex justify-between"><span>{t.symptom_burden}</span><span dir="ltr" className="font-mono">{result.symptom_burden}</span></div>
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
        <h3 className="font-bold mb-2">{t.education}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.education.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
