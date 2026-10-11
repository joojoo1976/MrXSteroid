'use client';

/**
 * components/tools/tool-050-mental-health-monitor.tsx
 * Tool #050 — Mental Health Monitor (client UI). Screening aid only.
 * Any suicidal ideation triggers an unmissable crisis banner.
 */
import React, { useMemo, useState } from 'react';
import {
  assessMentalHealth,
  type MentalHealthInput,
} from '@/lib/tools/engines/tool-050-mental-health-monitor';
import i18nJson from '@/i18n/tool-050-mental-health-monitor.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const ITEMS: Array<keyof Omit<MentalHealthInput, 'functional_impairment'>> = [
  'little_interest',
  'feeling_down',
  'sleep_problems',
  'low_energy',
  'appetite_change',
  'low_self_worth',
  'poor_concentration',
  'psychomotor_change',
  'suicidal_ideation',
];

const initial: MentalHealthInput = {
  little_interest: 0,
  feeling_down: 0,
  sleep_problems: 0,
  low_energy: 0,
  appetite_change: 0,
  low_self_worth: 0,
  poor_concentration: 0,
  psychomotor_change: 0,
  suicidal_ideation: 0,
  functional_impairment: false,
};

export default function Tool050MentalHealthMonitor() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<MentalHealthInput>(initial);
  const result = useMemo(() => assessMentalHealth(input), [input]);

  return (
    <div className="mental-health-monitor-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-2">{t.tool_name}</h2>
      <p className="text-sm text-zinc-500 mb-6">{t.intro}</p>

      {result.crisis && (
        <div role="alert" className="mb-6 rounded border-2 border-red-600 bg-red-50 p-4 text-red-800">
          <p className="font-bold">{t.crisis_title}</p>
          <p className="text-sm mt-1">{result.crisis_message}</p>
        </div>
      )}

      <div className="space-y-3">
        {ITEMS.map((k) => (
          <label key={k} className="flex items-center justify-between gap-4">
            <span className="text-sm">{t[k]}</span>
            <select
              dir="ltr"
              value={input[k]}
              onChange={(e) => setInput((p) => ({ ...p, [k]: Number(e.target.value) }))}
              className="rounded border p-2"
            >
              {[0, 1, 2, 3].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={input.functional_impairment}
            onChange={(e) => setInput((p) => ({ ...p, functional_impairment: e.target.checked }))}
          />
          <span className="text-sm">{t.functional_impairment}</span>
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.total_score}</span><span dir="ltr" className="font-mono">{result.total_score}</span></div>
        <div className="flex justify-between"><span>{t.severity}</span><strong>{t[result.severity] ?? result.severity}</strong></div>
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
