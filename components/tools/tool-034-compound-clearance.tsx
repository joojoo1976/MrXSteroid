'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runCompoundClearance, type CompoundClearanceBuildOptions } from '@/lib/tools/r6/tool-034-compound-clearance-pipeline';
import {
  TOOL_034_LIMITS,
  evaluateClearanceDraft,
  formatDays,
  formatPercent,
  type Tool034Draft,
  type Tool034FieldId,
  type Tool034IssueCode,
  type Tool034UiState,
} from '@/lib/tools/r6/tool-034-compound-clearance-contract';
import Tool034Genius from './tool-034-compound-clearance.genius';
import i18nJson from '@/i18n/tool-034-compound-clearance.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-034-compound-clearance';

const EMPTY_DRAFT: Tool034Draft = {
  compoundName: '',
  halfLifeDays: '',
  halfLifeSource: '',
  lastDoseDate: '',
  asOfDate: '',
  thresholdFraction: '',
};

const STATE_KEY: Record<Tool034UiState, string> = {
  EMPTY: 'state_empty', PARTIAL: 'state_partial', FULL: 'state_full',
  INVALID: 'state_invalid', DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool034UiState, string> = {
  EMPTY: 'state_hint_empty', PARTIAL: 'state_hint_partial', FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid', DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool034IssueCode, string> = {
  invalid_number: 'error_invalid_number', out_of_range: 'error_out_of_range',
  required: 'error_required', schema_mismatch: 'error_schema_mismatch',
};

export default function Tool034CompoundClearance() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool034Draft>(EMPTY_DRAFT);

  const options = useMemo<CompoundClearanceBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual',
    }),
    [locale, unitSystem],
  );

  const evaluation = evaluateClearanceDraft(draft);
  const run = evaluation.input ? runCompoundClearance(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool034UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool034FieldId) => evaluation.issues.find((issue) => issue.field === field);
  const issueMessage = (code: Tool034IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;
  const setField = (patch: Partial<Tool034Draft>) => setDraft((p) => ({ ...p, ...patch }));

  const textField = (fieldId: Tool034FieldId, labelKey: string) => {
    const issue = issueFor(fieldId);
    return (
      <label className="text-[10px] font-bold text-zinc-500">
        {t[labelKey]}
        <input data-r6-field={fieldId} type="text" value={draft[fieldId]}
          aria-required="true" aria-invalid={issue ? true : undefined}
          onChange={(e) => setField({ [fieldId]: e.target.value } as Partial<Tool034Draft>)}
          className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        {issue && <span className="mt-0.5 block text-[10px] font-bold text-red-400">{issueMessage(issue.code)}</span>}
      </label>
    );
  };

  const numField = (fieldId: Tool034FieldId, labelKey: string, min: number, max: number, step: number) => {
    const issue = issueFor(fieldId);
    return (
      <label className="text-[10px] font-bold text-zinc-500">
        {t[labelKey]}
        <input data-r6-field={fieldId} data-r6-slider="true" type="number" inputMode="decimal" min={min} max={max} step={step} value={draft[fieldId]}
          aria-required="true" aria-invalid={issue ? true : undefined}
          onChange={(e) => setField({ [fieldId]: e.target.value } as Partial<Tool034Draft>)}
          className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
        {issue && <span className="mt-0.5 block text-[10px] font-bold text-red-400">{issueMessage(issue.code)}</span>}
      </label>
    );
  };

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl px-4 py-6" aria-labelledby={`${uid}-title`} data-r6-tool={TOOL_SLUG}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 id={`${uid}-title`} className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div data-r6-state={uiState} aria-live="polite" className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {t.state_label}: {t[STATE_KEY[uiState]]}
        </div>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{t[HINT_KEY[uiState]]}</p>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {textField('compoundName', 'field_compound_name')}
        {numField('halfLifeDays', 'field_half_life_days', TOOL_034_LIMITS.halfLifeDaysMin, TOOL_034_LIMITS.halfLifeDaysMax, 0.1)}
        {textField('halfLifeSource', 'field_half_life_source')}
        {textField('lastDoseDate', 'field_last_dose_date')}
        {textField('asOfDate', 'field_as_of_date')}
        {numField('thresholdFraction', 'field_threshold_fraction', TOOL_034_LIMITS.thresholdFractionMin, TOOL_034_LIMITS.thresholdFractionMax, 0.001)}
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
        <div data-r6-summary="full" className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center md:grid-cols-4">
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_days_to_threshold}</span>
            <span className="font-mono text-xl font-bold text-lime-300">{result.days_to_threshold}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_threshold_date}</span>
            <span className="text-sm font-bold text-zinc-100">{result.threshold_date}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_days_elapsed}</span>
            <span className="font-mono text-xl font-bold text-zinc-100">{result.days_elapsed}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_remaining}</span>
            <span className="font-mono text-xl font-bold text-amber-300">{result.modeled_remaining_percent}%</span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool034Genius
        locale={locale}
        state={uiState}
        draft={draft}
        input={evaluation.input}
        output={run?.ok ? run.output : null}
        options={options}
        prevTool={{ slug: neighbors.prevTool.slug, titleEn: neighbors.prevTool.titleEn, titleAr: neighbors.prevTool.titleAr }}
        nextTool={{ slug: neighbors.nextTool.slug, titleEn: neighbors.nextTool.titleEn, titleAr: neighbors.nextTool.titleAr }}
      />

      <p className="mt-4 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </section>
  );
}
