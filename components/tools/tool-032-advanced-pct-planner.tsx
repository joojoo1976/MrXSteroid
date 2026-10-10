'use client';
/** Tool #032 — Advanced PCT Planner (dynamic UI, GPT2 spec). Instant useMemo
 * recompute, Zod validation, auto-draft, standard Save-to-Bio-Dashboard,
 * AR/EN RTL/LTR, registry prev/next, structured AI context (no external call). */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { planAdvancedPCT, type PctCompound } from '@/lib/tools/engines/tool-032-advanced-pct-planner';
import { buildPctPlannerOutput } from '@/lib/tools/adapters/tool-032-advanced-pct-planner';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { PctPlannerInputSchema } from '@/lib/tools/schemas/tool-032-advanced-pct-planner';
import i18nJson from '@/i18n/tool-032-advanced-pct-planner.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-032-advanced-pct-planner';
interface DraftInputs { compounds: PctCompound[]; hcgUsed: boolean }
const today = () => new Date().toISOString().slice(0, 10);

export default function Tool032AdvancedPctPlanner() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [hcgUsed, setHcgUsed] = useState(false);
  const [compounds, setCompounds] = useState<PctCompound[]>([
    { name_en: 'Testosterone Enanthate', ester_half_life_days: 4.5, weekly_dose_mg: 500, last_dose_date: today(), suppression_factor: 1 },
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
    if (typeof draft.inputs.hcgUsed === 'boolean') setHcgUsed(draft.inputs.hcgUsed);
    if (Array.isArray(draft.inputs.compounds) && draft.inputs.compounds.length > 0) setCompounds(draft.inputs.compounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const inputs = useMemo(() => ({ compounds, hcg_used_on_cycle: hcgUsed }), [compounds, hcgUsed]);
  const parsed = useMemo(() => PctPlannerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => (parsed.success ? planAdvancedPCT(parsed.data) : null), [parsed]);
  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const output = buildPctPlannerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: '1970-01-01T00:00:00.000Z', recordedAt: '1970-01-01T00:00:00.000Z', timezone: 'UTC' });
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
  const updateCompound = (index: number, patch: Partial<PctCompound>) => {
    setCompounds((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };
  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildPctPlannerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <label className="mb-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
        <input type="checkbox" checked={hcgUsed} onChange={(e) => setHcgUsed(e.target.checked)} className="h-4 w-4 accent-lime-500" />
        {t.hcg_on_cycle}
      </label>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.compounds}</h2>
      <div className="space-y-2 mb-3">
        {compounds.map((c, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
            <input value={c.name_en} onChange={(e) => updateCompound(i, { name_en: e.target.value })} className="rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white" placeholder="Name" />
            <label className="text-[10px] text-zinc-500">HL d
              <input type="number" step={0.1} min={0.5} max={60} value={c.ester_half_life_days} onChange={(e) => updateCompound(i, { ester_half_life_days: Number(e.target.value) || 0.5 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">mg/wk
              <input type="number" min={1} max={5000} value={c.weekly_dose_mg} onChange={(e) => updateCompound(i, { weekly_dose_mg: Number(e.target.value) || 1 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">SF 0-5
              <input type="number" step={0.1} min={0} max={5} value={c.suppression_factor} onChange={(e) => updateCompound(i, { suppression_factor: Number(e.target.value) || 0 })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
            </label>
            <label className="text-[10px] text-zinc-500">Last dose
              <input type="date" value={c.last_dose_date.slice(0, 10)} onChange={(e) => updateCompound(i, { last_dose_date: e.target.value })} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" dir="ltr" />
            </label>
            <button type="button" onClick={() => setCompounds((p) => p.filter((_, j) => j !== i))} disabled={compounds.length <= 1} className="text-xs text-red-400 disabled:opacity-30">✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setCompounds((p) => (p.length >= 8 ? p : [...p, { name_en: 'New compound', ester_half_life_days: 4.5, weekly_dose_mg: 250, last_dose_date: today(), suppression_factor: 1 }]))} disabled={compounds.length >= 8} className="mb-4 px-4 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-40">+ {t.add_compound}</button>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-lime-500/40"><span className="text-[10px] text-zinc-400 block">{t.pct_start_date}</span><span className="text-lg font-bold text-lime-400 font-mono" dir="ltr">{result.pct_start_date}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.washout_days}</span><span className="text-xl font-bold text-cyan-400 font-mono">{result.washout_days}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.suppression_load}</span><span className="text-xl font-bold text-amber-400 font-mono">{result.suppression_load}</span></div>
          </div>
          <h3 className="text-xs font-black text-zinc-300 mb-2">{t.serm_protocol}</h3>
          <ul className="space-y-1 text-xs text-zinc-300 mb-3">{result.serm_protocol.map((p, i) => (<li key={i} dir="ltr">• {p.drug} — {p.daily_dose_mg} × {p.weeks}w ({p.note})</li>))}</ul>
          <div className="text-xs text-zinc-400 mb-2">{t.hcg_bridge}: {result.hcg_bridge ? (<span dir="ltr">{result.hcg_bridge.dose_iu} IU {result.hcg_bridge.per_week}x/wk × {result.hcg_bridge.weeks}w</span>) : (<span>{t.no_hcg_bridge}</span>)}</div>
          <ul className="space-y-1 text-xs text-amber-300/90">{result.warnings.map((w, i) => (<li key={i}>⚠ {w}</li>))}</ul>
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
