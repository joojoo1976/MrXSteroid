'use client';

/**
 * components/tools/tool-075-arterial-health.tsx
 * Tool #075 — Arterial Health Manager (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessArterialHealth,
  type ArterialInput,
} from '@/lib/tools/engines/tool-075-arterial-health';
import i18nJson from '@/i18n/tool-075-arterial-health.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: ArterialInput = {
  age: 45,
  systolic: 126,
  diastolic: 80,
  ldl_mg_dl: 120,
  hdl_mg_dl: 50,
  triglycerides_mg_dl: 140,
  exercise_days: 3,
  smoker: false,
  diabetes: false,
  family_history_cvd: false,
};

export default function Tool075ArterialHealth() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<ArterialInput>(initial);
  const set = <K extends keyof ArterialInput>(k: K, v: ArterialInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessArterialHealth(input), [input]);

  const numField = (key: keyof ArterialInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as ArterialInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="arterial-health-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('systolic', t.systolic, 40, 320)}
        {numField('diastolic', t.diastolic, 20, 220)}
        {numField('ldl_mg_dl', t.ldl_mg_dl, 30, 400)}
        {numField('hdl_mg_dl', t.hdl_mg_dl, 10, 120)}
        {numField('triglycerides_mg_dl', t.triglycerides_mg_dl, 20, 1000)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {(['smoker', 'diabetes', 'family_history_cvd'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.arterial_health_index}</span><span dir="ltr" className="font-mono">{result.arterial_health_index}</span></div>
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
