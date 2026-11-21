'use client';
/**
 * components/tools/tool-049-bone-density.tsx
 *
 * Tool #049 — Bone Density Optimizer (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline (`runBoneDensity`), which
 *     validates the input and calls the authoritative V6 engine
 *     (`assessBoneDensity`) — the UI never calls the engine or the legacy
 *     adapter directly;
 *   - the tool starts EMPTY: no age, sex, AI-exposure years, resistance
 *     sessions, calcium, vitamin D or smoking answer is pre-filled, because a
 *     fabricated default would be a fabricated bone-health score;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - a typed `0` (for AI years, resistance sessions, calcium, vitamin D) is a
 *     real value, never "not answered";
 *   - the engine's own risk factors, interventions and warnings are preserved
 *     and only mapped to localisation keys; the UI never invents a threshold,
 *     a medication, a diagnosis or a treatment plan;
 *   - the legacy adapter's invented confidence (0.9) and invented reference
 *     range (0–100, "educational screening band") are deliberately NOT reused;
 *   - the engine is educational screening, explicitly NOT a DXA diagnosis, and
 *     the UI says so on every result;
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage (W18). The rating in box 12 is session-only
 *     and says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runBoneDensity,
  type BoneDensityBuildOptions,
} from '@/lib/tools/r6/tool-049-bone-density-pipeline';
import {
  TOOL_049_LIMITS,
  bandLabelKey,
  evaluateBoneDensityDraft,
  formatScore,
  type Tool049Bool,
  type Tool049Draft,
  type Tool049FieldId,
  type Tool049IssueCode,
  type Tool049Sex,
  type Tool049UiState,
} from '@/lib/tools/r6/tool-049-bone-density-contract';
import Tool049Genius from './tool-049-bone-density.genius';
import i18nJson from '@/i18n/tool-049-bone-density.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-049-bone-density';

const EMPTY_DRAFT: Tool049Draft = {
  age: '',
  sex: '',
  usesAiYears: '',
  weeklyResistance: '',
  calciumMg: '',
  vitaminD: '',
  smoker: '',
};

const STATE_KEY: Record<Tool049UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool049UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool049IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  schema_mismatch: 'error_schema_mismatch',
};

export default function Tool049BoneDensity() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool049Draft>(EMPTY_DRAFT);

  const options = useMemo<BoneDensityBuildOptions>(
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

  const evaluation = evaluateBoneDensityDraft(draft);
  const run = evaluation.input ? runBoneDensity(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool049UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool049FieldId) => evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool049IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool049Draft>) => setDraft((previous) => ({ ...previous, ...patch }));

  const numericField = (
    fieldId: Tool049FieldId,
    labelKey: string,
    min: number,
    max: number,
    step: number,
  ) => {
    const issue = issueFor(fieldId);
    return (
      <label className="text-[10px] font-bold text-zinc-500">
        {t[labelKey]}
        <input
          data-r6-field={fieldId}
          data-r6-slider="true"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={draft[fieldId]}
          aria-required="true"
          aria-invalid={issue ? true : undefined}
          aria-describedby={issue ? `${uid}-${fieldId}-error` : undefined}
          onChange={(event) => setField({ [fieldId]: event.target.value } as Partial<Tool049Draft>)}
          className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
        />
        {issue && (
          <span id={`${uid}-${fieldId}-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
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
        {numericField('age', 'field_age', TOOL_049_LIMITS.ageMin, TOOL_049_LIMITS.ageMax, 1)}
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_sex}
          <select
            data-r6-field="sex"
            aria-required="true"
            value={draft.sex}
            onChange={(event) => setField({ sex: event.target.value as Tool049Sex })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="male">{t.sex_male}</option>
            <option value="female">{t.sex_female}</option>
          </select>
        </label>
        {numericField(
          'usesAiYears',
          'field_uses_ai_years',
          TOOL_049_LIMITS.usesAiYearsMin,
          TOOL_049_LIMITS.usesAiYearsMax,
          0.5,
        )}
        {numericField(
          'weeklyResistance',
          'field_weekly_resistance',
          TOOL_049_LIMITS.weeklyResistanceMin,
          TOOL_049_LIMITS.weeklyResistanceMax,
          1,
        )}
        {numericField(
          'calciumMg',
          'field_calcium',
          TOOL_049_LIMITS.calciumMgMin,
          TOOL_049_LIMITS.calciumMgMax,
          1,
        )}
        {numericField(
          'vitaminD',
          'field_vitamin_d',
          TOOL_049_LIMITS.vitaminDMin,
          TOOL_049_LIMITS.vitaminDMax,
          1,
        )}
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_smoker}
          <select
            data-r6-field="smoker"
            aria-required="true"
            value={draft.smoker}
            onChange={(event) => setField({ smoker: event.target.value as Tool049Bool })}
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
            <span className="block text-[10px] text-zinc-400">{t.kpi_score}</span>
            <span className="font-mono text-xl font-bold text-lime-300">
              {formatScore(result.bone_health_score)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_band}</span>
            <span className="text-sm font-bold text-zinc-100">{t[bandLabelKey(result.band)]}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_risk_factors}</span>
            <span className="font-mono text-xl font-bold text-amber-300">
              {result.risk_factors.length}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_interventions}</span>
            <span className="font-mono text-xl font-bold text-cyan-300">
              {result.interventions.length}
            </span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool049Genius
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
