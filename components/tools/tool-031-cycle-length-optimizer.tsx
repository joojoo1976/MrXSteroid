'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runCycleLengthOptimizer, type CycleLengthOptimizerBuildOptions } from '@/lib/tools/r6/tool-031-cycle-length-optimizer-pipeline';
import {
  TOOL_031_LIMITS,
  TOOL_031_GOALS,
  TOOL_031_EXPERIENCES,
  type Tool031Goal,
  type Tool031Experience,
  evaluateCycleLengthDraft,
  formatWeeks,
  type Tool031CompoundDraft,
  type Tool031Draft,
  type Tool031FieldId,
  type Tool031IssueCode,
  type Tool031UiState,
} from '@/lib/tools/r6/tool-031-cycle-length-contract';
import Tool031Genius from './tool-031-cycle-length-optimizer.genius';
import i18nJson from '@/i18n/tool-031-cycle-length-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-031-cycle-length-optimizer';

const emptyCompound = (): Tool031CompoundDraft => ({ nameEn: '', suppressionFactor: '', halfLifeDays: '', weeklyDoseMg: '' });

const EMPTY_DRAFT: Tool031Draft = {
  goal: '',
  experience: '',
  previousCycles: '',
  compounds: [emptyCompound()],
};

const STATE_KEY: Record<Tool031UiState, string> = {
  EMPTY: 'state_empty', PARTIAL: 'state_partial', FULL: 'state_full',
  INVALID: 'state_invalid', DEGRADED: 'state_degraded',
};

const HINT_KEY: Record<Tool031UiState, string> = {
  EMPTY: 'state_hint_empty', PARTIAL: 'state_hint_partial', FULL: 'state_hint_full',
  INVALID: 'state_hint_invalid', DEGRADED: 'state_hint_degraded',
};

const ERROR_KEY: Record<Tool031IssueCode, string> = {
  invalid_number: 'error_invalid_number', out_of_range: 'error_out_of_range',
  required: 'error_required', schema_mismatch: 'error_schema_mismatch',
};

export default function Tool031CycleLengthOptimizer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool031Draft>(EMPTY_DRAFT);

  const options = useMemo<CycleLengthOptimizerBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual',
    }),
    [locale, unitSystem],
  );

  const evaluation = evaluateCycleLengthDraft(draft);
  const run = evaluation.input ? runCycleLengthOptimizer(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;

  const uiState: Tool031UiState =
    evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const issueFor = (field: Tool031FieldId) => evaluation.issues.find((issue) => issue.field === field);
  const issueMessage = (code: Tool031IssueCode): string => t[ERROR_KEY[code]] ?? t.error_required;
  const setField = (patch: Partial<Tool031Draft>) => setDraft((p) => ({ ...p, ...patch }));

  const updateCompound = (index: number, key: keyof Tool031CompoundDraft, value: string) => {
    setDraft((p) => ({ ...p, compounds: p.compounds.map((c, i) => (i === index ? { ...c, [key]: value } : c)) }));
  };

  const addCompound = () => {
    if (draft.compounds.length < TOOL_031_LIMITS.compoundsMax) {
      setDraft((p) => ({ ...p, compounds: [...p.compounds, { nameEn: '', suppressionFactor: '', halfLifeDays: '', weeklyDoseMg: '' }] }));
    }
  };

  const removeCompound = (index: number) => {
    if (draft.compounds.length > 1) {
      setDraft((p) => ({ ...p, compounds: p.compounds.filter((_, i) => i !== index) }));
    }
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

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_goal}
          <select data-r6-field="goal" aria-required="true" value={draft.goal} onChange={(e) => setField({ goal: e.target.value as Tool031Goal })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white">
            <option value="">{t.not_answered}</option>
            <option value="bulk">{t.goal_bulk}</option>
            <option value="cut">{t.goal_cut}</option>
            <option value="recomp">{t.goal_recomp}</option>
            <option value="strength">{t.goal_strength}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_experience}
          <select data-r6-field="experience" aria-required="true" value={draft.experience} onChange={(e) => setField({ experience: e.target.value as Tool031Experience })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white">
            <option value="">{t.not_answered}</option>
            <option value="beginner">{t.exp_beginner}</option>
            <option value="intermediate">{t.exp_intermediate}</option>
            <option value="advanced">{t.exp_advanced}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.field_previous_cycles}
          <input data-r6-field="previousCycles" data-r6-slider="true" type="number" min={0} max={30} step={1} value={draft.previousCycles}
            aria-required="true" aria-invalid={issueFor('previousCycles') ? true : undefined}
            onChange={(e) => setField({ previousCycles: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
        </label>
      </div>

      <div className="mb-4 space-y-4">
        {draft.compounds.map((compound, index) => (
          <fieldset key={index} className="space-y-3 rounded border border-zinc-700 p-4" data-r6-field="compounds">
            <legend className="px-2 font-semibold text-zinc-200">{t.compound} {index + 1}</legend>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.substance_name}
              <input className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={compound.nameEn} maxLength={80}
                onChange={(e) => updateCompound(index, 'nameEn', e.target.value)} />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.suppression_factor}
              <input data-r6-slider="true" className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white" type="number" min={0} max={5} step={0.1} value={compound.suppressionFactor}
                onChange={(e) => updateCompound(index, 'suppressionFactor', e.target.value)} />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.half_life_days}
              <input data-r6-slider="true" className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white" type="number" min={0.5} max={60} step={0.1} value={compound.halfLifeDays}
                onChange={(e) => updateCompound(index, 'halfLifeDays', e.target.value)} />
            </label>
            <label className="block space-y-1 text-sm text-zinc-500">
              {t.weekly_dose_mg}
              <input data-r6-slider="true" className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white" type="number" min={1} max={5000} step={1} value={compound.weeklyDoseMg}
                onChange={(e) => updateCompound(index, 'weeklyDoseMg', e.target.value)} />
            </label>
            {draft.compounds.length > 1 && (
              <button type="button" className="rounded border border-zinc-600 px-3 py-1 text-sm text-zinc-200" onClick={() => removeCompound(index)}>{t.remove_compound}</button>
            )}
          </fieldset>
        ))}
      </div>

      <button type="button" className="rounded border border-zinc-600 px-4 py-2 text-zinc-200" onClick={addCompound} disabled={draft.compounds.length >= TOOL_031_LIMITS.compoundsMax}>{t.add_compound}</button>

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
        <div data-r6-summary="full" className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-center md:grid-cols-3">
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_min_weeks}</span>
            <span className="font-mono text-xl font-bold text-zinc-100">{result.min_weeks}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_optimal_weeks}</span>
            <span className="font-mono text-xl font-bold text-lime-300">{result.optimal_weeks}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_max_weeks}</span>
            <span className="font-mono text-xl font-bold text-amber-300">{result.max_weeks}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_suppression_load}</span>
            <span className="font-mono text-xl font-bold text-rose-300">{result.suppression_load}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-400">{t.kpi_bottleneck}</span>
            <span className="font-mono text-xl font-bold text-zinc-100">{result.ester_bottleneck_days}</span>
          </div>
        </div>
      )}

      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {t.state_hint_degraded}
        </div>
      )}

      <Tool031Genius
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
