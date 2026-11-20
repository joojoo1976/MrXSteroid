'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-024-bloodwork-interpreter.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import {
  BloodworkComparisonInputSchema,
  BloodworkComparisonRecordSchema,
  type BloodworkComparisonRecord,
  type BloodworkComparisonResult,
} from '@/lib/tools/schemas/tool-024-bloodwork-interpreter';
import { runBloodworkInterpreter, type BloodworkInterpreterBuildOptions } from '@/lib/tools/r6/tool-024-bloodwork-interpreter-pipeline';
import { requireTool } from '@/lib/tools/registry';

interface Draft {
  markerName: string;
  value: string;
  unit: string;
  referenceLow: string;
  referenceHigh: string;
  sourceLabel: string;
  sampleDate: string;
}

const EMPTY_DRAFT: Draft = {
  markerName: '',
  value: '',
  unit: '',
  referenceLow: '',
  referenceHigh: '',
  sourceLabel: '',
  sampleDate: '',
};

export default function Tool024PostCycleBloodworkInterpreter() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [records, setRecords] = useState<BloodworkComparisonRecord[]>([]);
  const [result, setResult] = useState<BloodworkComparisonResult | null>(null);
  const [validationError, setValidationError] = useState(false);
  const tool = requireTool('tool-024-bloodwork-interpreter');

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: BloodworkInterpreterBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale: 'en',
    unitSystem: 'metric',
    snapshotType: 'draft',
  };

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
  };

  const addRecord = () => {
    const parsed = BloodworkComparisonRecordSchema.safeParse({
      id: crypto.randomUUID(),
      markerName: draft.markerName,
      value: draft.value.trim() === '' ? Number.NaN : Number(draft.value),
      unit: draft.unit,
      referenceLow: draft.referenceLow.trim() === '' ? Number.NaN : Number(draft.referenceLow),
      referenceHigh: draft.referenceHigh.trim() === '' ? Number.NaN : Number(draft.referenceHigh),
      sourceLabel: draft.sourceLabel,
      sampleDate: draft.sampleDate,
    });
    if (!parsed.success || records.length >= 30) {
      setValidationError(true);
      return;
    }
    setRecords((current) => [...current, parsed.data]);
    setDraft(EMPTY_DRAFT);
    setValidationError(false);
    setResult(null);
  };

  const compare = () => {
    const parsed = BloodworkComparisonInputSchema.safeParse({ records });
    if (!parsed.success) {
      setValidationError(true);
      setResult(null);
      return;
    }

    setPipelineStatus('calculating');
    const pipeline = runBloodworkInterpreter(parsed.data, options);
    if (pipeline.ok) {
      setPipelineResult(pipeline.output);
      setPipelineError(null);
      setPipelineStatus('done');
      setResult(pipeline.output.result);
      setValidationError(false);
    } else {
      setPipelineResult(null);
      setPipelineError(String(pipeline.error));
      setPipelineStatus('error');
      setResult(null);
    }
  };

  const removeRecord = (id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
    setResult(null);
  };

  const displayResult = pipelineStatus === 'done' && pipelineResult ? pipelineResult.result : result;

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        {t.scope_note}
      </p>
      <p className="mb-6 rounded bg-zinc-100 p-3 text-sm">{t.provenance_note}</p>

      {/* R6 Pipeline Status */}
      {pipelineStatus === 'calculating' && (
        <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
          <p className="font-semibold">جاري المقارنة عبر R6 Pipeline…</p>
        </div>
      )}
      {pipelineStatus === 'done' && pipelineResult && (
        <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4">
          <p className="font-semibold text-green-100">✓ تمت المقارنة عبر R6 Pipeline</p>
          <p className="mt-1 text-sm text-green-200">عدد المقارنات: {pipelineResult.result.comparisons.length}</p>
          <p className="mt-1 text-sm text-green-200">مصدر البيانات: {pipelineResult.provenance.source}</p>
        </div>
      )}
      {pipelineStatus === 'error' && pipelineError && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/20 p-4 text-red-100">
          <p className="font-semibold">خطأ في المقارنة</p>
          <p className="mt-1 text-sm">{pipelineError}</p>
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium">
          {t.marker_name}
          <input value={draft.markerName} maxLength={120} onChange={(event) => updateDraft('markerName', event.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.result_value}
            <input type="number" step="any" value={draft.value} onChange={(event) => updateDraft('value', event.target.value)}
              className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="block text-sm font-medium">
            {t.unit}
            <input value={draft.unit} maxLength={24} onChange={(event) => updateDraft('unit', event.target.value)}
              className="mt-1 w-full rounded border p-2" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.reference_low}
            <input type="number" step="any" value={draft.referenceLow} onChange={(event) => updateDraft('referenceLow', event.target.value)}
              className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="block text-sm font-medium">
            {t.reference_high}
            <input type="number" step="any" value={draft.referenceHigh} onChange={(event) => updateDraft('referenceHigh', event.target.value)}
              className="mt-1 w-full rounded border p-2" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t.source}
            <input value={draft.sourceLabel} maxLength={160} onChange={(event) => updateDraft('sourceLabel', event.target.value)}
              className="mt-1 w-full rounded border p-2" />
          </label>
          <label className="block text-sm font-medium">
            {t.sample_date}
            <input type="date" value={draft.sampleDate} onChange={(event) => updateDraft('sampleDate', event.target.value)} dir="ltr"
              className="mt-1 w-full rounded border p-2" />
          </label>
        </div>
        {validationError && <p role="alert" className="text-sm text-red-700">{t.validation_error}</p>}
        <button type="button" onClick={addRecord} disabled={records.length >= 30}
          className="w-full rounded bg-zinc-700 px-4 py-3 font-medium text-white disabled:opacity-50">
          {t.add_record} ({records.length}/30)
        </button>
      </div>

      <section aria-labelledby="tool-024-records-heading" className="mt-7 rounded bg-zinc-50 p-4">
        <h3 id="tool-024-records-heading" className="font-semibold">{t.session_records}</h3>
        {records.length === 0 ? <p className="mt-3 text-sm text-zinc-600">{t.empty}</p> : (
          <ul className="mt-3 space-y-3">
            {records.map((record) => (
              <li key={record.id} className="flex flex-wrap items-start justify-between gap-3 rounded border bg-white p-3">
                <div>
                  <div className="font-medium">{record.markerName}: {record.value} {record.unit}</div>
                  <div className="mt-1 text-sm text-zinc-600">{t.user_interval}: {record.referenceLow}–{record.referenceHigh} {record.unit}</div>
                  <div className="mt-1 text-sm text-zinc-600">{record.sourceLabel} · {record.sampleDate}</div>
                </div>
                <button type="button" onClick={() => removeRecord(record.id)} className="rounded border px-2 py-1 text-sm">{t.remove}</button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={compare} disabled={records.length === 0}
          className="mt-5 w-full rounded bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-50">
          {t.compare}
        </button>
      </section>

      {displayResult && (
        <section aria-labelledby="tool-024-comparison-heading" className="mt-6 rounded border p-4">
          <h3 id="tool-024-comparison-heading" className="font-semibold">{t.comparison_result}</h3>
          <p className="mt-1 text-sm text-zinc-600">{t.calculated_only}</p>
          <ul className="mt-3 space-y-3">
            {displayResult.comparisons.map(({ record, relation }: { record: any; relation: any }) => (
              <li key={record.id} className="rounded bg-zinc-50 p-3">
                <div className="font-medium">{record.markerName}: {record.value} {record.unit}</div>
                <div className="mt-1 text-sm">{t[relation]} ({record.referenceLow}–{record.referenceHigh} {record.unit})</div>
                <div className="mt-1 text-xs text-zinc-500">{t.source}: {record.sourceLabel} · {record.sampleDate}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
