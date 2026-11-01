'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-026-injection-pain.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { buildInjectionExperienceSessionV7 } from '@/lib/tools/engines/tool-026-injection-pain';
import {
  InjectionExperienceEntrySchema,
  InjectionExperienceInputSchema,
  type InjectionExperienceEntry,
} from '@/lib/tools/schemas/tool-026-injection-pain';

interface Draft {
  eventDate: string;
  siteLabel: string;
  notes: string;
}

const EMPTY_DRAFT: Draft = { eventDate: '', siteLabel: '', notes: '' };

export default function Tool026InjectionExperienceLog() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [entries, setEntries] = useState<InjectionExperienceEntry[]>([]);
  const [validationError, setValidationError] = useState(false);
  const session = buildInjectionExperienceSessionV7(entries);

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setValidationError(false);
  };

  const addEntry = () => {
    const parsed = InjectionExperienceEntrySchema.safeParse({
      id: crypto.randomUUID(),
      ...draft,
      siteLabel: draft.siteLabel.trim() || undefined,
    });
    const candidate = parsed.success ? [...entries, parsed.data] : entries;
    const validSession = parsed.success && candidate.length <= 100
      ? InjectionExperienceInputSchema.safeParse({ entries: candidate }).success
      : false;
    if (!parsed.success || !validSession) {
      setValidationError(true);
      return;
    }

    setEntries(candidate);
    setDraft(EMPTY_DRAFT);
    setValidationError(false);
  };

  const removeEntry = (id: string) => setEntries((current) => current.filter((entry) => entry.id !== id));

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        {t.scope_note}
      </p>
      <p role="status" className="mb-6 rounded bg-zinc-100 p-3 text-sm">{t.assessment_unavailable}</p>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.event_date}
          <input type="date" value={draft.eventDate} onChange={(event) => updateDraft('eventDate', event.target.value)}
            className="mt-1 w-full rounded border p-2" dir="ltr" />
        </label>
        <label className="block text-sm font-medium">
          {t.site_label}
          <input value={draft.siteLabel} maxLength={120} onChange={(event) => updateDraft('siteLabel', event.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm font-medium">
          {t.experience_notes}
          <textarea value={draft.notes} maxLength={500} onChange={(event) => updateDraft('notes', event.target.value)}
            className="mt-1 w-full rounded border p-2" rows={4} />
        </label>
        {validationError && <p role="alert" className="text-sm text-red-700">{t.validation_error}</p>}
        <button type="button" onClick={addEntry} disabled={entries.length >= 100}
          className="w-full rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-50">
          {t.add_entry} ({entries.length}/100)
        </button>
      </div>

      <section aria-labelledby="tool-026-records-heading" className="mt-8 rounded bg-zinc-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="tool-026-records-heading" className="font-semibold">{t.session_records}: {session.entries.length}</h3>
          {entries.length > 0 && <button type="button" onClick={() => setEntries([])} className="rounded border px-3 py-2 text-sm">{t.clear_all}</button>}
        </div>
        {session.entries.length === 0 ? <p className="mt-3 text-sm text-zinc-600">{t.empty}</p> : (
          <ul className="mt-3 space-y-3">
            {session.entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 rounded border bg-white p-3">
                <div>
                  <div className="font-medium">{entry.eventDate}{entry.siteLabel ? ` · ${entry.siteLabel}` : ''}</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{entry.notes}</p>
                  <div className="mt-2 text-xs text-zinc-500">{t.origin_user_provided}</div>
                </div>
                <button type="button" onClick={() => removeEntry(entry.id)} className="rounded border px-2 py-1 text-sm">{t.remove}</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
