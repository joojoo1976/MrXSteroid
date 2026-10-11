'use client';

/**
 * components/tools/tool-068-gynecomastia-tracker.tsx
 * Tool #068 — Gynecomastia Tracker (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessGynecomastia,
  type GynecomastiaEntry,
  type GynecomastiaInput,
} from '@/lib/tools/engines/tool-068-gynecomastia-tracker';
import i18nJson from '@/i18n/tool-068-gynecomastia-tracker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: GynecomastiaInput = {
  entries: [
    { month: 0, stage: 2, size_mm: 25, tender: false },
    { month: 2, stage: 2, size_mm: 26, tender: false },
    { month: 4, stage: 2, size_mm: 27, tender: false },
  ],
  unilateral: false,
  nipple_discharge: false,
  androgen_exposure: false,
};

export default function Tool068GynecomastiaTracker() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<GynecomastiaInput>(initial);
  const set = <K extends keyof GynecomastiaInput>(k: K, v: GynecomastiaInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessGynecomastia(input), [input]);

  const setEntry = (i: number, patch: Partial<GynecomastiaEntry>) =>
    setInput((p) => ({
      ...p,
      entries: p.entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));

  const addEntry = () =>
    setInput((p) => {
      const last = p.entries[p.entries.length - 1];
      return {
        ...p,
        entries: [
          ...p.entries,
          { month: (last?.month ?? 0) + 2, stage: last?.stage ?? 1, size_mm: last?.size_mm ?? 20, tender: false },
        ],
      };
    });

  const removeEntry = () =>
    setInput((p) => (p.entries.length > 1 ? { ...p, entries: p.entries.slice(0, -1) } : p));

  return (
    <div className="gynecomastia-tracker-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['unilateral', 'nipple_discharge', 'androgen_exposure'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-2">{t.size_mm}</h3>
        <div className="space-y-2">
          {input.entries.map((e, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                dir="ltr"
                aria-label={t.entry_month}
                value={e.month}
                onChange={(ev) => setEntry(i, { month: Number(ev.target.value) })}
                className="w-20 rounded border p-2"
              />
              <input
                type="number"
                dir="ltr"
                aria-label={t.stage}
                min={1}
                max={4}
                value={e.stage}
                onChange={(ev) => setEntry(i, { stage: Number(ev.target.value) })}
                className="w-20 rounded border p-2"
              />
              <input
                type="number"
                dir="ltr"
                aria-label={t.size_mm}
                value={e.size_mm}
                onChange={(ev) => setEntry(i, { size_mm: Number(ev.target.value) })}
                className="w-24 rounded border p-2"
              />
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={e.tender} onChange={(ev) => setEntry(i, { tender: ev.target.checked })} />
                <span className="text-xs">{t.tender}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={addEntry} className="rounded border px-3 py-1 text-sm">{t.add_entry}</button>
          <button type="button" onClick={removeEntry} className="rounded border px-3 py-1 text-sm">{t.remove_entry}</button>
        </div>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.baseline_size_mm}</span><span dir="ltr" className="font-mono">{result.baseline_size_mm}</span></div>
        <div className="flex justify-between"><span>{t.latest_size_mm}</span><span dir="ltr" className="font-mono">{result.latest_size_mm}</span></div>
        <div className="flex justify-between"><span>{t.size_slope_mm_per_month}</span><span dir="ltr" className="font-mono">{result.size_slope_mm_per_month}</span></div>
        <div className="flex justify-between"><span>{t.stage_change}</span><span dir="ltr" className="font-mono">{result.stage_change}</span></div>
        <div className="flex justify-between"><span>{t.current_stage}</span><span dir="ltr" className="font-mono">{result.current_stage}</span></div>
        <div className="flex justify-between"><span>{t.trend}</span><strong>{t[result.trend] ?? result.trend}</strong></div>
      </div>

      {result.urgent_review_advised && (
        <div role="alert" className="mt-4 rounded border border-red-500 bg-red-50 p-3 text-red-900 text-sm">
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
        <h3 className="font-bold mb-2">{t.education}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.education.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
