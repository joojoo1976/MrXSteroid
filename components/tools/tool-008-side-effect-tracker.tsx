'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runSideEffectTracker, type SideEffectTrackerBuildOptions } from '@/lib/tools/r6/tool-008-side-effect-tracker-pipeline';
import {
  TOOL_008_LIMITS,
  TOOL_008_SEVERITIES,
  TOOL_008_CATEGORIES,
  evaluateSideEffectDraft,
  type Tool008Draft,
  type Tool008FieldId,
  type Tool008IssueCode,
  type Tool008UiState,
} from '@/lib/tools/r6/tool-008-side-effect-tracker-contract';
import Tool008Genius from './tool-008-side-effect-tracker.genius';
import i18nJson from '@/i18n/tool-008-side-effect-tracker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-008-side-effect-tracker';

const EMPTY_DRAFT: Tool008Draft = {
  symptom: '',
  severity: '',
  category: '',
  notes: '',
  compoundRelated: '',
  date: '',
};

const STATE_KEY: Record<Tool008UiState, string> = {
  EMPTY: 'state_empty', PARTIAL: 'state_partial', FULL: 'state_full',
  INVALID: 'state_invalid', DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool008UiState, string> = {
  EMPTY: 'state_hint_empty', PARTIAL: 'state_hint_partial', FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid', DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool008IssueCode, string> = {
  invalid_number: 'error_invalid_number', out_of_range: 'error_out_of_range',
  required: 'error_required', schema_mismatch: 'error_schema_mismatch',
};

export default function Tool008SideEffectTracker() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool008Draft>(EMPTY_DRAFT);

  const options = useMemo<SideEffectTrackerBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual',
    }),
    [locale, unitSystem],
  );

  const evaluation = evaluateSideEffectDraft(draft);
  const run = evaluation.input ? runSideEffectTracker(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool008UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool008FieldId) => evaluation.issues.find((issue) => issue.field === field);
  const issueMessage = (code: Tool008IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;
  const setField = (patch: Partial<Tool008Draft>) => setDraft((p) => ({ ...p, ...patch }));

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
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_symptom}
          <input data-r6-field="symptom" type="text" maxLength={TOOL_008_LIMITS.symptomMax} value={draft.symptom}
            aria-required="true" aria-invalid={issueFor('symptom') ? true : undefined}
            onChange={(e) => setField({ symptom: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
          {issueFor('symptom') && <span className="mt-0.5 block text-[10px] font-bold text-red-400">{issueMessage(issueFor('symptom')!.code)}</span>}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_severity}
          <select data-r6-field="severity" aria-required="true" value={draft.severity} onChange={(e) => setField({ severity: e.target.value as Tool008Draft['severity'] })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white">
            <option value="">{t.not_answered}</option>
            {TOOL_008_SEVERITIES.map((s) => <option key={s} value={s}>{t[`sev_${s}`] ?? s}</option>)}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_category}
          <select data-r6-field="category" aria-required="true" value={draft.category} onChange={(e) => setField({ category: e.target.value as Tool008Draft['category'] })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white">
            <option value="">{t.not_answered}</option>
            {TOOL_008_CATEGORIES.map((c) => <option key={c} value={c}>{t[`cat_${c}`] ?? c}</option>)}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_date}
          <input data-r6-field="date" type="date" value={draft.date}
            aria-required="true" aria-invalid={issueFor('date') ? true : undefined}
            onChange={(e) => setField({ date: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
          {issueFor('date') && <span className="mt-0.5 block text-[10px] font-bold text-red-400">{issueMessage(issueFor('date')!.code)}</span>}
        </label>
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">
          {t.field_notes}
          <textarea data-r6-field="notes" maxLength={TOOL_008_LIMITS.notesMax} rows={3} value={draft.notes}
            aria-invalid={issueFor('notes') ? true : undefined}
            onChange={(e) => setField({ notes: e.target.value })}
            className="mt-0.5 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">
          {t.field_compound_related}
          <input data-r6-field="compoundRelated" type="text" maxLength={TOOL_008_LIMITS.compoundMax} value={draft.compoundRelated}
            aria-invalid={issueFor('compoundRelated') ? true : undefined}
            onChange={(e) => setField({ compoundRelated: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
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
        <div data-r6-summary="full" className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-bold text-zinc-100">{result.symptom}</p>
          <p className="mt-1 text-xs text-zinc-400">{t.kpi_severity}: {result.severity} · {t.kpi_category}: {result.category} · {t.kpi_date}: {result.date.slice(0,10)}</p>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool008Genius
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
