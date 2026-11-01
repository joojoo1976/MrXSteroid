'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-025-drug-interaction-pro.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { buildMedicationSessionV7 } from '@/lib/tools/engines/tool-025-drug-interaction-pro';
import {
  MedicationSessionEntrySchema,
  MedicationSessionInputSchema,
  type MedicationSessionEntry,
} from '@/lib/tools/schemas/tool-025-drug-interaction-pro';

type ItemType = MedicationSessionEntry['itemType'];

interface Draft {
  itemName: string;
  itemType: ItemType;
  doseDescription: string;
  sourceLabel: string;
  notes: string;
}

const EMPTY_DRAFT: Draft = {
  itemName: '',
  itemType: 'prescription',
  doseDescription: '',
  sourceLabel: '',
  notes: '',
};

export default function Tool025DrugInteractionCheckerPro() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [entries, setEntries] = useState<MedicationSessionEntry[]>([]);
  const [validationError, setValidationError] = useState(false);
  const session = buildMedicationSessionV7(entries);

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setValidationError(false);
  };

  const addEntry = () => {
    const parsed = MedicationSessionEntrySchema.safeParse({
      ...draft,
      id: crypto.randomUUID(),
      doseDescription: draft.doseDescription.trim() || undefined,
      sourceLabel: draft.sourceLabel.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });
    const candidate = parsed.success ? [...entries, parsed.data] : entries;
    const validSession = parsed.success && candidate.length <= 50
      ? MedicationSessionInputSchema.safeParse({ entries: candidate }).success
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
      <p role="status" className="mb-6 rounded bg-zinc-100 p-3 text-sm">
        {t.interaction_unavailable}
      </p>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.item_name}
          <input value={draft.itemName} maxLength={120} onChange={(event) => updateDraft('itemName', event.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>

        <label className="block text-sm font-medium">
          {t.item_type}
          <select value={draft.itemType} onChange={(event) => updateDraft('itemType', event.target.value)}
            className="mt-1 w-full rounded border p-2">
            <option value="prescription">{t.type_prescription}</option>
            <option value="over_the_counter">{t.type_over_the_counter}</option>
            <option value="supplement">{t.type_supplement}</option>
            <option value="hormone_or_compound">{t.type_hormone_or_compound}</option>
            <option value="other">{t.type_other}</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          {t.dose_description}
          <input value={draft.doseDescription} maxLength={80} onChange={(event) => updateDraft('doseDescription', event.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>

        <label className="block text-sm font-medium">
          {t.source_label}
          <input value={draft.sourceLabel} maxLength={160} onChange={(event) => updateDraft('sourceLabel', event.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>

        <label className="block text-sm font-medium">
          {t.notes}
          <textarea value={draft.notes} maxLength={240} onChange={(event) => updateDraft('notes', event.target.value)}
            className="mt-1 w-full rounded border p-2" rows={3} />
        </label>

        {validationError && <p role="alert" className="text-sm text-red-700">{t.validation_error}</p>}
        <button type="button" onClick={addEntry} disabled={entries.length >= 50}
          className="w-full rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-50">
          {t.add_entry} ({entries.length}/50)
        </button>
      </div>

      <section aria-labelledby="tool-025-session-heading" className="mt-8 rounded bg-zinc-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="tool-025-session-heading" className="font-semibold">{t.session_list}: {session.entries.length}</h3>
          {entries.length > 0 && <button type="button" onClick={() => setEntries([])} className="rounded border px-3 py-2 text-sm">{t.clear_all}</button>}
        </div>
        {session.entries.length === 0 ? <p className="mt-3 text-sm text-zinc-600">{t.empty}</p> : (
          <ul className="mt-3 space-y-3">
            {session.entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 rounded border bg-white p-3">
                <div>
                  <div className="font-medium">{entry.itemName}</div>
                  <div className="mt-1 text-sm text-zinc-600">{t[`type_${entry.itemType}`]}</div>
                  {entry.doseDescription && <div className="mt-1 text-sm text-zinc-600">{t.dose_description}: {entry.doseDescription}</div>}
                  {entry.sourceLabel && <div className="mt-1 text-sm text-zinc-600">{t.source_label}: {entry.sourceLabel}</div>}
                  {entry.notes && <div className="mt-1 text-sm text-zinc-600">{t.notes}: {entry.notes}</div>}
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
