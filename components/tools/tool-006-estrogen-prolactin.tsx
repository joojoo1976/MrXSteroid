'use client';

import React, { useState } from 'react';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import i18nJson from '@/i18n/tool-006-estrogen-prolactin.json';
import type { EstrogenProlactinInput } from '@/lib/tools/engines/tool-006-estrogen-prolactin';
import { EstrogenProlactinInputSchema } from '@/lib/tools/schemas/tool-006-estrogen-prolactin';

type Draft = {
  e2Level: string;
  e2Unit: EstrogenProlactinInput['e2Unit'];
  prolactinLevel: string;
  prolactinUnit: EstrogenProlactinInput['prolactinUnit'];
};

const EMPTY_DRAFT: Draft = {
  e2Level: '',
  e2Unit: 'pg/mL',
  prolactinLevel: '',
  prolactinUnit: 'ng/mL',
};

export default function Tool006EstrogenProlactin() {
  const i18nData = useToolI18n(i18nJson);
  const { isRtl } = useToolDisplayPreferences();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [records, setRecords] = useState<EstrogenProlactinInput[]>([]);
  const [error, setError] = useState('');

  function addRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = EstrogenProlactinInputSchema.safeParse({
      e2Level: Number(draft.e2Level),
      e2Unit: draft.e2Unit,
      prolactinLevel: Number(draft.prolactinLevel),
      prolactinUnit: draft.prolactinUnit,
    });
    if (!parsed.success) {
      setError(i18nData.invalid_values);
      return;
    }
    setError('');
    setRecords((current) => [...current, parsed.data]);
    setDraft(EMPTY_DRAFT);
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-950 p-5 text-slate-100 md:p-7" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold">{i18nData.tool_name}</h1>
      <p className="mt-2 text-sm text-slate-300">{i18nData.description}</p>

      <div role="note" className="my-5 rounded-lg border border-amber-500/50 bg-amber-950/30 p-4 text-sm text-amber-100">
        <strong>{i18nData.not_assessed_title}</strong>
        <p className="mt-1">{i18nData.not_assessed_body}</p>
      </div>

      <form onSubmit={addRecord} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>{i18nData.e2_label}</span>
          <span className="flex gap-2">
            <input
              aria-label={i18nData.e2_label}
              inputMode="decimal"
              type="number"
              min="0"
              step="any"
              required
              value={draft.e2Level}
              onChange={(event) => setDraft({ ...draft, e2Level: event.target.value })}
              className="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-3 py-2"
            />
            <select
              aria-label={i18nData.e2_unit}
              value={draft.e2Unit}
              onChange={(event) => setDraft({ ...draft, e2Unit: event.target.value as Draft['e2Unit'] })}
              className="rounded border border-slate-600 bg-slate-900 px-2 py-2"
            >
              <option value="pg/mL">pg/mL</option>
              <option value="pmol/L">pmol/L</option>
            </select>
          </span>
        </label>

        <label className="grid gap-1 text-sm">
          <span>{i18nData.prolactin_label}</span>
          <span className="flex gap-2">
            <input
              aria-label={i18nData.prolactin_label}
              inputMode="decimal"
              type="number"
              min="0"
              step="any"
              required
              value={draft.prolactinLevel}
              onChange={(event) => setDraft({ ...draft, prolactinLevel: event.target.value })}
              className="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-3 py-2"
            />
            <select
              aria-label={i18nData.prolactin_unit}
              value={draft.prolactinUnit}
              onChange={(event) => setDraft({ ...draft, prolactinUnit: event.target.value as Draft['prolactinUnit'] })}
              className="rounded border border-slate-600 bg-slate-900 px-2 py-2"
            >
              <option value="ng/mL">ng/mL</option>
              <option value="mIU/L">mIU/L</option>
            </select>
          </span>
        </label>

        {error && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{error}</p>}
        <button type="submit" className="rounded-lg bg-cyan-700 px-4 py-2 font-semibold hover:bg-cyan-600 sm:col-span-2">
          {i18nData.add_record}
        </button>
      </form>

      <section aria-live="polite" className="mt-6 border-t border-slate-700 pt-4">
        <h2 className="font-semibold">{i18nData.session_records}</h2>
        {records.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">{i18nData.no_records}</p>
        ) : (
          <ol className="mt-2 grid gap-2">
            {records.map((record, index) => (
              <li key={`${index}-${record.e2Level}-${record.prolactinLevel}`} className="rounded border border-slate-700 p-3 text-sm">
                {i18nData.e2_label}: {record.e2Level} {record.e2Unit}; {i18nData.prolactin_label}: {record.prolactinLevel} {record.prolactinUnit}
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
