'use client';
/**
 * components/tools/tool-042-estrogen-management.tsx
 *
 * Tool #042 — Estrogen Management Pro (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline
 *     (`runEstrogenManagement`), which validates the input and calls the
 *     authoritative V6 engine (`manageEstrogen`) — the UI never calls the
 *     engine or the legacy adapter directly;
 *   - the tool starts EMPTY: no E2 value, testosterone dose, AI status, AI
 *     dose, body-fat percentage or symptom is pre-filled, because a fabricated
 *     default would be a fabricated result;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - the engine's own warnings and AI-delta hints are preserved; nothing here
 *     invents a dose, a diagnosis or a new threshold;
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage (W18). The rating in box 12 is session-only and
 *     says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runEstrogenManagement,
  type EstrogenManagementBuildOptions,
} from '@/lib/tools/r6/tool-042-estrogen-management-pipeline';
import {
  TOOL_042_LIMITS,
  TOOL_042_SYMPTOMS,
  actionLabelKey,
  bandLabelKey,
  evaluateEstrogenDraft,
  formatAiDelta,
  formatE2,
  symptomLabelKey,
  type Tool042Draft,
  type Tool042FieldId,
  type Tool042IssueCode,
  type Tool042UiState,
} from '@/lib/tools/r6/tool-042-estrogen-management-contract';
import Tool042Genius from './tool-042-estrogen-management.genius';
import i18nJson from '@/i18n/tool-042-estrogen-management.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-042-estrogen-management';

const EMPTY_DRAFT: Tool042Draft = {
  e2: '',
  weeklyTest: '',
  takingAi: '',
  aiDose: '',
  bodyFat: '',
  symptoms: [],
};

const STATE_KEY: Record<Tool042UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool042UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool042IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  not_applicable: 'error_not_applicable',
};

const BAND_TONE: Record<string, string> = {
  low: 'text-cyan-400',
  optimal: 'text-lime-400',
  elevated: 'text-amber-400',
  high: 'text-red-400',
};

export default function Tool042EstrogenManagement() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool042Draft>(EMPTY_DRAFT);

  const options = useMemo<EstrogenManagementBuildOptions>(
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

  const evaluation = evaluateEstrogenDraft(draft);
  const run = evaluation.input ? runEstrogenManagement(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool042UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool042FieldId) =>
    evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool042IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool042Draft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const toggleSymptom = (symptom: (typeof TOOL_042_SYMPTOMS)[number]) =>
    setDraft((previous) => ({
      ...previous,
      symptoms: previous.symptoms.includes(symptom)
        ? previous.symptoms.filter((entry) => entry !== symptom)
        : [...previous.symptoms, symptom],
    }));

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
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_e2}
          <input
            data-r6-field="e2"
            data-r6-slider="true"
            type="number"
            inputMode="decimal"
            min={TOOL_042_LIMITS.e2Min}
            max={TOOL_042_LIMITS.e2Max}
            step={0.1}
            value={draft.e2}
            aria-required="true"
            aria-invalid={issueFor('e2') ? true : undefined}
            aria-describedby={issueFor('e2') ? `${uid}-e2-error` : undefined}
            onChange={(event) => setField({ e2: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          {issueFor('e2') && (
            <span id={`${uid}-e2-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
              {issueMessage(issueFor('e2')!.code)}
            </span>
          )}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_weekly_test}
          <input
            data-r6-field="weekly-test"
            data-r6-slider="true"
            type="number"
            inputMode="decimal"
            min={TOOL_042_LIMITS.weeklyTestMin}
            max={TOOL_042_LIMITS.weeklyTestMax}
            step={1}
            value={draft.weeklyTest}
            aria-required="true"
            aria-invalid={issueFor('weeklyTest') ? true : undefined}
            aria-describedby={issueFor('weeklyTest') ? `${uid}-weekly-test-error` : undefined}
            onChange={(event) => setField({ weeklyTest: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          {issueFor('weeklyTest') && (
            <span
              id={`${uid}-weekly-test-error`}
              className="mt-0.5 block text-[10px] font-bold text-red-400"
            >
              {issueMessage(issueFor('weeklyTest')!.code)}
            </span>
          )}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_body_fat}
          <input
            data-r6-field="body-fat"
            data-r6-slider="true"
            type="number"
            inputMode="decimal"
            min={TOOL_042_LIMITS.bodyFatMin}
            max={TOOL_042_LIMITS.bodyFatMax}
            step={0.1}
            value={draft.bodyFat}
            aria-required="true"
            aria-invalid={issueFor('bodyFat') ? true : undefined}
            aria-describedby={issueFor('bodyFat') ? `${uid}-body-fat-error` : undefined}
            onChange={(event) => setField({ bodyFat: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          {issueFor('bodyFat') && (
            <span id={`${uid}-body-fat-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
              {issueMessage(issueFor('bodyFat')!.code)}
            </span>
          )}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_taking_ai}
          <select
            data-r6-field="taking-ai"
            aria-required="true"
            value={draft.takingAi}
            onChange={(event) =>
              setField({
                takingAi: event.target.value as Tool042Draft['takingAi'],
                aiDose: event.target.value === 'yes' ? draft.aiDose : '',
              })
            }
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_ai_dose}
          <input
            data-r6-field="ai-dose"
            data-r6-slider="true"
            type="number"
            inputMode="decimal"
            min={TOOL_042_LIMITS.aiDoseMin}
            max={TOOL_042_LIMITS.aiDoseMax}
            step={0.25}
            value={draft.takingAi === 'yes' ? draft.aiDose : ''}
            aria-required={draft.takingAi === 'yes' ? 'true' : undefined}
            disabled={draft.takingAi !== 'yes'}
            aria-invalid={issueFor('aiDose') ? true : undefined}
            aria-describedby={issueFor('aiDose') ? `${uid}-ai-dose-error` : undefined}
            onChange={(event) => setField({ aiDose: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white disabled:opacity-40"
          />
          {issueFor('aiDose') && (
            <span id={`${uid}-ai-dose-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
              {issueMessage(issueFor('aiDose')!.code)}
            </span>
          )}
        </label>
      </div>

      <fieldset className="mb-3">
        <legend className="mb-2 text-sm font-black text-zinc-700 dark:text-zinc-200">
          {t.field_symptoms}
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOOL_042_SYMPTOMS.map((symptom) => {
            const selected = draft.symptoms.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                data-r6-symptom={symptom}
                aria-pressed={selected}
                onClick={() => toggleSymptom(symptom)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  selected
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                }`}
              >
                {t[symptomLabelKey(symptom)]}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-[10px] text-zinc-500">{t.symptoms_none}</p>
      </fieldset>

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
            <span className="block text-[10px] text-zinc-400">{t.latest_e2}</span>
            <span className="font-mono text-2xl font-black text-white">
              {formatE2(evaluation.input?.e2_pg_ml ?? 0)} {t.unit_pg_ml}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.band}</span>
            <span className={`font-mono text-xl font-bold ${BAND_TONE[result.band] ?? 'text-zinc-300'}`}>
              {t[bandLabelKey(result.band)]}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.delta}</span>
            <span className="font-mono text-xl font-bold text-zinc-100">
              {formatAiDelta(result.ai_delta_mg)} {t.unit_mg_week}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.action}</span>
            <span className="font-mono text-sm font-bold text-zinc-100">
              {t[actionLabelKey(result.action)]}
            </span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool042Genius
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
