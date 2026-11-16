'use client';
/**
 * components/tools/tool-050-mental-health.tsx
 *
 * Tool #050 — Mental Health Monitor (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline (`runMentalHealth`), which
 *     validates the input and calls the authoritative V6 engine
 *     (`assessMentalHealth`) — the UI never calls the engine or the legacy
 *     adapter directly;
 *   - the tool starts EMPTY: no mood entries, sleep, irritability, aggression,
 *     19-nor answer or red-flag selection is pre-filled;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit and
 *     follow the documented order EMPTY → INVALID → PARTIAL → FULL/DEGRADED;
 *   - mood entries are entered as "score,date" lines (one per day); a typed 0
 *     is never silently ignored;
 *   - the engine's own warnings are preserved and only mapped to localisation
 *     keys; crisis language is the engine's own wording, never an invented
 *     sentence;
 *   - the legacy adapter's invented confidence (0.9) and invented reference
 *     range (1–10, "self-report scale") are deliberately NOT reused;
 *   - the engine is screening only and never a diagnosis; the UI says so;
 *   - there is NO persistence of any kind (W18). The rating in box 12 is
 *     session-only and says so.
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runMentalHealth,
  type MentalHealthBuildOptions,
} from '@/lib/tools/r6/tool-050-mental-health-pipeline';
import {
  TOOL_050_LIMITS,
  bandLabelKey,
  evaluateMentalHealthDraft,
  formatMood,
  parseMoodText,
  redFlagLabelKey,
  trendLabelKey,
  warningLabelKey,
  type Tool050Bool,
  type Tool050Draft,
  type Tool050FieldId,
  type Tool050IssueCode,
  type Tool050UiState,
} from '@/lib/tools/r6/tool-050-mental-health-contract';
import Tool050Genius from './tool-050-mental-health.genius';
import i18nJson from '@/i18n/tool-050-mental-health.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-050-mental-health';

const RED_FLAG_CODES = ['self_harm_thoughts', 'rage_episodes', 'hopelessness'] as const;

const EMPTY_DRAFT: Tool050Draft = {
  moodText: '',
  sleepHours: '',
  irritability: '',
  aggression: '',
  uses19Nor: '',
  redFlags: [],
};

const STATE_KEY: Record<Tool050UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool050UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool050IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  schema_mismatch: 'error_schema_mismatch',
};

export default function Tool050MentalHealth() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool050Draft>(EMPTY_DRAFT);

  const options = useMemo<MentalHealthBuildOptions>(
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

  const evaluation = evaluateMentalHealthDraft(draft);
  const run = evaluation.input ? runMentalHealth(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool050UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool050FieldId) => evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool050IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool050Draft>) => setDraft((previous) => ({ ...previous, ...patch }));

  const toggleRedFlag = (code: string) => {
    setDraft((previous) => {
      const set = new Set(previous.redFlags);
      if (set.has(code)) set.delete(code);
      else set.add(code);
      return { ...previous, redFlags: Array.from(set) };
    });
  };

  const numericField = (
    fieldId: Tool050FieldId,
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
          onChange={(event) => setField({ [fieldId]: event.target.value } as Partial<Tool050Draft>)}
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

  const parsedMoods = parseMoodText(draft.moodText);

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
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">
          {t.field_mood_scores}
          <textarea
            data-r6-field="moodText"
            aria-required="true"
            rows={6}
            value={draft.moodText}
            placeholder={t.mood_placeholder}
            onChange={(event) => setField({ moodText: event.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
          <span className="mt-0.5 block text-[10px] text-zinc-500">{t.mood_help}</span>
        </label>
        {numericField('sleepHours', 'field_sleep', TOOL_050_LIMITS.sleepHoursMin, TOOL_050_LIMITS.sleepHoursMax, 0.5)}
        {numericField('irritability', 'field_irritability', TOOL_050_LIMITS.irritabilityMin, TOOL_050_LIMITS.irritabilityMax, 1)}
        {numericField('aggression', 'field_aggression', TOOL_050_LIMITS.aggressionMin, TOOL_050_LIMITS.aggressionMax, 1)}
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_uses_19_nor}
          <select
            data-r6-field="uses19Nor"
            aria-required="true"
            value={draft.uses19Nor}
            onChange={(event) => setField({ uses19Nor: event.target.value as Tool050Bool })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </label>
        <fieldset className="text-[10px] font-bold text-zinc-500 md:col-span-2">
          <legend className="mb-1">{t.field_red_flags}</legend>
          <div className="flex flex-wrap gap-3">
            {RED_FLAG_CODES.map((code) => (
              <label key={code} className="flex items-center gap-1.5 text-xs font-normal text-zinc-300">
                <input
                  type="checkbox"
                  checked={draft.redFlags.includes(code)}
                  onChange={() => toggleRedFlag(code)}
                  className="accent-rose-500"
                />
                {t[redFlagLabelKey(code)]}
              </label>
            ))}
          </div>
        </fieldset>
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
            <span className="block text-[10px] text-zinc-400">{t.kpi_avg_mood}</span>
            <span className="font-mono text-xl font-bold text-lime-300">
              {formatMood(result.avg_mood)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_trend}</span>
            <span className="text-sm font-bold text-zinc-100">{t[trendLabelKey(result.trend)]}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_band}</span>
            <span className="text-sm font-bold text-zinc-100">{t[bandLabelKey(result.band)]}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_entries}</span>
            <span className="font-mono text-xl font-bold text-amber-300">
              {parsedMoods.entries.length}
            </span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool050Genius
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
