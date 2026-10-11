'use client';

/**
 * components/tools/tool-078-endothelial-health.tsx
 * Tool #078 — Endothelial Health Manager (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessEndothelialHealth,
  type EndothelialInput,
} from '@/lib/tools/engines/tool-078-endothelial-health';
import i18nJson from '@/i18n/tool-078-endothelial-health.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: EndothelialInput = {
  age: 45,
  systolic: 126,
  diastolic: 80,
  ldl_mg_dl: 120,
  hdl_mg_dl: 50,
  fasting_glucose_mg_dl: 96,
  hba1c_pct: null,
  exercise_days: 3,
  sleep_hours: 7,
  smoker: false,
};

export default function Tool078EndothelialHealth() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<EndothelialInput>(initial);
  const set = <K extends keyof EndothelialInput>(k: K, v: EndothelialInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessEndothelialHealth(input), [input]);

  const numField = (key: keyof EndothelialInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as EndothelialInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="endothelial-health-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('systolic', t.systolic, 40, 320)}
        {numField('diastolic', t.diastolic, 20, 220)}
        {numField('ldl_mg_dl', t.ldl_mg_dl, 30, 400)}
        {numField('hdl_mg_dl', t.hdl_mg_dl, 10, 120)}
        {numField('fasting_glucose_mg_dl', t.fasting_glucose_mg_dl, 40, 500)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.hba1c_pct}</span>
          <input
            type="number"
            dir="ltr"
            min={3}
            step={0.1}
            value={input.hba1c_pct ?? ''}
            onChange={(e) => set('hba1c_pct', e.target.value === '' ? null : Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.smoker} onChange={(e) => set('smoker', e.target.checked)} />
          <span className="text-sm font-medium">{t.smoker}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.endothelial_function_index}</span><span dir="ltr" className="font-mono">{result.endothelial_function_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.urgent_review_advised && (
        <div role="alert" className="mt-4 rounded border border-red-600 bg-red-50 p-3 text-red-900 text-sm font-medium">
          {t.urgent_notice}
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
