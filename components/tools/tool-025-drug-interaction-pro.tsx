'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runDrugInteractionPro, type DrugInteractionProBuildOptions } from '@/lib/tools/r6/tool-025-drug-interaction-pro-pipeline';
import {
  TOOL_025_ITEM_TYPES,
  evaluateDraftEntry,
  evaluateSession,
  type Tool025Draft,
  type Tool025UiState,
  type MedicationSessionEntry,
} from '@/lib/tools/r6/tool-025-drug-interaction-pro-contract';
import Tool025Genius from './tool-025-drug-interaction-pro.genius';
import i18nJson from '@/i18n/tool-025-drug-interaction-pro.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-025-drug-interaction-pro';
const EMPTY_DRAFT: Tool025Draft = { itemName: '', itemType: '', doseDescription: '', sourceLabel: '', notes: '' };
const STATE_KEY: Record<Tool025UiState, string> = { EMPTY:'state_empty', PARTIAL:'state_partial', FULL:'state_full', INVALID:'state_invalid', DEGRADED:'state_degraded' };
const HINT_KEY: Record<Tool025UiState, string> = { EMPTY:'state_hint_empty', PARTIAL:'state_hint_partial', FULL:'state_hint_full', INVALID:'state_hint_invalid', DEGRADED:'state_hint_degraded' };

export default function Tool025DrugInteractionCheckerPro() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool025Draft>(EMPTY_DRAFT);
  const [entries, setEntries] = useState<MedicationSessionEntry[]>([]);

  const options = useMemo<DrugInteractionProBuildOptions>(
    () => ({ calculatedAt: new Date().toISOString(), recordedAt: new Date().toISOString(), locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual' }),
    [locale, unitSystem],
  );

  const evaluation = evaluateSession(entries, draft);
  const run = evaluation.input ? runDrugInteractionPro(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;
  const uiState: Tool025UiState = evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const draftEval = evaluateDraftEntry(draft);
  const canAdd = draftEval.valid && entries.length < 50;

  const addEntry = () => {
    if (!canAdd) return;
    const entry: MedicationSessionEntry = {
      id: crypto.randomUUID(),
      itemName: draft.itemName.trim(),
      itemType: draft.itemType as MedicationSessionEntry['itemType'],
      ...(draft.doseDescription.trim() ? { doseDescription: draft.doseDescription.trim() } : {}),
      ...(draft.sourceLabel.trim() ? { sourceLabel: draft.sourceLabel.trim() } : {}),
      ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}),
    };
    setEntries((prev) => [...prev, entry]);
    setDraft(EMPTY_DRAFT);
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const setField = (patch: Partial<Tool025Draft>) => setDraft((p) => ({ ...p, ...patch }));

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto max-w-5xl px-4 py-6" aria-labelledby={`${uid}-title`} data-r6-tool={TOOL_SLUG}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 id={`${uid}-title`} className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div data-r6-state={uiState} aria-live="polite" className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {t.state_label}: {t[STATE_KEY[uiState]]}
        </div>
      </div>
      <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{t[HINT_KEY[uiState]]}</p>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">{t.scope_note}</p>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-[10px] font-bold text-zinc-500">{t.item_name}
          <input data-r6-field="itemName" type="text" maxLength={120} value={draft.itemName} onChange={(e) => setField({ itemName: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.item_type}
          <select data-r6-field="itemType" value={draft.itemType} onChange={(e) => setField({ itemType: e.target.value as Tool025Draft['itemType'] })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white">
            <option value="">{t.not_answered}</option>
            {TOOL_025_ITEM_TYPES.map((v) => <option key={v} value={v}>{t[`type_${v}`] ?? v}</option>)}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.dose_description}
          <input type="text" maxLength={80} value={draft.doseDescription} onChange={(e) => setField({ doseDescription: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.source_label}
          <input type="text" maxLength={160} value={draft.sourceLabel} onChange={(e) => setField({ sourceLabel: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">{t.notes}
          <textarea maxLength={240} rows={2} value={draft.notes} onChange={(e) => setField({ notes: e.target.value })}
            className="mt-0.5 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
      </div>
      <button type="button" onClick={addEntry} disabled={!canAdd} className="mb-4 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40">{t.add_entry} ({entries.length}/50)</button>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-xs font-bold text-red-300">{t.validation_error}</p>
        </div>
      )}

      {uiState === 'FULL' && result && (
        <div data-r6-summary="full" className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-bold text-zinc-100">{t.session_list}: {result.entries.length}</p>
          <p className="mt-1 text-xs text-amber-300">{t.interaction_unavailable}</p>
        </div>
      )}
      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">{t.state_hint_degraded}</div>
      )}

      <Tool025Genius
        locale={locale}
        state={uiState}
        entries={entries}
        result={result}
        output={run?.ok ? run.output : null}
        options={options}
        prevTool={{ slug: neighbors.prevTool.slug, titleEn: neighbors.prevTool.titleEn, titleAr: neighbors.prevTool.titleAr }}
        nextTool={{ slug: neighbors.nextTool.slug, titleEn: neighbors.nextTool.titleEn, titleAr: neighbors.nextTool.titleAr }}
        onRemove={removeEntry}
        t={t}
      />

      <p className="mt-4 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </section>
  );
}
