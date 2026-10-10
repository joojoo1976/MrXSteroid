'use client';
/** Tool #040 — Lipid Profile Optimizer (dynamic UI, GPT2 spec). useMemo instant
 * recompute, Zod validation, auto-draft via shared adapter, standard
 * Save-to-Bio-Dashboard, AR/EN RTL/LTR, registry prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { optimizeLipidProfile, type LipidOptimizerResult } from '@/lib/tools/engines/tool-040-lipid-profile-optimizer';
import { buildLipidOptimizerOutput } from '@/lib/tools/adapters/tool-040-lipid-profile-optimizer';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { LipidOptimizerInputSchema } from '@/lib/tools/schemas/tool-040-lipid-profile-optimizer';
import i18nJson from '@/i18n/tool-040-lipid-profile-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-040-lipid-profile-optimizer';
interface DraftInputs { ldl_mg_dl: number; hdl_mg_dl: number; triglycerides_mg_dl: number; age: number; smoker: boolean; systolic_bp: number; on_cycle: boolean; weeks_remaining: number }

const DEFAULTS: DraftInputs = { ldl_mg_dl: 130, hdl_mg_dl: 38, triglycerides_mg_dl: 180, age: 32, smoker: false, systolic_bp: 125, on_cycle: true, weeks_remaining: 8 };
const BAND_COLOR: Record<string, string> = { optimal: 'text-lime-400', borderline: 'text-amber-400', high: 'text-orange-400', 'very-high': 'text-red-400' };
const BAND_LABEL_AR: Record<string, string> = { optimal: 'مثالي', borderline: 'حدّي', high: 'مرتفع', 'very-high': 'مرتفع جدًا' };

export default function Tool040LipidProfileOptimizer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>(DEFAULTS);
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

  const zodInput = useMemo(() => ({
    panel: { ldl_mg_dl: inputs.ldl_mg_dl, hdl_mg_dl: inputs.hdl_mg_dl, triglycerides_mg_dl: inputs.triglycerides_mg_dl },
    age: inputs.age,
    smoker: inputs.smoker,
    systolic_bp: inputs.systolic_bp,
    on_cycle: inputs.on_cycle,
    weeks_remaining: inputs.weeks_remaining,
  }), [inputs]);

  const parsed = useMemo(() => LipidOptimizerInputSchema.safeParse(zodInput), [zodInput]);
  const result = useMemo<LipidOptimizerResult | null>(() => (parsed.success ? optimizeLipidProfile(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildLipidOptimizerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    setSaveStatus(isRtl ? 'جاري الحفظ...' : 'Saving...');
    try {
      const now = new Date().toISOString();
      const output = buildLipidOptimizerOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
      else setSaveStatus(isRtl ? 'فشل الحفظ — سجل الدخول أولاً' : 'Save failed — sign in first');
    } finally { setIsSaving(false); }
  };

  const num = (v: string, fallback: number) => (v === '' ? fallback : Number(v));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.ldl} (mg/dL)
          <input type="number" min={0} max={600} value={inputs.ldl_mg_dl} onChange={(e) => setInputs((p) => ({ ...p, ldl_mg_dl: num(e.target.value, 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.hdl} (mg/dL)
          <input type="number" min={0} max={200} value={inputs.hdl_mg_dl} onChange={(e) => setInputs((p) => ({ ...p, hdl_mg_dl: num(e.target.value, 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.tg} (mg/dL)
          <input type="number" min={0} max={2000} value={inputs.triglycerides_mg_dl} onChange={(e) => setInputs((p) => ({ ...p, triglycerides_mg_dl: num(e.target.value, 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.age}
          <input type="number" min={18} max={90} value={inputs.age} onChange={(e) => setInputs((p) => ({ ...p, age: Math.round(num(e.target.value, 18)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.sbp} (mmHg)
          <input type="number" min={80} max={260} value={inputs.systolic_bp} onChange={(e) => setInputs((p) => ({ ...p, systolic_bp: Math.round(num(e.target.value, 80)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.weeks_remaining}
          <input type="number" min={0} max={52} value={inputs.weeks_remaining} onChange={(e) => setInputs((p) => ({ ...p, weeks_remaining: Math.round(num(e.target.value, 0)) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.smoker} onChange={(e) => setInputs((p) => ({ ...p, smoker: e.target.checked }))} className="accent-lime-500" />{t.smoker}
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.on_cycle} onChange={(e) => setInputs((p) => ({ ...p, on_cycle: e.target.checked }))} className="accent-lime-500" />{t.on_cycle}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            {([['LDL', result.ldl_status], ['HDL', result.hdl_status], ['TG', result.tg_status], [isRtl ? 'الكلي' : 'Overall', result.overall_band]] as const).map(([label, band]) => (
              <div key={label} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">{label}</span>
                <span className={`text-lg font-bold font-mono ${BAND_COLOR[band] ?? 'text-zinc-300'}`}>{isRtl ? (BAND_LABEL_AR[band] ?? band) : band}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-400 mb-3">{t.non_hdl}: <span className="font-mono text-cyan-400 font-bold">{result.non_hdl.toFixed(0)} mg/dL</span></div>
          {result.interventions.length > 0 && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-cyan-400 block mb-1">{t.interventions}</span>
              <ul className="space-y-0.5 text-xs text-cyan-300">{result.interventions.map((iv, i) => (<li key={i}>• {iv}</li>))}</ul>
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
