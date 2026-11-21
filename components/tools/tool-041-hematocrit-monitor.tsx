'use client';
/**
 * components/tools/tool-041-hematocrit-monitor.tsx
 *
 * Tool #041 — Hematocrit Monitor (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline
 *     (`runHematocritMonitor`), which validates the input and calls the
 *     authoritative V6 engine (`monitorHematocrit`) — the UI never calls the
 *     engine or the legacy adapter directly;
 *   - the tool starts EMPTY: no reading, date, sex, cycle status or week count
 *     is pre-filled, because a fabricated default would be a fabricated result;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage (W18). The rating in box 12 is session-only and
 *     says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runHematocritMonitor,
  type HematocritMonitorBuildOptions,
} from '@/lib/tools/r6/tool-041-hematocrit-monitor-pipeline';
import {
  TOOL_041_LIMITS,
  bandLabelKey,
  evaluateHematocritDraft,
  type Tool041Draft,
  type Tool041IssueCode,
  type Tool041ReadingDraft,
  type Tool041UiState,
} from '@/lib/tools/r6/tool-041-hematocrit-monitor-contract';
import Tool041Genius from './tool-041-hematocrit-monitor.genius';
import i18nJson from '@/i18n/tool-041-hematocrit-monitor.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-041-hematocrit-monitor';

const EMPTY_DRAFT: Tool041Draft = {
  readings: [
    { value: '', date: '' },
    { value: '', date: '' },
  ],
  sex: '',
  onCycle: '',
  weeksRemaining: '',
};

const STATE_KEY: Record<Tool041UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool041UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool041IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  invalid_date: 'error_invalid_date',
  required: 'error_required',
};

const BAND_TONE: Record<string, string> = {
  normal: 'text-lime-400',
  borderline: 'text-amber-400',
  high: 'text-orange-400',
  'very-high': 'text-red-400',
};

export default function Tool041HematocritMonitor() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool041Draft>(EMPTY_DRAFT);

  const options = useMemo<HematocritMonitorBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale,
      unitSystem,
      snapshotType: 'submitted_snapshot',
      timezone: 'UTC',
      source: 'manual',
    }),
    [locale, unitSystem],
  );

  const evaluation = evaluateHematocritDraft(draft);
  const run = evaluation.input ? runHematocritMonitor(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;
  const engineDegraded = Boolean(run && (!run.ok || run.output.result.warnings.includes('no_valid_readings')));

  const uiState: Tool041UiState =
    evaluation.state === 'READY' ? (engineDegraded ? 'DEGRADED' : 'FULL') : evaluation.state;

  const setReading = (index: number, patch: Partial<Tool041ReadingDraft>) => {
    setDraft((previous) => ({
      ...previous,
      readings: previous.readings.map((reading, i) => (i === index ? { ...reading, ...patch } : reading)),
    }));
  };

  const addReading = () => {
    setDraft((previous) =>
      previous.readings.length >= TOOL_041_LIMITS.maxReadings
        ? previous
        : { ...previous, readings: [...previous.readings, { value: '', date: '' }] },
    );
  };

  const removeReading = (index: number) => {
    setDraft((previous) =>
      previous.readings.length <= 1
        ? previous
        : { ...previous, readings: previous.readings.filter((_, i) => i !== index) },
    );
  };

  const issueFor = (readingIndex: number | null, field: 'hct' | 'date') =>
    evaluation.issues.find((issue) => issue.readingIndex === readingIndex && issue.field === field);

  const issueMessage = (code: Tool041IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mx-auto max-w-5xl px-4 py-6"
      aria-labelledby={`${uid}-title`}
      data-r6-tool={TOOL_SLUG}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 id={`${uid}-title`} className="text-2xl font-black text-zinc-900 dark:text-white">
          {t.tool_name}
        </h1>
        <div
          data-r6-state={uiState}
          aria-live="polite"
          className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {t.state_label}: {t[STATE_KEY[uiState]]}
        </div>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{t[HINT_KEY[uiState]]}</p>

      <fieldset className="mb-3">
        <legend className="mb-2 text-sm font-black text-zinc-700 dark:text-zinc-200">{t.readings}</legend>
        <div className="space-y-2">
          {draft.readings.map((reading, index) => {
            const hctIssue = issueFor(index, 'hct');
            const dateIssue = issueFor(index, 'date');
            return (
              <div
                key={index}
                className="grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 md:grid-cols-3"
              >
                <label className="text-[10px] font-bold text-zinc-500">
                  {t.reading_label} {index + 1} — {t.hct}
                  <input
                    data-r6-field="hct"
                    data-r6-slider="true"
                    type="number"
                    inputMode="decimal"
                    min={TOOL_041_LIMITS.inputMin}
                    max={TOOL_041_LIMITS.inputMax}
                    step={0.1}
                    value={reading.value}
                    aria-required="true"
                    aria-invalid={hctIssue ? true : undefined}
                    aria-describedby={hctIssue ? `${uid}-hct-${index}-error` : undefined}
                    onChange={(event) => setReading(index, { value: event.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
                  />
                  {hctIssue && (
                    <span id={`${uid}-hct-${index}-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
                      {issueMessage(hctIssue.code)}
                    </span>
                  )}
                </label>
                <label className="text-[10px] font-bold text-zinc-500">
                  {t.reading_label} {index + 1} — {t.date}
                  <input
                    data-r6-field="date"
                    type="date"
                    value={reading.date}
                    aria-required="true"
                    aria-invalid={dateIssue ? true : undefined}
                    aria-describedby={dateIssue ? `${uid}-date-${index}-error` : undefined}
                    onChange={(event) => setReading(index, { date: event.target.value })}
                    className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
                  />
                  {dateIssue && (
                    <span id={`${uid}-date-${index}-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
                      {issueMessage(dateIssue.code)}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => removeReading(index)}
                  disabled={draft.readings.length <= 1}
                  aria-label={`${t.remove_reading} ${index + 1}`}
                  className="self-end text-xs text-red-400 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addReading}
          disabled={draft.readings.length >= TOOL_041_LIMITS.maxReadings}
          className="mt-3 rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
        >
          + {t.add_reading}
        </button>
      </fieldset>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-[10px] font-bold text-zinc-500">
          {t.sex}
          <select
            data-r6-field="sex"
            aria-required="true"
            value={draft.sex}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, sex: event.target.value as Tool041Draft['sex'] }))
            }
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.weeks_remaining}
          <input
            data-r6-field="weeks"
            data-r6-slider="true"
            type="number"
            inputMode="numeric"
            min={0}
            max={52}
            step={1}
            aria-required="true"
            value={draft.weeksRemaining}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, weeksRemaining: event.target.value }))
            }
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.on_cycle}
          <select
            data-r6-field="on-cycle"
            aria-required="true"
            value={draft.onCycle}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, onCycle: event.target.value as Tool041Draft['onCycle'] }))
            }
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </label>
      </div>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <ul className="list-disc space-y-0.5 ps-4 text-xs font-bold text-red-300">
            {evaluation.issues.map((issue, index) => (
              <li key={`${issue.field}-${issue.readingIndex ?? 'context'}-${index}`}>{issueMessage(issue.code)}</li>
            ))}
          </ul>
        </div>
      )}

      {uiState === 'FULL' && result && (
        <div
          data-r6-summary="full"
          className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center md:grid-cols-4"
        >
          <div>
            <span className="block text-[10px] text-zinc-400">{t.hct}</span>
            <span className="font-mono text-2xl font-black text-white">
              {result.latest_hct_pct.toFixed(1)}
              {t.unit_pct}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.band}</span>
            <span className={`font-mono text-xl font-bold ${BAND_TONE[result.band] ?? 'text-zinc-300'}`}>
              {t[bandLabelKey(result.band)]}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.trend}</span>
            <span className="font-mono text-xl font-bold text-zinc-100">
              {result.slope_per_30d >= 0 ? '+' : ''}
              {result.slope_per_30d.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.warnings}</span>
            <span className="font-mono text-xl font-bold text-amber-300">{result.warnings.length}</span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool041Genius
        locale={locale}
        state={uiState}
        draft={draft}
        input={evaluation.input}
        output={run?.ok ? run.output : null}
        options={options}
        prevTool={{ slug: neighbors.prevTool.slug, titleEn: neighbors.prevTool.titleEn, titleAr: neighbors.prevTool.titleAr }}
        nextTool={{ slug: neighbors.nextTool.slug, titleEn: neighbors.nextTool.titleEn, titleAr: neighbors.nextTool.titleAr }}
      />

      <p className="mt-4 text-[10px] text-zinc-600">
        {tool.toolId} · v{tool.version}
      </p>
    </section>
  );
}
