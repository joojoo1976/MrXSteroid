'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-029-side-effect-early-warning.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { summarizeMeasurementReadingsV7 } from '@/lib/tools/engines/tool-029-side-effect-early-warning';
import {
  MeasurementReadingSchema,
  MeasurementSummaryInputSchema,
  type MeasurementReading,
  type MeasurementSummaryResult,
} from '@/lib/tools/schemas/tool-029-side-effect-early-warning';

interface Draft {
  date: string;
  metric: 'blood_pressure' | 'pulse';
  systolicMmHg: string;
  diastolicMmHg: string;
  beatsPerMinute: string;
  sourceLabel: string;
}

const EMPTY_DRAFT: Draft = {
  date: '',
  metric: 'blood_pressure',
  systolicMmHg: '',
  diastolicMmHg: '',
  beatsPerMinute: '',
  sourceLabel: '',
};

function numberOrInvalid(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

export default function Tool029MeasurementSummary() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [readings, setReadings] = useState<MeasurementReading[]>([]);
  const [result, setResult] = useState<MeasurementSummaryResult | null>(null);
  const [validationError, setValidationError] = useState(false);

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
    setValidationError(false);
  };

  const addReading = () => {
    const base = {
      id: crypto.randomUUID(),
      date: draft.date,
      metric: draft.metric,
      sourceLabel: draft.sourceLabel.trim() || undefined,
    };
    const candidate = draft.metric === 'blood_pressure'
      ? {
          ...base,
          metric: 'blood_pressure' as const,
          systolicMmHg: numberOrInvalid(draft.systolicMmHg),
          diastolicMmHg: numberOrInvalid(draft.diastolicMmHg),
        }
      : {
          ...base,
          metric: 'pulse' as const,
          beatsPerMinute: numberOrInvalid(draft.beatsPerMinute),
        };
    const parsed = MeasurementReadingSchema.safeParse(candidate);
    const allReadings = parsed.success ? [...readings, parsed.data] : readings;
    const validSession = parsed.success && allReadings.length <= 200
      ? MeasurementSummaryInputSchema.safeParse({ readings: allReadings }).success
      : false;
    if (!parsed.success || !validSession) {
      setValidationError(true);
      return;
    }
    setReadings(allReadings);
    setDraft(EMPTY_DRAFT);
    setResult(null);
    setValidationError(false);
  };

  const summarize = () => {
    const parsed = MeasurementSummaryInputSchema.safeParse({ readings });
    if (!parsed.success) {
      setValidationError(true);
      setResult(null);
      return;
    }
    setResult(summarizeMeasurementReadingsV7(parsed.data.readings));
    setValidationError(false);
  };

  const removeReading = (id: string) => {
    setReadings((current) => current.filter((reading) => reading.id !== id));
    setResult(null);
  };

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setReadings([]);
    setResult(null);
    setValidationError(false);
  };

  const formatValue = (value: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{t.scope_note}</p>
      <p role="status" className="mb-6 rounded bg-zinc-100 p-3 text-sm">{t.assessment_unavailable}</p>

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.reading_date}
          <input type="date" value={draft.date} onChange={(event) => updateDraft('date', event.target.value)}
            className="mt-1 w-full rounded border p-2" dir="ltr" />
        </label>
        <label className="block text-sm font-medium">
          {t.measurement_type}
          <select value={draft.metric} onChange={(event) => updateDraft('metric', event.target.value)} className="mt-1 w-full rounded border p-2">
            <option value="blood_pressure">{t.blood_pressure}</option>
            <option value="pulse">{t.pulse}</option>
          </select>
        </label>

        {draft.metric === 'blood_pressure' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              {t.systolic}
              <input type="number" step="any" value={draft.systolicMmHg} onChange={(event) => updateDraft('systolicMmHg', event.target.value)}
                className="mt-1 w-full rounded border p-2" dir="ltr" />
            </label>
            <label className="block text-sm font-medium">
              {t.diastolic}
              <input type="number" step="any" value={draft.diastolicMmHg} onChange={(event) => updateDraft('diastolicMmHg', event.target.value)}
                className="mt-1 w-full rounded border p-2" dir="ltr" />
            </label>
          </div>
        ) : (
          <label className="block text-sm font-medium">
            {t.pulse_value}
            <input type="number" step="any" value={draft.beatsPerMinute} onChange={(event) => updateDraft('beatsPerMinute', event.target.value)}
              className="mt-1 w-full rounded border p-2" dir="ltr" />
          </label>
        )}

        <label className="block text-sm font-medium">
          {t.source_label}
          <input value={draft.sourceLabel} maxLength={160} onChange={(event) => updateDraft('sourceLabel', event.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        {validationError && <p role="alert" className="text-sm text-red-700">{t.validation_error}</p>}
        <button type="button" onClick={addReading} disabled={readings.length >= 200}
          className="w-full rounded bg-zinc-700 px-4 py-3 font-medium text-white disabled:opacity-50">
          {t.add_reading} ({readings.length}/200)
        </button>
      </div>

      <section aria-labelledby="tool-029-readings-heading" className="mt-7 rounded bg-zinc-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="tool-029-readings-heading" className="font-semibold">{t.session_readings}</h3>
          {readings.length > 0 && <button type="button" onClick={reset} className="rounded border px-3 py-2 text-sm">{t.clear_all}</button>}
        </div>
        {readings.length === 0 ? <p className="mt-3 text-sm text-zinc-600">{t.empty}</p> : (
          <ul className="mt-3 space-y-3">
            {readings.map((reading) => (
              <li key={reading.id} className="flex items-start justify-between gap-3 rounded border bg-white p-3">
                <div>
                  <div className="font-medium">{reading.date} · {reading.metric === 'blood_pressure' ? t.blood_pressure : t.pulse}</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    {reading.metric === 'blood_pressure'
                      ? `${t.systolic}: ${reading.systolicMmHg} mmHg · ${t.diastolic}: ${reading.diastolicMmHg} mmHg`
                      : `${t.pulse_value}: ${reading.beatsPerMinute} beats/min`}
                  </div>
                  {reading.sourceLabel && <div className="mt-1 text-xs text-zinc-500">{t.source_label}: {reading.sourceLabel}</div>}
                  <div className="mt-1 text-xs text-zinc-500">{t.origin_user_provided}</div>
                </div>
                <button type="button" onClick={() => removeReading(reading.id)} className="rounded border px-2 py-1 text-sm">{t.remove}</button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={summarize} disabled={readings.length === 0}
            className="rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-50">{t.summarize}</button>
          {readings.length > 0 && <button type="button" onClick={reset} className="rounded border px-4 py-3 font-medium">{t.reset_all}</button>}
        </div>
      </section>

      {result && (
        <section aria-labelledby="tool-029-summary-heading" className="mt-6 rounded border p-4">
          <h3 id="tool-029-summary-heading" className="font-semibold">{t.descriptive_summary}</h3>
          <p className="mt-1 text-xs text-zinc-500">{result.resultOrigin} · {result.method} · {result.clinicalAssessment}</p>
          <p className="mt-2 text-sm text-zinc-600">{t.summary_limit}</p>
          <ul className="mt-3 space-y-3">
            {result.summaries.map((summary) => (
              <li key={summary.metric} className="rounded bg-zinc-50 p-3">
                <div className="font-medium">{t[summary.metric]}</div>
                <div className="mt-1 text-sm">{t.observation_count}: {summary.count}</div>
                <div className="mt-1 text-sm">{t.minimum}: {formatValue(summary.minimum)} {summary.unit}</div>
                <div className="mt-1 text-sm">{t.maximum}: {formatValue(summary.maximum)} {summary.unit}</div>
                <div className="mt-1 text-sm">{t.arithmetic_mean}: {formatValue(summary.arithmeticMean)} {summary.unit}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
