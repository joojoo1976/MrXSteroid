'use client';

import React, { useState } from 'react';
import { useUserToolState, useUpdateToolState } from '@/lib/hooks/useToolState';
import i18nJson from '@/i18n/tool-008-side-effect-tracker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { SideEffectLogSchema, type SideEffectLog } from '@/lib/tools/schemas/tool-008-side-effect-tracker';

type Severity = 'mild' | 'moderate' | 'severe';
type Category = 'estrogenic' | 'androgenic' | 'cardiovascular' | 'hepatotoxic' | 'psychological' | 'other';
type Entry = SideEffectLog;

function readStoredEntries(value: unknown): Entry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Record<string, unknown>;
    const date = typeof candidate.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(candidate.date)
      ? `${candidate.date}T12:00:00.000Z`
      : candidate.date;
    const parsed = SideEffectLogSchema.safeParse({ ...candidate, date });
    return parsed.success ? [parsed.data] : [];
  });
}

export default function Tool008SideEffectTracker() {
  const t = useToolI18n(i18nJson);
  const { data: savedState, isLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState<Severity>('mild');
  const [category, setCategory] = useState<Category>('other');
  const [notes, setNotes] = useState('');
  const [sessionEntries, setSessionEntries] = useState<Entry[]>([]);
  const stored = (savedState?.side_effects as { logEntries?: unknown } | undefined)?.logEntries;
  const logEntries = [...readStoredEntries(stored).slice(-500), ...sessionEntries].slice(-500);

  const saveEntry = () => {
    const description = symptom.trim();
    if (!description || isLoading) return;
    const parsedEntry = SideEffectLogSchema.safeParse({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      symptom: description,
      severity,
      category,
      notes: notes.trim(),
    });
    if (!parsedEntry.success) return;
    const entry = parsedEntry.data;
    const nextEntries = [...logEntries, entry].slice(-500);
    setSessionEntries((current) => [...current, entry].slice(-500));
    updateToolState({
      side_effects: {
        total_logs: nextEntries.length,
        logEntries: nextEntries,
      },
    });
    setSymptom('');
    setNotes('');
  };

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="note">
        {t.scope_note}
      </p>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.symptom}
          <input value={symptom} onChange={(event) => setSymptom(event.target.value)} maxLength={240}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.severity}
            <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)} className="mt-1 w-full rounded border p-2">
              <option value="mild">{t.mild}</option>
              <option value="moderate">{t.moderate}</option>
              <option value="severe">{t.severe}</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t.category}
            <select value={category} onChange={(event) => setCategory(event.target.value as Category)} className="mt-1 w-full rounded border p-2">
              <option value="estrogenic">{t.estrogenic}</option>
              <option value="androgenic">{t.androgenic}</option>
              <option value="cardiovascular">{t.cardiovascular}</option>
              <option value="hepatotoxic">{t.hepatotoxic}</option>
              <option value="psychological">{t.psychological}</option>
              <option value="other">{t.other}</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium">
          {t.notes}
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3}
            className="mt-1 w-full resize-y rounded border p-2" />
        </label>
        <button type="button" onClick={saveEntry} disabled={!symptom.trim() || isLoading || isPending}
          className="w-full rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? t.saving : t.save_entry}
        </button>

        <section aria-labelledby="tool-008-history-heading" className="mt-6 rounded bg-zinc-50 p-4">
          <h3 id="tool-008-history-heading" className="mb-3 font-semibold">{t.history}</h3>
          <p className="text-sm text-zinc-600">{t.entries_count}: {logEntries.length}</p>
          {logEntries.length === 0 ? <p className="mt-2 text-sm text-zinc-500">{t.empty}</p> : (
            <ul className="mt-3 space-y-3">
              {logEntries.map((entry) => (
                <li key={entry.id} className="rounded border bg-white p-3">
                  <div className="font-medium">{entry.symptom}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {t[entry.severity]} · {t[entry.category]} · <time dateTime={entry.date}>{new Date(entry.date).toLocaleString(t.dir === 'rtl' ? 'ar-EG' : 'en-US')}</time>
                  </div>
                  {entry.notes && <p className="mt-2 text-sm">{entry.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
