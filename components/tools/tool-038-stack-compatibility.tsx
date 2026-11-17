'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runStackCompatibility, type StackCompatibilityBuildOptions } from '@/lib/tools/r6/tool-038-stack-compatibility-pipeline';
import {
  TOOL_038_FAMILIES,
  evaluateStackCompatibilityDraft,
  type Tool038Draft,
  type Tool038UiState,
  type Tool038ItemDraft,
} from '@/lib/tools/r6/tool-038-stack-compatibility-contract';
import Tool038Genius from './tool-038-stack-compatibility.genius';
import i18nJson from '@/i18n/tool-038-stack-compatibility.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-038-stack-compatibility';
const emptyItem = (): Tool038ItemDraft => ({ nameEn: '', family: '', weeklyDoseMg: '', hepatotoxic: false });
const EMPTY_DRAFT: Tool038Draft = { items: [emptyItem()] };
const STATE_KEY: Record<Tool038UiState, string> = { EMPTY:'state_empty', PARTIAL:'state_partial', FULL:'state_full', INVALID:'state_invalid', DEGRADED:'state_degraded' };
const HINT_KEY: Record<Tool038UiState, string> = { EMPTY:'state_hint_empty', PARTIAL:'state_hint_partial', FULL:'state_hint_full', INVALID:'state_hint_invalid', DEGRADED:'state_hint_degraded' };

export default function Tool038StackCompatibility() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();
  const [draft, setDraft] = useState<Tool038Draft>(EMPTY_DRAFT);

  const options = useMemo<StackCompatibilityBuildOptions>(
    () => ({ calculatedAt: new Date().toISOString(), recordedAt: new Date().toISOString(), locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual' }),
    [locale, unitSystem],
  );

  const evaluation = evaluateStackCompatibilityDraft(draft);
  const run = evaluation.input ? runStackCompatibility(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;
  const uiState: Tool038UiState = evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const updateItem = (i: number, key: keyof Tool038ItemDraft, value: string | boolean) => setDraft(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [key]: value } : it) }));
  const addItem = () => { if (draft.items.length < 12) setDraft(p => ({ ...p, items: [...p.items, emptyItem()] })); };
  const removeItem = (i: number) => { if (draft.items.length > 1) setDraft(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) })); };

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

      <div className="mb-4 space-y-3">
        {draft.items.map((it, i) => (
          <fieldset key={i} className="space-y-2 rounded border border-zinc-700 p-3" data-r6-field="items">
            <legend className="px-2 text-xs font-semibold text-zinc-200">{t.item} {i+1}</legend>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="text-[10px] font-bold text-zinc-500">{t.item_name}<input className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={it.nameEn} maxLength={80} onChange={(e)=>updateItem(i,'nameEn',e.target.value)} /></label>
              <label className="text-[10px] font-bold text-zinc-500">{t.family}<select className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={it.family} onChange={(e)=>updateItem(i,'family',e.target.value)}><option value="">{t.not_answered}</option>{TOOL_038_FAMILIES.map(f=><option key={f} value={f}>{t[`family_${f}`]??f}</option>)}</select></label>
              <label className="text-[10px] font-bold text-zinc-500">{t.weekly_dose_mg}<input type="number" min={0} max={5000} step={1} className="mt-0.5 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-white" value={it.weeklyDoseMg} onChange={(e)=>updateItem(i,'weeklyDoseMg',e.target.value)} /></label>
              <label className="flex items-center gap-2 pt-4 text-xs font-bold text-zinc-400"><input type="checkbox" checked={it.hepatotoxic} onChange={(e)=>updateItem(i,'hepatotoxic',e.target.checked)} /> {t.hepatotoxic}</label>
            </div>
            {draft.items.length > 1 && <button type="button" className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-200" onClick={()=>removeItem(i)}>{t.remove_item}</button>}
          </fieldset>
        ))}
      </div>
      <button type="button" className="mb-4 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40" onClick={addItem} disabled={draft.items.length >= 12}>{t.add_item}</button>

      {uiState === 'INVALID' && <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3"><p className="text-xs font-bold text-red-300">{t.validation_error}</p></div>}
      {uiState === 'FULL' && result && (
        <div data-r6-summary="full" className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-bold text-zinc-100">{t.score}: {result.score_0_100} — {result.verdict}</p>
          <p className="mt-1 text-xs text-zinc-400">{t.androgen_burden}: {result.androgen_burden_mg_per_week} mg/week</p>
        </div>
      )}
      {uiState === 'DEGRADED' && <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">{t.state_hint_degraded}</div>}

      <Tool038Genius locale={locale} state={uiState} draft={draft} input={evaluation.input} output={run?.ok?run.output:null} options={options} result={result} prevTool={{slug:neighbors.prevTool.slug,titleEn:neighbors.prevTool.titleEn,titleAr:neighbors.prevTool.titleAr}} nextTool={{slug:neighbors.nextTool.slug,titleEn:neighbors.nextTool.titleEn,titleAr:neighbors.nextTool.titleAr}} t={t} />

      <p className="mt-4 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </section>
  );
}
