'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-007-bloodwork-analyzer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { BloodworkRecordSchema, type BloodworkRecord } from '@/lib/tools/schemas/tool-007-bloodwork-analyzer';
import { buildBloodworkSessionV7 } from '@/lib/tools/engines/tool-007-bloodwork-analyzer';

interface Draft {
  markerName: string;
  value: string;
  unit: string;
  sourceLabel: string;
  referenceInterval: string;
  sampleDate: string;
}

const EMPTY_DRAFT: Draft = {
  markerName: '',
  value: '',
  unit: '',
  sourceLabel: '',
  referenceInterval: '',
  sampleDate: '',
};

export default function Tool007BloodworkAnalyzer() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [records, setRecords] = useState<BloodworkRecord[]>([]);
  const [validationError, setValidationError] = useState(false);
  const session = buildBloodworkSessionV7(records);

  const saveRecord = () => {
    const parsed = BloodworkRecordSchema.safeParse({
      ...draft,
      id: crypto.randomUUID(),
      value: draft.value.trim() === '' ? Number.NaN : Number(draft.value),
      referenceInterval: draft.referenceInterval.trim() || undefined,
    });
    if (!parsed.success) {
      setValidationError(true);
      return;
    }
    setRecords((current) => [...current, parsed.data].slice(-200));
    setDraft(EMPTY_DRAFT);
    setValidationError(false);
  };

  const removeRecord = (id: string) => setRecords((current) => current.filter((record) => record.id !== id));

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        {t.scope_note}
      </p>
      <p role="status" className="mb-6 rounded bg-zinc-100 p-3 text-sm">
        {t.interpretation_unavailable}
      </p>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.marker_name}
          <input value={draft.markerName} maxLength={120} onChange={(event) => setDraft({ ...draft, markerName: event.target.value })}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.value}
            <input type="number" step="any" value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })}
              className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="block text-sm font-medium">
            {t.unit}
            <input value={draft.unit} maxLength={24} onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
              className="mt-1 w-full rounded border p-2" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.source}
            <input value={draft.sourceLabel} maxLength={160} onChange={(event) => setDraft({ ...draft, sourceLabel: event.target.value })}
              className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="block text-sm font-medium">
            {t.test_date}
            <input type="date" value={draft.sampleDate} onChange={(event) => setDraft({ ...draft, sampleDate: event.target.value })} dir="ltr"
              className="mt-1 w-full rounded border p-2" />
          </label>
        </div>
        <label className="block text-sm font-medium">
          {t.reference_interval}
          <input value={draft.referenceInterval} maxLength={120} onChange={(event) => setDraft({ ...draft, referenceInterval: event.target.value })}
            className="mt-1 w-full rounded border p-2" />
        </label>
        {validationError && <p role="alert" className="text-sm text-red-700">{t.validation_error}</p>}
        <button type="button" onClick={saveRecord} className="w-full rounded bg-blue-700 px-4 py-3 font-medium text-white">
          {t.add_record}
        </button>
      </div>

      <section aria-labelledby="tool-007-records-heading" className="mt-8 rounded bg-zinc-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="tool-007-records-heading" className="font-semibold">{t.records}: {session.records.length}</h3>
          {records.length > 0 && <button type="button" onClick={() => setRecords([])} className="rounded border px-3 py-2 text-sm">{t.clear_all}</button>}
        </div>
        {session.records.length === 0 ? <p className="mt-3 text-sm text-zinc-600">{t.empty}</p> : (
          <ul className="mt-3 space-y-3">
            {session.records.map((record) => (
              <li key={record.id} className="rounded border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{record.markerName}: {record.value} {record.unit}</div>
                    <div className="mt-1 text-sm text-zinc-600">{t.source}: {record.sourceLabel} · {record.sampleDate}</div>
                    {record.referenceInterval && <div className="mt-1 text-sm text-zinc-600">{t.reference_interval}: {record.referenceInterval}</div>}
                    <div className="mt-2 text-xs text-zinc-500">{t.origin_user_provided}</div>
                  </div>
                  <button type="button" onClick={() => removeRecord(record.id)} className="rounded border px-2 py-1 text-sm">{t.remove}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
