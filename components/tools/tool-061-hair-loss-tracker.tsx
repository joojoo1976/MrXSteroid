'use client';

/**
 * components/tools/tool-061-hair-loss-tracker.tsx
 * Tool #061 — Hair Loss Tracker (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessHairLoss,
  type HairLossEntry,
  type HairLossInput,
} from '@/lib/tools/engines/tool-061-hair-loss-tracker';
import i18nJson from '@/i18n/tool-061-hair-loss-tracker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initialEntries: HairLossEntry[] = [
  { month: 0, density_score: 80 },
  { month: 3, density_score: 78 },
  { month: 6, density_score: 76 },
];

const initial: HairLossInput = {
  entries: initialEntries,
  norwood_stage: 2,
  daily_shed_strands: 60,
  recent_stressor: false,
  scalp_inflammation: false,
};

export default function Tool061HairLossTracker() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<HairLossInput>(initial);
  const set = <K extends keyof HairLossInput>(k: K, v: HairLossInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessHairLoss(input), [input]);

  const setEntry = (i: number, patch: Partial<HairLossEntry>) =>
    setInput((p) => ({
      ...p,
      entries: p.entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));

  const addEntry = () =>
    setInput((p) => {
      const last = p.entries[p.entries.length - 1];
      return {
        ...p,
        entries: [...p.entries, { month: (last?.month ?? 0) + 3, density_score: last?.density_score ?? 80 }],
      };
    });

  const removeEntry = () =>
    setInput((p) => (p.entries.length > 1 ? { ...p, entries: p.entries.slice(0, -1) } : p));

  const numField = (key: keyof HairLossInput, label: string, min: number, max: number) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as HairLossInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="hair-loss-tracker-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {numField('norwood_stage', t.norwood_stage, 1, 7)}
        {numField('daily_shed_strands', t.daily_shed_strands, 0, 1000)}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.recent_stressor} onChange={(e) => set('recent_stressor', e.target.checked)} />
          <span className="text-sm font-medium">{t.recent_stressor}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={input.scalp_inflammation} onChange={(e) => set('scalp_inflammation', e.target.checked)} />
          <span className="text-sm font-medium">{t.scalp_inflammation}</span>
        </label>
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-2">{t.density_score}</h3>
        <div className="space-y-2">
          {input.entries.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="number"
                dir="ltr"
                aria-label={t.entry_month}
                value={e.month}
                onChange={(ev) => setEntry(i, { month: Number(ev.target.value) })}
                className="w-24 rounded border p-2"
              />
              <input
                type="number"
                dir="ltr"
                aria-label={t.density_score}
                value={e.density_score}
                onChange={(ev) => setEntry(i, { density_score: Number(ev.target.value) })}
                className="w-28 rounded border p-2"
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={addEntry} className="rounded border px-3 py-1 text-sm">{t.add_entry}</button>
          <button type="button" onClick={removeEntry} className="rounded border px-3 py-1 text-sm">{t.remove_entry}</button>
        </div>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.baseline_score}</span><span dir="ltr" className="font-mono">{result.baseline_score}</span></div>
        <div className="flex justify-between"><span>{t.latest_score}</span><span dir="ltr" className="font-mono">{result.latest_score}</span></div>
        <div className="flex justify-between"><span>{t.absolute_change}</span><span dir="ltr" className="font-mono">{result.absolute_change}</span></div>
        <div className="flex justify-between"><span>{t.percent_change}</span><span dir="ltr" className="font-mono">{result.percent_change}</span></div>
        <div className="flex justify-between"><span>{t.slope_per_month}</span><span dir="ltr" className="font-mono">{result.slope_per_month}</span></div>
        <div className="flex justify-between"><span>{t.trend}</span><strong>{t[result.trend] ?? result.trend}</strong></div>
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
