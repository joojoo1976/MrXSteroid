'use client';
/**
 * components/tools/tool-045-cycle-break-planner.tsx
 *
 * Tool #045 — Cycle Break Planner (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline
 *     (`runCycleBreakPlanner`), which validates the input and calls the
 *     authoritative V6 engine (`planCycleBreak`) — the UI never calls the
 *     engine or the legacy adapter directly;
 *   - the tool starts EMPTY: no cycle length, compound name, half-life,
 *     suppression estimate or bloodwork answer is pre-filled, because a
 *     fabricated default would be a fabricated plan;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - the engine's own warnings are preserved; nothing here invents a PCT drug,
 *     a dose, a diagnosis or a new threshold;
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage (W18). The rating in box 12 is session-only and
 *     says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runCycleBreakPlanner,
  type CycleBreakBuildOptions,
} from '@/lib/tools/r6/tool-045-cycle-break-planner-pipeline';
import {
  TOOL_045_LIMITS,
  evaluateCycleBreakDraft,
  formatDays,
  formatWeeks,
  type Tool045Draft,
  type Tool045FieldId,
  type Tool045IssueCode,
  type Tool045UiState,
} from '@/lib/tools/r6/tool-045-cycle-break-planner-contract';
import Tool045Genius from './tool-045-cycle-break-planner.genius';
import i18nJson from '@/i18n/tool-045-cycle-break-planner.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-045-cycle-break-planner';

const emptyCompound = (): Tool045Draft['compounds'][number] => ({
  name: '',
  halfLife: '',
  suppression: '',
});

const EMPTY_DRAFT: Tool045Draft = {
  cycleWeeks: '',
  compounds: [emptyCompound()],
  wantsBloodwork: '',
};

const STATE_KEY: Record<Tool045UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool045UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool045IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
};

export default function Tool045CycleBreakPlanner() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool045Draft>(EMPTY_DRAFT);

  const options = useMemo<CycleBreakBuildOptions>(
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

  const evaluation = evaluateCycleBreakDraft(draft);
  const run = evaluation.input ? runCycleBreakPlanner(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool045UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool045FieldId, compoundIndex: number | null = null) =>
    evaluation.issues.find(
      (issue) => issue.field === field && issue.compoundIndex === compoundIndex,
    );

  const issueMessage = (code: Tool045IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool045Draft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const setCompound = (index: number, patch: Partial<Tool045Draft['compounds'][number]>) =>
    setDraft((previous) => ({
      ...previous,
      compounds: previous.compounds.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    }));

  const addCompound = () =>
    setDraft((previous) =>
      previous.compounds.length >= TOOL_045_LIMITS.maxCompounds
        ? previous
        : { ...previous, compounds: [...previous.compounds, emptyCompound()] },
    );

  const removeCompound = (index: number) =>
    setDraft((previous) =>
      previous.compounds.length <= 1
        ? previous
        : { ...previous, compounds: previous.compounds.filter((_, rowIndex) => rowIndex !== index) },
    );

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

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_cycle_weeks}
          <input
            data-r6-field="cycle-weeks"
            data-r6-slider="true"
            type="number"
            inputMode="numeric"
            min={TOOL_045_LIMITS.cycleWeeksMin}
            max={TOOL_045_LIMITS.cycleWeeksMax}
            step={1}
            value={draft.cycleWeeks}
            aria-required="true"
            aria-invalid={issueFor('cycleWeeks') ? true : undefined}
            aria-describedby={issueFor('cycleWeeks') ? `${uid}-cycle-weeks-error` : undefined}
            onChange={(event) => setField({ cycleWeeks: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          {issueFor('cycleWeeks') && (
            <span id={`${uid}-cycle-weeks-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
              {issueMessage(issueFor('cycleWeeks')!.code)}
            </span>
          )}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_wants_bloodwork}
          <select
            data-r6-field="wants-bloodwork"
            aria-required="true"
            value={draft.wantsBloodwork}
            onChange={(event) =>
              setField({ wantsBloodwork: event.target.value as Tool045Draft['wantsBloodwork'] })
            }
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </label>
      </div>

      <fieldset className="mb-3">
        <legend className="mb-1 text-sm font-black text-zinc-700 dark:text-zinc-200">
          {t.compounds_title}
        </legend>
        <p className="mb-2 text-[10px] text-zinc-500">{t.compounds_hint}</p>
        <div className="space-y-2">
          {draft.compounds.map((row, index) => (
            <div
              key={index}
              data-r6-compound={String(index)}
              className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 md:grid-cols-4"
            >
              <label className="text-[10px] font-bold text-zinc-500">
                {t.field_compound_name}
                <input
                  data-r6-field={`compound-name-${index}`}
                  type="text"
                  value={row.name}
                  aria-required="true"
                  aria-invalid={issueFor('compoundName', index) ? true : undefined}
                  aria-describedby={
                    issueFor('compoundName', index) ? `${uid}-compound-name-${index}-error` : undefined
                  }
                  onChange={(event) => setCompound(index, { name: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
                />
                {issueFor('compoundName', index) && (
                  <span
                    id={`${uid}-compound-name-${index}-error`}
                    className="mt-0.5 block text-[10px] font-bold text-red-400"
                  >
                    {issueMessage(issueFor('compoundName', index)!.code)}
                  </span>
                )}
              </label>
              <label className="text-[10px] font-bold text-zinc-500">
                {t.field_half_life}
                <input
                  data-r6-field={`half-life-${index}`}
                  data-r6-slider="true"
                  type="number"
                  inputMode="decimal"
                  min={TOOL_045_LIMITS.halfLifeMin}
                  max={TOOL_045_LIMITS.halfLifeMax}
                  step={0.5}
                  value={row.halfLife}
                  aria-required="true"
                  aria-invalid={issueFor('halfLife', index) ? true : undefined}
                  aria-describedby={
                    issueFor('halfLife', index) ? `${uid}-half-life-${index}-error` : undefined
                  }
                  onChange={(event) => setCompound(index, { halfLife: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
                />
                {issueFor('halfLife', index) && (
                  <span
                    id={`${uid}-half-life-${index}-error`}
                    className="mt-0.5 block text-[10px] font-bold text-red-400"
                  >
                    {issueMessage(issueFor('halfLife', index)!.code)}
                  </span>
                )}
              </label>
              <label className="text-[10px] font-bold text-zinc-500">
                {t.field_suppression}
                <select
                  data-r6-field={`suppression-${index}`}
                  aria-required="true"
                  value={row.suppression}
                  onChange={(event) =>
                    setCompound(index, {
                      suppression: event.target.value as Tool045Draft['compounds'][number]['suppression'],
                    })
                  }
                  className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
                >
                  <option value="">{t.not_answered}</option>
                  <option value="1">{t.suppression_1}</option>
                  <option value="2">{t.suppression_2}</option>
                  <option value="3">{t.suppression_3}</option>
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  data-r6-action={`remove-compound-${index}`}
                  aria-label={`${t.remove_compound} ${index + 1}`}
                  disabled={draft.compounds.length <= 1}
                  onClick={() => removeCompound(index)}
                  className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs font-bold text-red-300 disabled:opacity-30"
                >
                  {t.remove_compound}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          data-r6-action="add-compound"
          disabled={draft.compounds.length >= TOOL_045_LIMITS.maxCompounds}
          onClick={addCompound}
          className="mt-2 rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
        >
          + {t.add_compound}
        </button>
      </fieldset>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <ul className="list-disc space-y-0.5 ps-4 text-xs font-bold text-red-300">
            {evaluation.issues.map((issue, index) => (
              <li key={`${issue.field}-${issue.compoundIndex ?? 'top'}-${issue.code}-${index}`}>
                {issueMessage(issue.code)}
              </li>
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
            <span className="block text-[10px] text-zinc-400">{t.clear_days}</span>
            <span className="font-mono text-2xl font-black text-lime-300">
              {formatDays(result.days_to_full_clear)} {t.unit_days}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.pct_start_day}</span>
            <span className="font-mono text-xl font-bold text-amber-300">
              D+{formatDays(result.pct_start_day)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.pct_duration}</span>
            <span className="font-mono text-xl font-bold text-amber-300">
              {formatWeeks(result.pct_duration_weeks)} {t.unit_weeks}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.baseline_weeks}</span>
            <span className="font-mono text-xl font-bold text-cyan-300">
              {formatWeeks(result.total_weeks_to_baseline)} {t.unit_weeks}
            </span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool045Genius
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
