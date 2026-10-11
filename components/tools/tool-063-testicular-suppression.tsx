'use client';

/**
 * components/tools/tool-063-testicular-suppression.tsx
 * Tool #063 — Testicular Suppression Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessTesticularSuppression,
  type SuppressionExposure,
  type TesticularSuppressionInput,
} from '@/lib/tools/engines/tool-063-testicular-suppression';
import i18nJson from '@/i18n/tool-063-testicular-suppression.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: TesticularSuppressionInput = {
  baseline_volume_ml: 20,
  exposure_weeks: 12,
  exposure: 'exogenous_androgen',
  fertility_intent: false,
  testicular_pain: false,
  age: 30,
};

const EXPOSURES: SuppressionExposure[] = ['none', 'exogenous_androgen', 'serm', 'hcg', 'mixed'];

export default function Tool063TesticularSuppression() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<TesticularSuppressionInput>(initial);
  const set = <K extends keyof TesticularSuppressionInput>(k: K, v: TesticularSuppressionInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessTesticularSuppression(input), [input]);

  const numField = (key: keyof TesticularSuppressionInput, label: string, min: number, max: number) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as TesticularSuppressionInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="testicular-suppression-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('baseline_volume_ml', t.baseline_volume_ml, 3, 40)}
        {numField('exposure_weeks', t.exposure_weeks, 0, 520)}
        {numField('age', t.age, 16, 100)}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.exposure}</span>
          <select
            dir="ltr"
            value={input.exposure}
            onChange={(e) => set('exposure', e.target.value as SuppressionExposure)}
            className="w-full rounded border p-2"
          >
            {EXPOSURES.map((x) => <option key={x} value={x}>{t[x]}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.fertility_intent} onChange={(e) => set('fertility_intent', e.target.checked)} />
          <span className="text-sm font-medium">{t.fertility_intent}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.testicular_pain} onChange={(e) => set('testicular_pain', e.target.checked)} />
          <span className="text-sm font-medium">{t.testicular_pain}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.suppression_index}</span><span dir="ltr" className="font-mono">{result.suppression_index}</span></div>
        <div className="flex justify-between"><span>{t.estimated_volume_ml}</span><span dir="ltr" className="font-mono">{result.estimated_volume_ml}</span></div>
        <div className="flex justify-between"><span>{t.volume_retention_fraction}</span><span dir="ltr" className="font-mono">{result.volume_retention_fraction}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      {result.clinical_referral_advised && (
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
