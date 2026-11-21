'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runHalfLifeStacker, type HalfLifeStackerBuildOptions } from '@/lib/tools/r6/tool-022-half-life-stacker-pipeline';
import {
  TOOL_022_LIMITS,
  evaluateStackerDraft,
  type Tool022Draft,
  type Tool022FieldId,
  type Tool022IssueCode,
  type Tool022UiState,
} from '@/lib/tools/r6/tool-022-half-life-stacker-contract';
import Tool022Genius from './tool-022-half-life-stacker.genius';
import i18nJson from '@/i18n/tool-022-half-life-stacker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-022-half-life-stacker';

const EMPTY_DRAFT: Tool022Draft = {
  selectedCompounds: [],
  cycleLengthWeeks: '',
  injectionFrequency: '',
};

const STATE_KEY: Record<Tool022UiState, string> = {
  EMPTY: 'state_empty',
  PARTIAL: 'state_partial',
  FULL: 'state_full',
  INVALID: 'state_invalid',
  DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool022UiState, string> = {
  EMPTY: 'state_hint_empty',
  PARTIAL: 'state_hint_partial',
  FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid',
  DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool022IssueCode, string> = {
  invalid_number: 'error_invalid_number',
  out_of_range: 'error_out_of_range',
  required: 'error_required',
  schema_mismatch: 'error_schema_mismatch',
};

// Preset compound catalog (from the engine's domain).
const COMPOUND_CATALOG: Array<{
  id: number; name_en: string; name_ar: string; family: string;
  ester_type: string; half_life_days: number; release_rate: string;
  anabolic_score: number; androgenic_score: number; description_text: string;
}> = [
  { id: 1, name_en: 'Testosterone Enanthate', name_ar: 'تستوستيرون إينانثات', family: 'testosterone', ester_type: 'enanthate', half_life_days: 7, release_rate: 'slow', anabolic_score: 100, androgenic_score: 100, description_text: 'Testosterone base ester' },
  { id: 2, name_en: 'Testosterone Cypionate', name_ar: 'تستوستيرون سيبيونات', family: 'testosterone', ester_type: 'cypionate', half_life_days: 8, release_rate: 'slow', anabolic_score: 100, androgenic_score: 100, description_text: 'Testosterone base ester' },
  { id: 3, name_en: 'Nandrolone Decanoate', name_ar: 'ناندرولون ديكانيات', family: 'nandrolone', ester_type: 'decanoate', half_life_days: 15, release_rate: 'slow', anabolic_score: 125, androgenic_score: 37, description_text: 'Nandrolone long ester' },
  { id: 4, name_en: 'Trenbolone Acetate', name_ar: 'ترينبوولون أسيتات', family: 'trenbolone', ester_type: 'acetate', half_life_days: 3, release_rate: 'fast', anabolic_score: 500, androgenic_score: 500, description_text: 'Trenbolone short ester' },
  { id: 5, name_en: 'Boldenone Undecylenate', name_ar: 'بولدينون أندوسيلينات', family: 'boldenone', ester_type: 'undecanoate', half_life_days: 14, release_rate: 'slow', anabolic_score: 100, androgenic_score: 50, description_text: 'Boldenone long ester' },
];

export default function Tool022HalfLifeStacker() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool022Draft>(EMPTY_DRAFT);

  const options = useMemo<HalfLifeStackerBuildOptions>(
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

  const evaluation = evaluateStackerDraft(draft);
  const run = evaluation.input ? runHalfLifeStacker(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool022UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool022FieldId) => evaluation.issues.find((issue) => issue.field === field);

  const issueMessage = (code: Tool022IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;

  const setField = (patch: Partial<Tool022Draft>) => setDraft((previous) => ({ ...previous, ...patch }));

  const toggleCompound = (compound: typeof COMPOUND_CATALOG[0]) => {
    setDraft((previous) => {
      const exists = previous.selectedCompounds.some((c) => c.id === compound.id);
      if (exists) {
        return { ...previous, selectedCompounds: previous.selectedCompounds.filter((c) => c.id !== compound.id) };
      }
      if (previous.selectedCompounds.length >= TOOL_022_LIMITS.compoundsMax) return previous;
      return { ...previous, selectedCompounds: [...previous.selectedCompounds, compound as any] };
    });
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

      <div className="mb-4 space-y-3">
        <p className="text-[10px] font-bold text-zinc-500">{t.select_compounds}</p>
        <div className="flex flex-wrap gap-2">
          {COMPOUND_CATALOG.map((compound) => {
            const selected = draft.selectedCompounds.some((c) => c.id === compound.id);
            return (
              <button
                key={compound.id}
                type="button"
                onClick={() => toggleCompound(compound)}
                className={`rounded border px-3 py-1.5 text-xs font-bold ${selected ? 'border-lime-400 bg-lime-400 text-slate-950' : 'border-zinc-700 bg-zinc-800 text-zinc-200'}`}
              >
                {isRtl ? compound.name_ar : compound.name_en}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_cycle_length}
          <input
            data-r6-field="cycleLengthWeeks"
            data-r6-slider="true"
            type="number"
            min={TOOL_022_LIMITS.cycleLengthWeeksMin}
            max={TOOL_022_LIMITS.cycleLengthWeeksMax}
            step={1}
            value={draft.cycleLengthWeeks}
            aria-required="true"
            aria-invalid={issueFor('cycleLengthWeeks') ? true : undefined}
            onChange={(e) => setField({ cycleLengthWeeks: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white"
          />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_injection_frequency}
          <select
            data-r6-field="injectionFrequency"
            aria-required="true"
            value={draft.injectionFrequency}
            onChange={(e) => setField({ injectionFrequency: e.target.value as Tool022Draft['injectionFrequency'] })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
          >
            <option value="">{t.not_answered}</option>
            <option value="daily">{t.daily}</option>
            <option value="every-other-day">{t.every_other_day}</option>
            <option value="2x-week">{t.twice_weekly}</option>
            <option value="1x-week">{t.weekly}</option>
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
        <div data-r6-summary="full" className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center md:grid-cols-4">
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_peak_platform}</span>
            <span className="font-mono text-xl font-bold text-lime-300">{result.peak_platform_days}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_washout}</span>
            <span className="font-mono text-xl font-bold text-zinc-100">{result.washout_complete_days}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_pct_start}</span>
            <span className="font-mono text-xl font-bold text-amber-300">{result.recommended_pct_start_days}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_bottleneck}</span>
            <span className="text-sm font-bold text-zinc-100">{isRtl ? result.ester_bottleneck.name_ar : result.ester_bottleneck.name_en}</span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool022Genius
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
