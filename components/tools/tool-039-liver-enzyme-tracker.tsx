'use client';
/** Tool #039 — Liver Enzyme Tracker (dynamic UI, GPT2 spec). useMemo instant
 * recompute, Zod validation, auto-draft via shared adapter, standard
 * Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { trackLiverEnzymes, type LiverTrackerResult } from '@/lib/tools/engines/tool-039-liver-enzyme-tracker';
import { buildLiverTrackerOutput } from '@/lib/tools/adapters/tool-039-liver-enzyme-tracker';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { LiverTrackerInputSchema } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import i18nJson from '@/i18n/tool-039-liver-enzyme-tracker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-039-liver-enzyme-tracker';
type Marker = 'ALT' | 'AST' | 'GGT' | 'ALP' | 'bilirubin';
const MARKERS: Marker[] = ['ALT', 'AST', 'GGT', 'ALP', 'bilirubin'];
const UNITS: Record<Marker, string> = { ALT: 'U/L', AST: 'U/L', GGT: 'U/L', ALP: 'U/L', bilirubin: 'mg/dL' };
interface ReadingUI { marker: Marker; value: number; unit: string; date: string }
interface DraftInputs { readings: ReadingUI[]; oral_steroids: boolean; alcohol_drinks_per_week: number; uses_tudca: boolean }

const STATUS_COLOR: Record<string, string> = { normal: 'text-lime-400', elevated: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' };

export default function Tool039LiverEnzymeTracker() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({ readings: [{ marker: 'ALT', value: 45, unit: 'U/L', date: new Date().toISOString().slice(0, 10) }], oral_steroids: false, alcohol_drinks_per_week: 0, uses_tudca: true });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDraftKey = useRef('');

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((prev) => ({ ...prev, ...draft.inputs }));
  }, []);

  const parsed = useMemo(() => LiverTrackerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<LiverTrackerResult | null>(() => (parsed.success ? trackLiverEnzymes(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildLiverTrackerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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

  const addReading = () => setInputs((p) => (p.readings.length >= 100 ? p : { ...p, readings: [...p.readings, { marker: 'ALT' as Marker, value: 40, unit: 'U/L', date: new Date().toISOString().slice(0, 10) }] }));

  const handleSave = async () => {
    if (!parsed.success) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildLiverTrackerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
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
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.markers}</h2>
      <div className="space-y-2 mb-3">
        {inputs.readings.map((r, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <select value={r.marker} onChange={(e) => setInputs((p) => ({ ...p, readings: p.readings.map((x, j) => (j === i ? { ...x, marker: e.target.value as Marker, unit: UNITS[e.target.value as Marker] } : x)) }))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
              {MARKERS.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
            <label className="text-[10px] text-zinc-500">{t.value}
              <input type="number" min={0} max={5000} value={r.value} onChange={(e) => setInputs((p) => ({ ...p, readings: p.readings.map((x, j) => (j === i ? { ...x, value: e.target.value === '' ? 0 : Number(e.target.value) } : x)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <input value={r.unit} onChange={(e) => setInputs((p) => ({ ...p, readings: p.readings.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)) }))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder="U/L" />
            <input type="date" value={r.date.slice(0, 10)} onChange={(e) => setInputs((p) => ({ ...p, readings: p.readings.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) }))} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            <button type="button" onClick={() => setInputs((p) => (p.readings.length <= 1 ? p : { ...p, readings: p.readings.filter((_, j) => j !== i) }))} disabled={inputs.readings.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addReading} disabled={inputs.readings.length >= 100} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_reading}</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.oral_steroids} onChange={(e) => setInputs((p) => ({ ...p, oral_steroids: e.target.checked }))} className="accent-lime-500" />{t.oral_steroids}
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.uses_tudca} onChange={(e) => setInputs((p) => ({ ...p, uses_tudca: e.target.checked }))} className="accent-lime-500" />{t.tudca}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.alcohol} (drinks/wk)
          <input type="number" min={0} max={100} value={inputs.alcohol_drinks_per_week} onChange={(e) => setInputs((p) => ({ ...p, alcohol_drinks_per_week: Math.round(e.target.value === '' ? 0 : Number(e.target.value)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className={`bg-zinc-950 p-3 rounded-lg border ${result.overall_status === 'normal' ? 'border-lime-500/40' : result.overall_status === 'critical' ? 'border-red-500/40' : 'border-amber-500/40'}`}>
              <span className="text-[10px] text-zinc-400 block">{t.overall_status}</span><span className={`text-xl font-bold font-mono ${STATUS_COLOR[result.overall_status] ?? 'text-zinc-300'}`}>{result.overall_status}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.stop_orals}</span><span className={`text-xl font-bold font-mono ${result.stop_orals ? 'text-red-400' : 'text-lime-400'}`}>{result.stop_orals ? (isRtl ? 'نعم — أوقف الفموية' : 'YES — stop orals') : (isRtl ? 'لا' : 'No')}</span></div>
          </div>
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.markers}</h3>
          <ul className="space-y-1 text-xs text-zinc-300 mb-3" dir="ltr">
            {result.markers.map((m, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5">
                <span className="font-bold text-zinc-300">{m.marker}</span>
                <span className="font-mono text-zinc-400">{m.latest_value} {m.unit}</span>
                <span className="font-mono text-zinc-500">{m.uln_multiple.toFixed(2)}× ULN</span>
                <span className={`font-mono font-bold ${STATUS_COLOR[m.status] ?? 'text-zinc-400'}`}>{m.status}</span>
                <span className={`font-mono text-[10px] ${(m.trend_per_30d ?? 0) > 0 ? 'text-red-400' : 'text-lime-400'}`}>{(m.trend_per_30d ?? 0) >= 0 ? '↗' : '↘'} {Math.abs(m.trend_per_30d ?? 0).toFixed(1)}/30d</span>
              </li>
            ))}
          </ul>
          {result.recommendations.length > 0 && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-cyan-400 block mb-1">{t.recommendations}</span>
              <ul className="space-y-0.5 text-xs text-cyan-300">{result.recommendations.map((r, i) => (<li key={i}>• {r}</li>))}</ul>
            </div>
          )}
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
