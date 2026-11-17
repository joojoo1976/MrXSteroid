'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runSideEffectEarlyWarning, type SideEffectEarlyWarningBuildOptions } from '@/lib/tools/r6/tool-029-side-effect-early-warning-pipeline';
import {
  evaluateDraftReading,
  evaluateSession,
  buildReadingFromDraft,
  type Tool029Draft,
  type Tool029UiState,
  type MeasurementReading,
} from '@/lib/tools/r6/tool-029-side-effect-early-warning-contract';
import Tool029Genius from './tool-029-side-effect-early-warning.genius';
import i18nJson from '@/i18n/tool-029-side-effect-early-warning.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-029-side-effect-early-warning';
const EMPTY_DRAFT: Tool029Draft = { date: '', metric: 'blood_pressure', systolicMmHg: '', diastolicMmHg: '', beatsPerMinute: '', sourceLabel: '' };
const STATE_KEY: Record<Tool029UiState, string> = { EMPTY:'state_empty', PARTIAL:'state_partial', FULL:'state_full', INVALID:'state_invalid', DEGRADED:'state_degraded' };
const HINT_KEY: Record<Tool029UiState, string> = { EMPTY:'state_hint_empty', PARTIAL:'state_hint_partial', FULL:'state_hint_full', INVALID:'state_hint_invalid', DEGRADED:'state_hint_degraded' };

export default function Tool029MeasurementSummary() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool029Draft>(EMPTY_DRAFT);
  const [readings, setReadings] = useState<MeasurementReading[]>([]);

  const options = useMemo<SideEffectEarlyWarningBuildOptions>(
    () => ({ calculatedAt: new Date().toISOString(), recordedAt: new Date().toISOString(), locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual' }),
    [locale, unitSystem],
  );

  const evaluation = evaluateSession(readings, draft);
  const run = evaluation.input ? runSideEffectEarlyWarning(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;
  const uiState: Tool029UiState = evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const draftEval = evaluateDraftReading(draft);
  const canAdd = draftEval.valid && readings.length < 200;

  const addReading = () => {
    if (!canAdd) return;
    const reading = buildReadingFromDraft(draft);
    if (!reading) return;
    setReadings((prev) => [...prev, reading]);
    setDraft(EMPTY_DRAFT);
  };
  const removeReading = (id: string) => setReadings((prev) => prev.filter((r) => r.id !== id));
  const setField = (patch: Partial<Tool029Draft>) => setDraft((p) => ({ ...p, ...patch }));

  const fmt = (v: number) => new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 }).format(v);

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl px-4 py-6" aria-labelledby={`${uid}-title`} data-r6-tool={TOOL_SLUG}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 id={`${uid}-title`} className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div data-r6-state={uiState} aria-live="polite" className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {t.state_label}: {t[STATE_KEY[uiState]]}
        </div>
      </div>
      <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{t[HINT_KEY[uiState]]}</p>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">{t.scope_note}</p>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-[10px] font-bold text-zinc-500">{t.reading_date}
          <input data-r6-field="date" type="date" value={draft.date} onChange={(e) => setField({ date: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.measurement_type}
          <select data-r6-field="metric" value={draft.metric} onChange={(e) => setField({ metric: e.target.value as Tool029Draft['metric'] })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white">
            <option value="blood_pressure">{t.blood_pressure}</option>
            <option value="pulse">{t.pulse}</option>
          </select>
        </label>
        {draft.metric === 'blood_pressure' ? (<>
          <label className="text-[10px] font-bold text-zinc-500">{t.systolic}
            <input data-r6-field="systolicMmHg" type="number" step="any" value={draft.systolicMmHg} onChange={(e) => setField({ systolicMmHg: e.target.value })}
              className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
          </label>
          <label className="text-[10px] font-bold text-zinc-500">{t.diastolic}
            <input data-r6-field="diastolicMmHg" type="number" step="any" value={draft.diastolicMmHg} onChange={(e) => setField({ diastolicMmHg: e.target.value })}
              className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
          </label>
        </>) : (
          <label className="text-[10px] font-bold text-zinc-500">{t.pulse_value}
            <input data-r6-field="beatsPerMinute" type="number" step="any" value={draft.beatsPerMinute} onChange={(e) => setField({ beatsPerMinute: e.target.value })}
              className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
          </label>
        )}
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">{t.source_label}
          <input data-r6-field="sourceLabel" type="text" maxLength={160} value={draft.sourceLabel} onChange={(e) => setField({ sourceLabel: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
      </div>
      <button type="button" onClick={addReading} disabled={!canAdd} className="mb-4 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40">{t.add_reading} ({readings.length}/200)</button>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-xs font-bold text-red-300">{t.validation_error}</p>
        </div>
      )}

      {uiState === 'FULL' && result && (
        <div data-r6-summary="full" className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-bold text-zinc-100">{t.descriptive_summary}</p>
          <p className="mt-1 text-xs text-zinc-400">{result.readings.length} {t.observation_count}</p>
          <ul className="mt-2 space-y-2">{result.summaries.map((s) => (
            <li key={s.metric} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-xs text-zinc-200">
              <span className="font-bold">{t[s.metric] ?? s.metric}</span>: {t.minimum} {fmt(s.minimum)} · {t.maximum} {fmt(s.maximum)} · {t.arithmetic_mean} {fmt(s.arithmeticMean)} {s.unit}
            </li>
          ))}</ul>
        </div>
      )}
      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">{t.state_hint_degraded}</div>
      )}

      <Tool029Genius
        locale={locale}
        state={uiState}
        readings={readings}
        result={result}
        output={run?.ok ? run.output : null}
        options={options}
        prevTool={{ slug: neighbors.prevTool.slug, titleEn: neighbors.prevTool.titleEn, titleAr: neighbors.prevTool.titleAr }}
        nextTool={{ slug: neighbors.nextTool.slug, titleEn: neighbors.nextTool.titleEn, titleAr: neighbors.nextTool.titleAr }}
        onRemove={removeReading}
        t={t}
        fmt={fmt}
      />

      <p className="mt-4 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </section>
  );
}
