'use client';
/**
 * components/tools/tool-047-fertility-preservation.tsx
 *
 * Tool #047 — Fertility Preservation Guide (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline
 *     (`runFertilityPreservation`), which validates the input and calls the
 *     authoritative V6 engine (`assessFertility`) — the UI never calls the
 *     engine or the legacy adapter directly;
 *   - the tool starts EMPTY: no age, suppression level, HCG answer or planning
 *     horizon is pre-filled, because a fabricated default would be a fabricated
 *     fertility projection;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - a typed `0` planning horizon is a real value ("no horizon stated"), never
 *     "not answered";
 *   - the engine's own protocol hints and warnings are preserved and only
 *     mapped to localisation keys; the UI never invents a threshold, a fertility
 *     treatment, a prescription or a semen-analysis result;
 *   - the legacy adapter's invented `confidence: 0.85` and invented
 *     reference range (`0–95 %`, "documented suppression-severity tiers") are
 *     deliberately NOT reused;
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage (W18). The rating in box 12 is session-only and
 *     says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runFertilityPreservation,
  type FertilityBuildOptions,
} from '@/lib/tools/r6/tool-047-fertility-preservation-pipeline';
import {
  TOOL_047_LIMITS,
  evaluateFertilityDraft,
  formatMonths,
  formatPct,
  suppressionLevelKey,
  type Tool047Draft,
  type Tool047FieldId,
  type Tool047Hcg,
  type Tool047IssueCode,
  type Tool047SuppressionLevel,
  type Tool047UiState,
} from '@/lib/tools/r6/tool-047-fertility-preservation-contract';
import Tool047Genius from './tool-047-fertility-preservation.genius';
import i18nJson from '@/i18n/tool-047-fertility-preservation.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-047-fertility-preservation';

const EMPTY_DRAFT: Tool047Draft = {
  age: '',
  suppressionLevel: '',
  usesHcg: '',
  horizonMonths: '',
};

const STATE_KEY: Record<Tool047UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool047UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool047IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  schema_mismatch: 'error_schema_mismatch',
};

export default function Tool047FertilityPreservation() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool047Draft>(EMPTY_DRAFT);

  const options = useMemo<FertilityBuildOptions>(
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

  const evaluation = evaluateFertilityDraft(draft);
  const run = evaluation.input ? runFertilityPreservation(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool047UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool047FieldId) =>
    evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool047IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool047Draft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const ageIssue = issueFor('age');
  const horizonIssue = issueFor('horizonMonths');

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
          {t.field_age}
          <input
            data-r6-field="age"
            data-r6-slider="true"
            type="number"
            inputMode="decimal"
            min={TOOL_047_LIMITS.ageMin}
            max={TOOL_047_LIMITS.ageMax}
            step={1}
            value={draft.age}
            aria-required="true"
            aria-invalid={ageIssue ? true : undefined}
            aria-describedby={ageIssue ? `${uid}-age-error` : undefined}
            onChange={(event) => setField({ age: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          {ageIssue && (
            <span id={`${uid}-age-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
              {issueMessage(ageIssue.code)}
            </span>
          )}
        </label>

        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_suppression_level}
          <select
            data-r6-field="suppressionLevel"
            aria-required="true"
            value={draft.suppressionLevel}
            onChange={(event) =>
              setField({ suppressionLevel: event.target.value as Tool047SuppressionLevel })
            }
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="1">{t.level_1}</option>
            <option value="2">{t.level_2}</option>
            <option value="3">{t.level_3}</option>
          </select>
        </label>

        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_uses_hcg}
          <select
            data-r6-field="usesHcg"
            aria-required="true"
            value={draft.usesHcg}
            onChange={(event) => setField({ usesHcg: event.target.value as Tool047Hcg })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </label>

        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_horizon_months}
          <input
            data-r6-field="horizonMonths"
            data-r6-slider="true"
            type="number"
            inputMode="decimal"
            min={TOOL_047_LIMITS.horizonMin}
            max={TOOL_047_LIMITS.horizonMax}
            step={1}
            value={draft.horizonMonths}
            aria-required="true"
            aria-invalid={horizonIssue ? true : undefined}
            aria-describedby={horizonIssue ? `${uid}-horizon-error` : undefined}
            onChange={(event) => setField({ horizonMonths: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          {horizonIssue && (
            <span
              id={`${uid}-horizon-error`}
              className="mt-0.5 block text-[10px] font-bold text-red-400"
            >
              {issueMessage(horizonIssue.code)}
            </span>
          )}
        </label>
      </div>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <ul className="list-disc space-y-0.5 ps-4 text-xs font-bold text-red-300">
            {evaluation.issues.map((issue, index) => (
              <li key={`${issue.field}-${issue.code}-${index}`}>{issueMessage(issue.code)}</li>
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
            <span className="block text-[10px] text-zinc-400">{t.kpi_impact}</span>
            <span className="font-mono text-xl font-bold text-amber-300">
              {formatPct(result.fertility_impact_pct)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_recovery}</span>
            <span className="font-mono text-xl font-bold text-lime-300">
              {formatMonths(result.recovery_projection_months)} {t.unit_months}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_within_horizon}</span>
            <span className="text-sm font-bold text-zinc-100">
              {result.within_horizon ? t.yes : t.no}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_level}</span>
            <span className="text-sm font-bold text-zinc-100">
              {t[suppressionLevelKey(evaluation.input?.suppression_level ?? 1)]}
            </span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool047Genius
        locale={locale}
        state={uiState}
        draft={draft}
        input={evaluation.input}
        output={run?.ok ? run.output : null}
        options={options}
        prevTool={{
          slug: neighbors.prevTool.slug,
          titleEn: neighbors.prevTool.titleEn,
          titleAr: neighbors.prevTool.titleAr,
        }}
        nextTool={{
          slug: neighbors.nextTool.slug,
          titleEn: neighbors.nextTool.titleEn,
          titleAr: neighbors.nextTool.titleAr,
        }}
      />

      <p className="mt-4 text-[10px] text-zinc-600">
        {tool.toolId} · v{tool.version}
      </p>
    </section>
  );
}
