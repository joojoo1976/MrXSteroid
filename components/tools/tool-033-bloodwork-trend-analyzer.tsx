'use client';
/** Tool #033 — Bloodwork Trend Analyzer (dynamic UI, GPT2 spec). Instant
 * useMemo recompute, Zod validation, auto-draft, standard save, AR/EN RTL/LTR,
 * registry prev/next, structured AI context (no external call). */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { analyzeBloodworkTrends, type LabReading } from '@/lib/tools/engines/tool-033-bloodwork-trend-analyzer';
import { buildTrendAnalyzerOutput } from '@/lib/tools/adapters/tool-033-bloodwork-trend-analyzer';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { TrendAnalyzerInputSchema } from '@/lib/tools/schemas/tool-033-bloodwork-trend-analyzer';
import i18nJson from '@/i18n/tool-033-bloodwork-trend-analyzer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-033-bloodwork-trend-analyzer';
const MARKERS = ['Total T', 'E2', 'LH', 'FSH', 'ALT', 'AST', 'HDL', 'LDL', 'HCT'];
interface DraftInputs { readings: LabReading[] }

function createBlankReading(): LabReading {
  return { marker: '', value: Number.NaN, unit: '', date: '' };
}

export default function Tool033BloodworkTrendAnalyzer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [readings, setReadings] = useState<LabReading[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDraftKey = useRef('');
  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (!draft) return;
    const savedInputs = TrendAnalyzerInputSchema.safeParse(draft.inputs);
    if (savedInputs.success && savedInputs.data.readings.length > 0) setReadings(savedInputs.data.readings);
  }, []);
  const inputs = useMemo(() => ({ readings }), [readings]);
  const parsed = useMemo(() => TrendAnalyzerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? analyzeBloodworkTrends(parsed.data) : null), [parsed]);
  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const latestDate = parsed.data.readings.reduce((latest, reading) => reading.date > latest ? reading.date : latest, parsed.data.readings[0]?.date ?? '1970-01-01');
    const output = buildTrendAnalyzerOutput(parsed.data, { locale, unitSystem, snapshotType: 'draft', calculatedAt: new Date().toISOString(), recordedAt: `${latestDate}T00:00:00.000Z`, timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale, unitSystem]);
  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);
  useEffect(() => {
    const key = JSON.stringify(inputs) + locale + unitSystem;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { saveDraft(TOOL_SLUG, inputs, { locale, unitSystem, savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [inputs, locale, unitSystem]);
  const updateReading = (index: number, patch: Partial<LabReading>) => {
    setReadings((prev) => prev.map((reading, i) => i === index ? { ...reading, ...patch } : reading));
  };
  const handleSave = async () => {
    if (!parsed.success || !result || readings.length === 0) { setSaveStatus(t.save_invalid); return; }
    setIsSaving(true);
    setSaveStatus(t.saving);
    try {
      const now = new Date().toISOString();
      const latestDate = parsed.data.readings.reduce((latest, reading) => reading.date > latest ? reading.date : latest, parsed.data.readings[0]?.date ?? '1970-01-01');
      const output = buildTrendAnalyzerOutput(parsed.data, { locale, unitSystem, snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: `${latestDate}T00:00:00.000Z`, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { clearDraft(TOOL_SLUG); setSaveStatus(t.saved); }
      else setSaveStatus(t.save_failed);
    } finally { setIsSaving(false); }
  };
  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>
      <p role="note" className="mb-3 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs leading-6 text-amber-100">{t.disclaimer}</p>
      <p className="mb-3 text-xs text-zinc-400">{t.unit_note}</p>
      <div className="space-y-2 mb-3">
        {readings.map((r, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <label className="text-[10px] text-zinc-500">{t.marker}
              <select value={r.marker} onChange={(e) => updateReading(i, { marker: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
                <option value="">{t.choose_marker}</option>
                {MARKERS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </label>
            <label className="text-[10px] text-zinc-500">{t.value}
              <input type="number" step="any" value={Number.isFinite(r.value) ? r.value : ''} onChange={(e) => updateReading(i, { value: e.target.value === '' ? Number.NaN : Number(e.target.value) })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <label className="text-[10px] text-zinc-500">{t.unit}
              <input value={r.unit} onChange={(e) => updateReading(i, { unit: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <label className="text-[10px] text-zinc-500">{t.date}
              <input type="date" value={r.date.slice(0, 10)} onChange={(e) => updateReading(i, { date: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <button type="button" aria-label={t.remove_reading} onClick={() => setReadings((p) => p.filter((_, j) => j !== i))} className="text-xs text-red-400">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setReadings((p) => [...p, createBlankReading()])} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700">+ {t.add_reading}</button>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {readings.length === 0 && <p className="mb-4 rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">{t.empty_state}</p>}
      {readings.length > 0 && !parsed.success && <p role="status" className="mb-4 rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">{t.incomplete_state}</p>}
      {result && result.markers.length > 0 && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.markers}</h3>
          <div className="space-y-2 mb-3">
            {result.markers.map((m) => (
              <div key={m.marker} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs">
                <span className="font-bold text-zinc-200" dir="ltr">{m.marker}: {m.latest_value} {m.unit} · {m.latest_date}</span>
                <span className="text-zinc-400">{t.points}: {m.points} · {t.distinct_dates}: {m.distinct_dates}</span>
                <span className="font-mono text-zinc-300" dir="ltr">{m.slope_per_30d === null ? t.insufficient_data : `${t[m.direction]} · ${m.slope_per_30d} ${m.unit}/30d`}</span>
              </div>
            ))}
          </div>
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">{t.ai_context}</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <div className="flex flex-col md:flex-row justify-between items-center pt-3 mt-3 border-t border-zinc-800 gap-3">
            <span className="text-xs text-zinc-500 font-mono">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving || !parsed.success || readings.length === 0} className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition disabled:opacity-50">{isSaving ? t.saving : t.save}</button>
          </div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>←</span><span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
