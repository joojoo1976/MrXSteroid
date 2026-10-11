'use client';

/**
 * components/tools/tool-077-nitric-oxide.tsx
 * Tool #077 — Nitric Oxide Optimizer (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessNitricOxide,
  type NitricOxideInput,
} from '@/lib/tools/engines/tool-077-nitric-oxide';
import i18nJson from '@/i18n/tool-077-nitric-oxide.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: NitricOxideInput = {
  age: 40,
  leafy_green_servings: 2,
  beetroot_servings: 1,
  nitrate_rich_veg: false,
  exercise_days: 3,
  sleep_hours: 7,
  arginine_rich_foods: true,
  mouthwash_use: false,
  smoker: false,
  chest_pain: false,
  breathing_difficulty: false,
};

export default function Tool077NitricOxide() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<NitricOxideInput>(initial);
  const set = <K extends keyof NitricOxideInput>(k: K, v: NitricOxideInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessNitricOxide(input), [input]);

  const numField = (key: keyof NitricOxideInput, label: string, min: number, max: number, step = 1) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as NitricOxideInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="nitric-oxide-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('age', t.age, 16, 100)}
        {numField('leafy_green_servings', t.leafy_green_servings, 0, 8)}
        {numField('beetroot_servings', t.beetroot_servings, 0, 14)}
        {numField('exercise_days', t.exercise_days, 0, 7)}
        {numField('sleep_hours', t.sleep_hours, 0, 14, 0.5)}
        {(['nitrate_rich_veg', 'arginine_rich_foods', 'mouthwash_use', 'smoker', 'chest_pain', 'breathing_difficulty'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.no_support_index}</span><span dir="ltr" className="font-mono">{result.no_support_index}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.emergency && result.emergency_message && (
        <div role="alert" className="mt-4 rounded border border-red-600 bg-red-50 p-3 text-red-900 text-sm font-medium">
          {result.emergency_message}
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
