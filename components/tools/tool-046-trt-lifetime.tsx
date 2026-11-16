'use client';
/**
 * components/tools/tool-046-trt-lifetime.tsx
 *
 * Tool #046 — TRT Lifetime Calculator (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline (`runTrtLifetime`), which
 *     validates the input and calls the authoritative V6 engine
 *     (`projectTrtLifetime`) — the UI never calls the engine or the legacy
 *     adapter directly;
 *   - the tool starts EMPTY: no age, method, weekly dose, years on TRT or cost
 *     is pre-filled, because a fabricated default would be a fabricated
 *     projection;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - a typed `0` (years on TRT, a cost) is a real value, never "not answered";
 *   - the engine's own warnings are preserved; nothing here invents a cost
 *     range, a dosing change, a diagnosis or a new threshold;
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage (W18). The rating in box 12 is session-only and
 *     says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runTrtLifetime,
  type TrtLifetimeBuildOptions,
} from '@/lib/tools/r6/tool-046-trt-lifetime-pipeline';
import {
  TOOL_046_LIMITS,
  ageBandLabelKey,
  evaluateTrtLifetimeDraft,
  formatCount,
  formatInterval,
  formatUsd,
  type Tool046Draft,
  type Tool046FieldId,
  type Tool046IssueCode,
  type Tool046Method,
  type Tool046UiState,
} from '@/lib/tools/r6/tool-046-trt-lifetime-contract';
import Tool046Genius from './tool-046-trt-lifetime.genius';
import i18nJson from '@/i18n/tool-046-trt-lifetime.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-046-trt-lifetime';

const EMPTY_DRAFT: Tool046Draft = {
  age: '',
  method: '',
  weeklyMg: '',
  yearsOnTrt: '',
  monthlyCost: '',
  monitoringCost: '',
};

const STATE_KEY: Record<Tool046UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool046UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool046IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  schema_mismatch: 'error_schema_mismatch',
};

export default function Tool046TrtLifetime() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool046Draft>(EMPTY_DRAFT);

  const options = useMemo<TrtLifetimeBuildOptions>(
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

  const evaluation = evaluateTrtLifetimeDraft(draft);
  const run = evaluation.input ? runTrtLifetime(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool046UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool046FieldId) =>
    evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool046IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool046Draft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const numericField = (
    field: Tool046FieldId,
    labelKey: string,
    min: number,
    max: number,
    step: number,
  ) => {
    const issue = issueFor(field);
    return (
      <label className="text-[10px] font-bold text-zinc-500">
        {t[labelKey]}
        <input
          data-r6-field={field}
          data-r6-slider="true"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft[field]}
          aria-required="true"
          aria-invalid={issue ? true : undefined}
          aria-describedby={issue ? `${uid}-${field}-error` : undefined}
          onChange={(event) => setField({ [field]: event.target.value } as Partial<Tool046Draft>)}
          className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
        />
        {issue && (
          <span id={`${uid}-${field}-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
            {issueMessage(issue.code)}
          </span>
        )}
      </label>
    );
  };

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

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {numericField('age', 'field_age', TOOL_046_LIMITS.ageMin, TOOL_046_LIMITS.ageMax, 1)}

        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_method}
          <select
            data-r6-field="method"
            aria-required="true"
            value={draft.method}
            onChange={(event) => setField({ method: event.target.value as Tool046Method })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="injection">{t.method_injection}</option>
            <option value="gel">{t.method_gel}</option>
            <option value="cream">{t.method_cream}</option>
          </select>
        </label>

        {numericField(
          'weeklyMg',
          'field_weekly_mg',
          TOOL_046_LIMITS.weeklyMgMin,
          TOOL_046_LIMITS.weeklyMgMax,
          10,
        )}
        {numericField(
          'yearsOnTrt',
          'field_years_on_trt',
          TOOL_046_LIMITS.yearsOnTrtMin,
          TOOL_046_LIMITS.yearsOnTrtMax,
          0.5,
        )}
        {numericField(
          'monthlyCost',
          'field_monthly_cost',
          TOOL_046_LIMITS.monthlyCostMin,
          TOOL_046_LIMITS.monthlyCostMax,
          5,
        )}
        {numericField(
          'monitoringCost',
          'field_monitoring_cost',
          TOOL_046_LIMITS.monitoringCostMin,
          TOOL_046_LIMITS.monitoringCostMax,
          50,
        )}
      </div>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <ul className="list-disc space-y-0.5 ps-4 text-xs font-bold text-red-300">
            {evaluation.issues.map((issue, index) => (
              <li key={`${issue.field}-${issue.code}-${index}`}>
                {issueMessage(issue.code)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {uiState === 'FULL' && result && (
        <div
          data-r6-summary="full"
          className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center md:grid-cols-3"
        >
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_interval}</span>
            <span className="font-mono text-xl font-bold text-lime-300">
              {formatInterval(result.injection_interval_days)} {t.unit_days}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_panels}</span>
            <span className="font-mono text-xl font-bold text-lime-300">
              {formatCount(result.annual_bloodwork_panels)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_age_band}</span>
            <span className="text-sm font-bold text-zinc-100">{t[ageBandLabelKey(result.age_band)]}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.cost_10}</span>
            <span className="font-mono text-lg font-bold text-cyan-300">
              {formatUsd(result.cost_projection.horizon10.total_cost_usd)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.cost_20}</span>
            <span className="font-mono text-lg font-bold text-cyan-300">
              {formatUsd(result.cost_projection.horizon20.total_cost_usd)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.cost_30}</span>
            <span className="font-mono text-lg font-bold text-cyan-300">
              {formatUsd(result.cost_projection.horizon30.total_cost_usd)}
            </span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool046Genius
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
