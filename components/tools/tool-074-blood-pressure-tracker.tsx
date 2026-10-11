'use client';

/**
 * components/tools/tool-074-blood-pressure-tracker.tsx
 * Tool #074 — Blood Pressure Tracker (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessBloodPressure,
  type BpInput,
  type BpReading,
} from '@/lib/tools/engines/tool-074-blood-pressure-tracker';
import i18nJson from '@/i18n/tool-074-blood-pressure-tracker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: BpInput = {
  readings: [
    { systolic: 128, diastolic: 82, pulse: 72 },
    { systolic: 132, diastolic: 84, pulse: 74 },
    { systolic: 126, diastolic: 80, pulse: 70 },
  ],
  chest_pain: false,
  breathing_difficulty: false,
  severe_headache: false,
  vision_changes: false,
  dizziness_on_standing: false,
};

export default function Tool074BloodPressureTracker() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<BpInput>(initial);
  const set = <K extends keyof BpInput>(k: K, v: BpInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessBloodPressure(input), [input]);

  const setReading = (i: number, patch: Partial<BpReading>) =>
    setInput((p) => ({ ...p, readings: p.readings.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) }));

  const addReading = () =>
    setInput((p) => {
      const last = p.readings[p.readings.length - 1];
      return { ...p, readings: [...p.readings, { systolic: last?.systolic ?? 120, diastolic: last?.diastolic ?? 80, pulse: last?.pulse ?? null }] };
    });

  const removeReading = () =>
    setInput((p) => (p.readings.length > 1 ? { ...p, readings: p.readings.slice(0, -1) } : p));

  return (
    <div className="blood-pressure-tracker-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="mt-2">
        <h3 className="font-bold mb-2">{t.readings}</h3>
        <div className="space-y-2">
          {input.readings.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input type="number" dir="ltr" aria-label={t.systolic} value={r.systolic}
                onChange={(e) => setReading(i, { systolic: Number(e.target.value) })} className="w-24 rounded border p-2" />
              <span className="text-sm">/</span>
              <input type="number" dir="ltr" aria-label={t.diastolic} value={r.diastolic}
                onChange={(e) => setReading(i, { diastolic: Number(e.target.value) })} className="w-24 rounded border p-2" />
              <input type="number" dir="ltr" aria-label={t.pulse} value={r.pulse ?? ''}
                onChange={(e) => setReading(i, { pulse: e.target.value === '' ? null : Number(e.target.value) })} className="w-24 rounded border p-2" />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={addReading} className="rounded border px-3 py-1 text-sm">{t.add_reading}</button>
          <button type="button" onClick={removeReading} className="rounded border px-3 py-1 text-sm">{t.remove_reading}</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {(['chest_pain', 'breathing_difficulty', 'severe_headache', 'vision_changes', 'dizziness_on_standing'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.average_systolic}</span><span dir="ltr" className="font-mono">{result.average_systolic}</span></div>
        <div className="flex justify-between"><span>{t.average_diastolic}</span><span dir="ltr" className="font-mono">{result.average_diastolic}</span></div>
        <div className="flex justify-between"><span>{t.average_pulse}</span><span dir="ltr" className="font-mono">{result.average_pulse ?? '—'}</span></div>
        <div className="flex justify-between"><span>{t.overall_category}</span><strong>{t[result.overall_category] ?? result.overall_category}</strong></div>
        <div className="flex justify-between"><span>{t.max_systolic}</span><span dir="ltr" className="font-mono">{result.max_systolic}</span></div>
        <div className="flex justify-between"><span>{t.max_diastolic}</span><span dir="ltr" className="font-mono">{result.max_diastolic}</span></div>
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
