'use client';
/** Tool #033 — Bloodwork Trend Analyzer (dynamic UI, GPT2 spec). Instant
 * useMemo recompute, Zod validation, auto-draft, standard save, AR/EN RTL/LTR,
 * registry prev/next, structured AI context (no external call). */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeBloodworkTrends, type LabReading } from '@/lib/tools/engines/tool-033-bloodwork-trend-analyzer';
import { buildTrendAnalyzerOutput } from '@/lib/tools/adapters/tool-033-bloodwork-trend-analyzer';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { TrendAnalyzerInputSchema } from '@/lib/tools/schemas/tool-033-bloodwork-trend-analyzer';
import i18nJson from '@/i18n/tool-033-bloodwork-trend-analyzer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-033-bloodwork-trend-analyzer';
const MARKERS = ['Total T', 'E2', 'LH', 'FSH', 'ALT', 'AST', 'HDL', 'LDL', 'HCT'];
const DEFAULT_RANGES: Record<string, { low: number; high: number; unit: string }> = {
  'Total T': { low: 300, high: 1000, unit: 'ng/dL' }, 'E2': { low: 20, high: 40, unit: 'pg/mL' },
  'LH': { low: 1.7, high: 8.6, unit: 'mIU/mL' }, 'FSH': { low: 1.5, high: 12.4, unit: 'mIU/mL' },
  'ALT': { low: 7, high: 56, unit: 'U/L' }, 'AST': { low: 10, high: 40, unit: 'U/L' },
  'HDL': { low: 40, high: 100, unit: 'mg/dL' }, 'LDL': { low: 0, high: 100, unit: 'mg/dL' },
  'HCT': { low: 38, high: 52, unit: '%' },
};
interface DraftInputs { readings: LabReading[] }
const today = () => new Date().toISOString().slice(0, 10);

export default function Tool033BloodworkTrendAnalyzer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [readings, setReadings] = useState<LabReading[]>([
    { marker: 'Total T', value: 450, unit: 'ng/dL', date: today() },
  ]);
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
    if (Array.isArray(draft.inputs.readings) && draft.inputs.readings.length > 0) setReadings(draft.inputs.readings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const inputs = useMemo(() => ({ readings, ranges: DEFAULT_RANGES }), [readings]);
  const parsed = useMemo(() => TrendAnalyzerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? analyzeBloodworkTrends(parsed.data) : null), [parsed]);
  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const output = buildTrendAnalyzerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: '1970-01-01T00:00:00.000Z', recordedAt: '1970-01-01T00:00:00.000Z', timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale]);
  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);
  useEffect(() => {
    const key = JSON.stringify(inputs) + locale;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [inputs, locale]);
  const updateReading = (index: number, patch: Partial<LabReading>) => {
    setReadings((prev) => prev.map((r, i) => {
      if (i !== index) return r;
      const next = { ...r, ...patch };
      if (patch.marker && DEFAULT_RANGES[patch.marker]) next.unit = DEFAULT_RANGES[patch.marker].unit;
      return next;
    }));
  };
  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildTrendAnalyzerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
      else setSaveStatus(isRtl ? 'فشل الحفظ — سجل الدخول أولاً' : 'Save failed — sign in first');
    } finally { setIsSaving(false); }
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {readings.map((r, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <label className="text-[10px] text-zinc-500">{t.marker}
              <select value={r.marker} onChange={(e) => updateReading(i, { marker: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
                {MARKERS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </label>
            <label className="text-[10px] text-zinc-500">{t.value}
              <input type="number" step="any" value={r.value} onChange={(e) => updateReading(i, { value: Number(e.target.value) || 0 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <label className="text-[10px] text-zinc-500">{t.unit}
              <input value={r.unit} onChange={(e) => updateReading(i, { unit: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <label className="text-[10px] text-zinc-500">{t.date}
              <input type="date" value={r.date.slice(0, 10)} onChange={(e) => updateReading(i, { date: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <button type="button" onClick={() => setReadings((p) => p.filter((_, j) => j !== i))} disabled={readings.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setReadings((p) => [...p, { marker: 'Total T', value: 500, unit: DEFAULT_RANGES['Total T'].unit, date: today() }])} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700">+ {t.add_reading}</button>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.markers}</h3>
          <div className="space-y-2 mb-3">
            {result.markers.map((m) => (
              <div key={m.marker} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs">
                <span className="font-bold text-zinc-200" dir="ltr">{m.marker}: {m.latest_value} {m.unit}</span>
                <span className={`font-mono ${m.direction === 'rising' ? 'text-lime-400' : m.direction === 'falling' ? 'text-cyan-400' : 'text-zinc-400'}`} dir="ltr">{m.direction} {m.slope_per_30d}/30d</span>
                <span className={m.in_range ? 'text-zinc-500' : 'text-red-400 font-bold'}>{m.in_range ? `✓ ${t.in_range}` : '✗'}</span>
                {m.velocity_alert && (<span className="text-amber-300 font-bold">⚠ {t.velocity_alert}</span>)}
              </div>
            ))}
          </div>
          <h3 className="text-xs font-black text-zinc-300 mb-1">{t.summary}</h3>
          <ul className="space-y-1 text-xs text-zinc-300 mb-2">{result.summary.map((s, i) => (<li key={i}>• {s}</li>))}</ul>
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">AI context (structured values — no external model call)</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <div className="flex flex-col md:flex-row justify-between items-center pt-3 mt-3 border-t border-zinc-800 gap-3">
            <span className="text-xs text-zinc-500 font-mono">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition disabled:opacity-50">{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ في لوحة القيادة الحيوية (Save Snapshot)' : 'Save to Bio-Dashboard')}</button>
          </div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>←</span><span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </div>
  );
}
