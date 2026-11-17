'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { r6RunHalfLife, type R6HalfLifeBuildOptions } from '@/lib/tools/r6/tool-016-half-life-pipeline';
import {
  TOOL_016_LIMITS,
  evaluateHalfLifeDraft,
  formatDays,
  type Tool016CompoundDraft,
  type Tool016Draft,
  type Tool016FieldId,
  type Tool016IssueCode,
  type Tool016UiState,
} from '@/lib/tools/r6/tool-016-half-life-contract';
import Tool016Genius from './tool-016-half-life-calculator.genius';
import i18nJson from '@/i18n/tool-016-half-life-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-016-half-life-calculator';

const emptyCompound = (): Tool016CompoundDraft => ({ name: '', halfLifeDays: '', source: '' });

const EMPTY_DRAFT: Tool016Draft = {
  compounds: [emptyCompound()],
  remainingPercent: '',
};

const STATE_KEY: Record<Tool016UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool016UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool016IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  schema_mismatch: 'error_schema_mismatch',
};

export default function Tool016HalfLifeCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool016Draft>(EMPTY_DRAFT);

  const options = useMemo<R6HalfLifeBuildOptions>(
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

  const evaluation = evaluateHalfLifeDraft(draft);
  const run = evaluation.input ? r6RunHalfLife(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool016UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool016FieldId) => evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool016IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setDraftField = (patch: Partial<Tool016Draft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const updateCompound = (index: number, key: keyof Tool016CompoundDraft, value: string) => {
    setDraft((previous) => ({
      ...previous,
      compounds: previous.compounds.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }));
  };

  const addCompound = () => {
    if (draft.compounds.length < TOOL_016_LIMITS.compoundsMax) {
      setDraft((previous) => ({ ...previous, compounds: [...previous.compounds, emptyCompound()] }));
    }
  };

  const removeCompound = (index: number) => {
    if (draft.compounds.length > 1) {
      setDraft((previous) => ({
        ...previous,
        compounds: previous.compounds.filter((_, i) => i !== index),
      }));
    }
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

      <div className="mb-4 space-y-4">
        {draft.compounds.map((compound, index) => (
          <fieldset key={index} className="space-y-3 rounded border border-zinc-700 p-4" data-r6-field="compounds">
            <legend className="px-2 font-semibold text-zinc-200">
              {t.compound} {index + 1}
            </legend>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.substance_name}
              <input
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white"
                value={compound.name}
                maxLength={80}
                onChange={(e) => updateCompound(index, 'name', e.target.value)}
              />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.user_half_life}
              <input
                data-r6-slider="true"
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white"
                type="number"
                min={0}
                max={1000000}
                step="any"
                value={compound.halfLifeDays}
                onChange={(e) => updateCompound(index, 'halfLifeDays', e.target.value)}
              />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.source}
              <input
                className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white"
                value={compound.source}
                maxLength={500}
                onChange={(e) => updateCompound(index, 'source', e.target.value)}
              />
            </label>
            {draft.compounds.length > 1 && (
              <button
                type="button"
                className="rounded border border-zinc-600 px-3 py-1 text-sm text-zinc-200"
                onClick={() => removeCompound(index)}
              >
                {t.remove_compound}
              </button>
            )}
          </fieldset>
        ))}
      </div>

      <button
        type="button"
        className="rounded border border-zinc-600 px-4 py-2 text-zinc-200"
        onClick={addCompound}
        disabled={draft.compounds.length >= TOOL_016_LIMITS.compoundsMax}
      >
        {t.add_compound}
      </button>

      <label className="mt-4 block space-y-1 text-sm text-zinc-500">
        {t.remaining_percent}
        <input
          data-r6-field="remainingPercent"
          data-r6-slider="true"
          className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white"
          type="number"
          min={0}
          max={100}
          step="any"
          value={draft.remainingPercent}
          aria-required="true"
          aria-invalid={issueFor('remainingPercent') ? true : undefined}
          aria-describedby={issueFor('remainingPercent') ? `${uid}-remaining-error` : undefined}
          onChange={(e) => setDraftField({ remainingPercent: e.target.value })}
        />
        {issueFor('remainingPercent') && (
          <span id={`${uid}-remaining-error`} className="mt-0.5 block text-[10px] font-bold text-red-400">
            {issueMessage(issueFor('remainingPercent')!.code)}
          </span>
        )}
      </label>

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
        <div data-r6-summary="full" className="mb-4 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          {result.compounds.map((compound, index) => (
            <article key={`${index}-${compound.name}`} className="space-y-1 border-b border-zinc-700 pb-3 last:border-0">
              <h2 className="font-semibold text-zinc-100">{compound.name}</h2>
              <p className="text-sm text-zinc-300">
                {t.user_half_life}: {compound.half_life_days} {t.days}
              </p>
              <p className="text-sm text-zinc-300">
                {t.time_to_threshold}: {formatDays(compound.elapsed_days)} {t.days}
              </p>
              <p className="text-sm text-zinc-300">
                {t.threshold_label}: {compound.remaining_percent}%
              </p>
              <p className="text-xs text-zinc-400">
                {t.source}: {compound.source}
              </p>
            </article>
          ))}
          <ul className="list-disc space-y-1 ps-5 text-xs text-zinc-400">
            {result.assumptions.map((assumption) => (
              <li key={assumption}>{t[assumption] ?? assumption}</li>
            ))}
          </ul>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool016Genius
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
