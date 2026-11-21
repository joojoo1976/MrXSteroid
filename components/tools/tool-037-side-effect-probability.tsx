'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runSideEffectProbability, type SideEffectProbabilityBuildOptions } from '@/lib/tools/r6/tool-037-side-effect-probability-pipeline';
import {
  TOOL_037_FAMILIES,
  evaluateSideEffectProbabilityDraft,
  type Tool037Draft,
  type Tool037UiState,
  type Tool037CompoundDraft,
} from '@/lib/tools/r6/tool-037-side-effect-probability-contract';
import Tool037Genius from './tool-037-side-effect-probability.genius';
import i18nJson from '@/i18n/tool-037-side-effect-probability.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-037-side-effect-probability';
const emptyCompound = (): Tool037CompoundDraft => ({ nameEn: '', family: '', weeklyDoseMg: '', referenceDoseMg: '' });
const EMPTY_DRAFT: Tool037Draft = { age: '', bodyFatPct: '', cycleWeeks: '', usesAi: false, usesLiverSupport: false, compounds: [emptyCompound()] };
const STATE_KEY: Record<Tool037UiState, string> = { EMPTY:'state_empty', PARTIAL:'state_partial', FULL:'state_full', INVALID:'state_invalid', DEGRADED:'state_degraded' };
const HINT_KEY: Record<Tool037UiState, string> = { EMPTY:'state_hint_empty', PARTIAL:'state_hint_partial', FULL:'state_hint_full', INVALID:'state_hint_invalid', DEGRADED:'state_hint_degraded' };

export default function Tool037SideEffectProbability() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();
  const [draft, setDraft] = useState<Tool037Draft>(EMPTY_DRAFT);

  const options = useMemo<SideEffectProbabilityBuildOptions>(
    () => ({ calculatedAt: new Date().toISOString(), recordedAt: new Date().toISOString(), locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual' }),
    [locale, unitSystem],
  );

  const evaluation = evaluateSideEffectProbabilityDraft(draft);
  const run = evaluation.input ? runSideEffectProbability(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;
  const uiState: Tool037UiState = evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const setField = (patch: Partial<Tool037Draft>) => setDraft((p) => ({ ...p, ...patch }));
  const updateCompound = (i: number, key: keyof Tool037CompoundDraft, value: string) => setDraft(p => ({ ...p, compounds: p.compounds.map((c, idx) => idx === i ? { ...c, [key]: value } : c) }));
  const addCompound = () => { if (draft.compounds.length < 8) setDraft(p => ({ ...p, compounds: [...p.compounds, emptyCompound()] })); };
  const removeCompound = (i: number) => { if (draft.compounds.length > 1) setDraft(p => ({ ...p, compounds: p.compounds.filter((_, idx) => idx !== i) })); };

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl px-4 py-6" aria-labelledby={`${uid}-title`} data-r6-tool={TOOL_SLUG}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 id={`${uid}-title`} className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div data-r6-state={uiState} aria-live="polite" className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {t.state_label}: {t[STATE_KEY[uiState]]}
        </div>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{t[HINT_KEY[uiState]]}</p>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">{t.scope_note}</p>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-[10px] font-bold text-zinc-500">{t.age}
          <input data-r6-field="age" type="number" min={18} max={90} step={1} value={draft.age} onChange={(e)=>setField({age:e.target.value})} className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.body_fat_pct}
          <input data-r6-field="bodyFatPct" type="number" min={5} max={60} step={0.1} value={draft.bodyFatPct} onChange={(e)=>setField({bodyFatPct:e.target.value})} className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.cycle_weeks}
          <input data-r6-field="cycleWeeks" type="number" min={1} max={52} step={1} value={draft.cycleWeeks} onChange={(e)=>setField({cycleWeeks:e.target.value})} className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400"><input type="checkbox" checked={draft.usesAi} onChange={(e)=>setField({usesAi:e.target.checked})} /> {t.uses_ai}</label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400"><input type="checkbox" checked={draft.usesLiverSupport} onChange={(e)=>setField({usesLiverSupport:e.target.checked})} /> {t.uses_liver_support}</label>
      </div>

      <div className="mb-4 space-y-3">
        {draft.compounds.map((c, i) => (
          <fieldset key={i} className="space-y-2 rounded border border-zinc-700 p-3" data-r6-field="compounds">
            <legend className="px-2 text-xs font-semibold text-zinc-200">{t.compound} {i+1}</legend>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="text-[10px] font-bold text-zinc-500">{t.compound_name}<input className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={c.nameEn} maxLength={80} onChange={(e)=>updateCompound(i,'nameEn',e.target.value)} /></label>
              <label className="text-[10px] font-bold text-zinc-500">{t.family}<select className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={c.family} onChange={(e)=>updateCompound(i,'family',e.target.value)}><option value="">{t.not_answered}</option>{TOOL_037_FAMILIES.map(f=><option key={f} value={f}>{t[`family_${f}`]??f}</option>)}</select></label>
              <label className="text-[10px] font-bold text-zinc-500">{t.weekly_dose_mg}<input type="number" min={1} max={5000} step={1} className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={c.weeklyDoseMg} onChange={(e)=>updateCompound(i,'weeklyDoseMg',e.target.value)} /></label>
              <label className="text-[10px] font-bold text-zinc-500">{t.reference_dose_mg}<input type="number" min={1} max={5000} step={1} className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={c.referenceDoseMg} onChange={(e)=>updateCompound(i,'referenceDoseMg',e.target.value)} /></label>
            </div>
            {draft.compounds.length > 1 && <button type="button" className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-200" onClick={()=>removeCompound(i)}>{t.remove_compound}</button>}
          </fieldset>
        ))}
      </div>
      <button type="button" className="mb-4 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40" onClick={addCompound} disabled={draft.compounds.length >= 8}>{t.add_compound}</button>

      {uiState === 'INVALID' && <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3"><p className="text-xs font-bold text-red-300">{t.validation_error}</p></div>}
      {uiState === 'FULL' && result && (
        <div data-r6-summary="full" className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-bold text-zinc-100">{t.overall_burden}: {result.overall_burden_pct}%</p>
          <ul className="mt-2 space-y-1 text-xs">{result.risks.map(r=>(<li key={r.effect} className="text-zinc-300">{r.effect}: {r.probability_pct}% ({r.level})</li>))}</ul>
        </div>
      )}
      {uiState === 'DEGRADED' && <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">{t.state_hint_degraded}</div>}

      <Tool037Genius locale={locale} state={uiState} draft={draft} input={evaluation.input} output={run?.ok?run.output:null} options={options} result={result} prevTool={{slug:neighbors.prevTool.slug,titleEn:neighbors.prevTool.titleEn,titleAr:neighbors.prevTool.titleAr}} nextTool={{slug:neighbors.nextTool.slug,titleEn:neighbors.nextTool.titleEn,titleAr:neighbors.nextTool.titleAr}} t={t} />

      <p className="mt-4 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </section>
  );
}
