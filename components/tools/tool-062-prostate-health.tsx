'use client';

/**
 * components/tools/tool-062-prostate-health.tsx
 * Tool #062 — Prostate Health Manager (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessProstateHealth,
  type ProstateInput,
} from '@/lib/tools/engines/tool-062-prostate-health';
import i18nJson from '@/i18n/tool-062-prostate-health.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: ProstateInput = {
  incomplete_emptying: 1,
  frequency: 2,
  intermittency: 1,
  urgency: 1,
  weak_stream: 1,
  straining: 0,
  nocturia: 2,
  quality_of_life: 2,
  acute_retention: false,
  hematuria: false,
  fever_pelvic_pain: false,
};

const IPSS_KEYS = [
  'incomplete_emptying',
  'frequency',
  'intermittency',
  'urgency',
  'weak_stream',
  'straining',
  'nocturia',
] as const;

export default function Tool062ProstateHealth() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<ProstateInput>(initial);
  const set = <K extends keyof ProstateInput>(k: K, v: ProstateInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessProstateHealth(input), [input]);

  return (
    <div className="prostate-health-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IPSS_KEYS.map((k) => (
          <label key={k} className="block">
            <span className="block text-sm font-medium mb-1">{t[k]}</span>
            <input
              type="number"
              dir="ltr"
              min={0}
              max={5}
              value={input[k]}
              onChange={(e) => set(k, Number(e.target.value) as ProstateInput[typeof k])}
              className="w-full rounded border p-2"
            />
          </label>
        ))}
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.quality_of_life}</span>
          <input
            type="number"
            dir="ltr"
            min={0}
            max={6}
            value={input.quality_of_life}
            onChange={(e) => set('quality_of_life', Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
        {(['acute_retention', 'hematuria', 'fever_pelvic_pain'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.ipss_total}</span><span dir="ltr" className="font-mono">{result.ipss_total}</span></div>
        <div className="flex justify-between"><span>{t.severity}</span><strong>{t[result.severity] ?? result.severity}</strong></div>
        <div className="flex justify-between"><span>{t.qol}</span><span dir="ltr" className="font-mono">{result.quality_of_life}</span></div>
      </div>

      {result.emergency && (
        <div role="alert" className="mt-4 rounded border border-red-500 bg-red-50 p-3 text-red-900 text-sm">
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
