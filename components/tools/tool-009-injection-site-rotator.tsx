'use client';

import React, { useState } from 'react';
import { useUserToolState, useUpdateToolState } from '@/lib/hooks/useToolState';
import i18nJson from '@/i18n/tool-009-injection-site-rotator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { InjectionSiteHistorySchema, InjectionSiteLogEntrySchema, type InjectionSiteLogEntry } from '@/lib/tools/schemas/tool-009-injection-site-rotator';

type Location = 'deltoid' | 'glute' | 'quad' | 'pectoral' | 'bicep' | 'other';
type SiteLogEntry = InjectionSiteLogEntry;

function readStoredEntries(value: unknown): SiteLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Record<string, unknown>;
    const rawDate = candidate.date ?? candidate.last_injection_date;
    const date = typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? `${rawDate}T12:00:00.000Z`
      : rawDate;
    const parsed = InjectionSiteLogEntrySchema.safeParse({
      id: candidate.id,
      date,
      site: candidate.site ?? candidate.name_en,
      location: candidate.location,
      oil_based: Boolean(candidate.oil_based),
    });
    return parsed.success ? [parsed.data] : [];
  }).slice(-500);
}

export default function Tool009InjectionSiteRotator() {
  const t = useToolI18n(i18nJson);
  const { data: savedState, isLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState<Location>('deltoid');
  const [oilBased, setOilBased] = useState(false);
  const [date, setDate] = useState('');
  const [sessionEntries, setSessionEntries] = useState<SiteLogEntry[]>([]);
  const stored = (savedState?.injection_sites as { logEntries?: unknown } | undefined)?.logEntries;
  const entries = [...readStoredEntries(stored), ...sessionEntries].slice(-500);
  const [validationError, setValidationError] = useState(false);

  const saveEntry = () => {
    const site = siteName.trim();
    if (!site || !date || isLoading) return;
    const parsedEntry = InjectionSiteLogEntrySchema.safeParse({
      id: crypto.randomUUID(),
      date: new Date(`${date}T12:00:00.000Z`).toISOString(),
      site,
      location,
      oil_based: oilBased,
    });
    if (!parsedEntry.success) {
      setValidationError(true);
      return;
    }
    const entry = parsedEntry.data;
    const nextEntries = [...entries, entry].slice(-500);
    setSessionEntries((current) => [...current, entry].slice(-500));
    setValidationError(false);
    const validatedHistory = InjectionSiteHistorySchema.safeParse({ entries: nextEntries });
    if (!validatedHistory.success) {
      setValidationError(true);
      return;
    }
    updateToolState({
      injection_sites: {
        total_sites_rotated: validatedHistory.data.entries.length,
        logEntries: validatedHistory.data.entries,
      },
    });
    setSiteName('');
    setDate('');
    setOilBased(false);
  };

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        {t.scope_note}
      </p>
      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.site}
          <input value={siteName} onChange={(event) => setSiteName(event.target.value)} maxLength={120}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.location}
            <select value={location} onChange={(event) => setLocation(event.target.value as Location)} className="mt-1 w-full rounded border p-2">
              <option value="deltoid">{t.deltoid}</option>
              <option value="glute">{t.glute}</option>
              <option value="quad">{t.quad}</option>
              <option value="pectoral">{t.pectoral}</option>
              <option value="bicep">{t.bicep}</option>
              <option value="other">{t.other}</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t.last_injection}
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} dir="ltr"
              className="mt-1 w-full rounded border p-2" />
          </label>
        </div>
        <label className="block text-sm font-medium">
          {t.compound_type}
          <select value={oilBased ? 'oil' : 'water'} onChange={(event) => setOilBased(event.target.value === 'oil')}
            className="mt-1 w-full rounded border p-2">
            <option value="water">{t.water_based}</option>
            <option value="oil">{t.oil_based}</option>
          </select>
        </label>
        {validationError && <p role="alert" className="text-sm text-red-700">{t.validation_error}</p>}
        <button type="button" onClick={saveEntry} disabled={!siteName.trim() || !date || isLoading || isPending}
          className="w-full rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? t.saving : t.save_entry}
        </button>
        <section aria-labelledby="tool-009-history-heading" className="mt-6 rounded bg-zinc-50 p-4">
          <h3 id="tool-009-history-heading" className="mb-3 font-semibold">{t.history}</h3>
          <p className="text-sm text-zinc-600">{t.entries_count}: {entries.length}</p>
          {entries.length === 0 ? <p className="mt-2 text-sm text-zinc-500">{t.empty}</p> : (
            <ul className="mt-3 space-y-3">
              {entries.map((entry) => (
                <li key={entry.id} className="rounded border bg-white p-3">
                  <div className="font-medium">{entry.site}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {t[entry.location]} · {entry.oil_based ? t.oil_based : t.water_based} · <time dateTime={entry.date}>{new Date(entry.date).toLocaleDateString(t.dir === 'rtl' ? 'ar-EG' : 'en-US')}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
