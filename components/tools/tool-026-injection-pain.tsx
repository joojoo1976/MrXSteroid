'use client';
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { runInjectionPain, type InjectionPainBuildOptions } from '@/lib/tools/r6/tool-026-injection-pain-pipeline';
import {
  evaluateDraftEntry,
  evaluateSession,
  type Tool026Draft,
  type Tool026UiState,
  type InjectionExperienceEntry,
} from '@/lib/tools/r6/tool-026-injection-pain-contract';
import Tool026Genius from './tool-026-injection-pain.genius';
import i18nJson from '@/i18n/tool-026-injection-pain.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-026-injection-pain';
const EMPTY_DRAFT: Tool026Draft = { eventDate: '', siteLabel: '', notes: '' };
const STATE_KEY: Record<Tool026UiState, string> = { EMPTY:'state_empty', PARTIAL:'state_partial', FULL:'state_full', INVALID:'state_invalid', DEGRADED:'state_degraded' };
const HINT_KEY: Record<Tool026UiState, string> = { EMPTY:'state_hint_empty', PARTIAL:'state_hint_partial', FULL:'state_hint_full', INVALID:'state_hint_invalid', DEGRADED:'state_hint_degraded' };

export default function Tool026InjectionExperienceLog() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const uid = useId();

  const [draft, setDraft] = useState<Tool026Draft>(EMPTY_DRAFT);
  const [entries, setEntries] = useState<InjectionExperienceEntry[]>([]);

  const options = useMemo<InjectionPainBuildOptions>(
    () => ({ calculatedAt: new Date().toISOString(), recordedAt: new Date().toISOString(), locale, unitSystem, snapshotType: 'submitted_snapshot', timezone: 'UTC', source: 'manual' }),
    [locale, unitSystem],
  );

  const evaluation = evaluateSession(entries, draft);
  const run = evaluation.input ? runInjectionPain(evaluation.input, options) : null;
  const result = run?.ok ? run.output.result : null;
  const uiState: Tool026UiState = evaluation.state === 'READY' ? (run && run.ok ? 'FULL' : 'DEGRADED') : evaluation.state;

  const draftEval = evaluateDraftEntry(draft);
  const canAdd = draftEval.valid && entries.length < 100;

  const addEntry = () => {
    if (!canAdd) return;
    const entry: InjectionExperienceEntry = {
      id: crypto.randomUUID(),
      eventDate: draft.eventDate.trim(),
      ...(draft.siteLabel.trim() ? { siteLabel: draft.siteLabel.trim() } : {}),
      notes: draft.notes.trim(),
    };
    setEntries((prev) => [...prev, entry]);
    setDraft(EMPTY_DRAFT);
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const setField = (patch: Partial<Tool026Draft>) => setDraft((p) => ({ ...p, ...patch }));

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
        <label className="text-[10px] font-bold text-zinc-500">{t.event_date}
          <input data-r6-field="eventDate" type="date" value={draft.eventDate} onChange={(e) => setField({ eventDate: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.site_label}
          <input data-r6-field="siteLabel" type="text" maxLength={120} value={draft.siteLabel} onChange={(e) => setField({ siteLabel: e.target.value })}
            className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">{t.experience_notes}
          <textarea data-r6-field="notes" maxLength={500} rows={3} value={draft.notes} onChange={(e) => setField({ notes: e.target.value })}
            className="mt-0.5 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white" />
        </label>
      </div>
      <button type="button" onClick={addEntry} disabled={!canAdd} className="mb-4 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40">{t.add_entry} ({entries.length}/100)</button>

      {uiState === 'INVALID' && (
        <div role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-xs font-bold text-red-300">{t.validation_error}</p>
        </div>
      )}

      {uiState === 'FULL' && result && (
        <div data-r6-summary="full" className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-sm font-bold text-zinc-100">{t.session_records}: {result.entries.length}</p>
          <p className="mt-1 text-xs text-amber-300">{t.assessment_unavailable}</p>
        </div>
      )}
      {uiState === 'DEGRADED' && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">{t.state_hint_degraded}</div>
      )}

      <Tool026Genius
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
