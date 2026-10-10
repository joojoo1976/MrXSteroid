'use client';
/** Tool #041 — Hematocrit Monitor (dynamic UI, GPT2 spec). useMemo instant
 * recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN, prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { monitorHematocrit, type HematocritResult } from '@/lib/tools/engines/tool-041-hematocrit-monitor';
import { buildHematocritOutput } from '@/lib/tools/adapters/tool-041-hematocrit-monitor';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { HematocritInputSchema } from '@/lib/tools/schemas/tool-041-hematocrit-monitor';
import i18nJson from '@/i18n/tool-041-hematocrit-monitor.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-041-hematocrit-monitor';
interface ReadingUI { hct_pct: number; date: string }
interface DraftInputs { readings: ReadingUI[]; sex: 'male' | 'female'; on_cycle: boolean; weeks_remaining: number }

const today = () => new Date().toISOString().slice(0, 10);
const BAND_COLOR: Record<string, string> = { normal: 'text-lime-400', borderline: 'text-amber-400', high: 'text-orange-400', 'very-high': 'text-red-400' };

export default function Tool041HematocritMonitor() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({ readings: [{ hct_pct: 45, date: today() }, { hct_pct: 48, date: today() }], sex: 'male', on_cycle: true, weeks_remaining: 8 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const prevDraftKey = useRef('');

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((prev) => ({ ...prev, ...draft.inputs }));
  }, []);

  const parsed = useMemo(() => HematocritInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<HematocritResult | null>(() => (parsed.success ? monitorHematocrit(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildHematocritOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale]);

  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);

  useEffect(() => {
    const key = JSON.stringify(inputs) + locale;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    const timer = setTimeout(() => { saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const addReading = () => setInputs((p) => (p.readings.length >= 24 ? p : { ...p, readings: [...p.readings, { hct_pct: 48, date: today() }] }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildHematocritOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.readings}</h2>
      <div className="space-y-2 mb-3">
        {inputs.readings.map((r, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <label className="text-[10px] font-bold text-zinc-500">{t.hct}
              <input type="number" min={20} max={70} value={r.hct_pct} onChange={(e) => setInputs((p) => ({ ...p, readings: p.readings.map((x, j) => (j === i ? { ...x, hct_pct: e.target.value === '' ? 0 : Number(e.target.value) } : x)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] font-bold text-zinc-500">{t.date}
              <input type="date" value={r.date.slice(0, 10)} onChange={(e) => setInputs((p) => ({ ...p, readings: p.readings.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <button type="button" onClick={() => setInputs((p) => (p.readings.length <= 2 ? p : { ...p, readings: p.readings.filter((_, j) => j !== i) }))} disabled={inputs.readings.length <= 2} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addReading} disabled={inputs.readings.length >= 24} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_reading}</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.sex}
          <select value={inputs.sex} onChange={(e) => setInputs((p) => ({ ...p, sex: e.target.value as 'male' | 'female' }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.weeks_remaining}
          <input type="number" min={0} max={52} value={inputs.weeks_remaining} onChange={(e) => setInputs((p) => ({ ...p, weeks_remaining: Math.round(Number(e.target.value) || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.on_cycle} onChange={(e) => setInputs((p) => ({ ...p, on_cycle: e.target.checked }))} className="accent-lime-500" />{t.on_cycle}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && result.latest_hct_pct > 0 && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.hct}</span><span className="text-2xl font-black text-white font-mono">{result.latest_hct_pct}%</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.band}</span><span className={`text-xl font-bold font-mono ${BAND_COLOR[result.band] ?? 'text-zinc-300'}`}>{result.band}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.trend}</span><span className={`text-xl font-bold font-mono ${result.slope_per_30d > 1.5 ? 'text-red-400' : 'text-lime-400'}`}>{result.slope_per_30d >= 0 ? '+' : ''}{result.slope_per_30d}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.donate}</span><span className={`text-xl font-bold font-mono ${result.donate_eligible ? 'text-amber-400' : 'text-zinc-500'}`}>{result.donate_eligible ? (isRtl ? 'نعم' : 'YES') : (isRtl ? 'لا' : 'No')}</span></div>
          </div>
          {result.projected_threshold_date && (
            <div className="text-xs text-zinc-400 mb-3">{t.projected}: <span className="font-mono text-amber-400 font-bold">{result.projected_threshold_date}</span></div>
          )}
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-red-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-red-300">{result.warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
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

