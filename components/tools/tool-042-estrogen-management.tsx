'use client';
/** Tool #042 — Estrogen Management Pro (dynamic UI). useMemo instant recompute,
 * Zod validation, auto-draft, Bio-Dashboard save, AR/EN, prev/next. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { manageEstrogen, type EstrogenResult } from '@/lib/tools/engines/tool-042-estrogen-management';
import { buildEstrogenOutput } from '@/lib/tools/adapters/tool-042-estrogen-management';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { EstrogenInputSchema } from '@/lib/tools/schemas/tool-042-estrogen-management';
import i18nJson from '@/i18n/tool-042-estrogen-management.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-042-estrogen-management';
type Symptom = 'nipple_sensitivity' | 'water_retention' | 'mood_swings' | 'low_libido' | 'edema';
const SYMPTOMS: Symptom[] = ['nipple_sensitivity', 'water_retention', 'mood_swings', 'low_libido', 'edema'];
interface DraftInputs { e2_pg_ml: number; weekly_testosterone_mg: number; taking_ai: boolean; weekly_ai_dose_mg: number; symptoms: Symptom[]; body_fat_pct: number }

const DEFAULTS: DraftInputs = { e2_pg_ml: 45, weekly_testosterone_mg: 500, taking_ai: true, weekly_ai_dose_mg: 0.5, symptoms: [], body_fat_pct: 18 };
const BAND_COLOR: Record<string, string> = { low: 'text-cyan-400', optimal: 'text-lime-400', elevated: 'text-amber-400', high: 'text-red-400' };
const ACTION_AR: Record<string, string> = { none: 'لا شيء', monitor: 'راقب', adjust_ai: 'عدّل جرعة المثبط', reduce_test: 'قلّل التستوستيرون' };
const SYMPTOM_AR: Record<Symptom, string> = { nipple_sensitivity: 'حساسية الحلمة', water_retention: 'احتباس الماء', mood_swings: 'تقلب المزاج', low_libido: 'انخفاض الرغبة', edema: 'وذمة' };

export default function Tool042EstrogenManagement() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>(DEFAULTS);
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

  const parsed = useMemo(() => EstrogenInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<EstrogenResult | null>(() => (parsed.success ? manageEstrogen(parsed.data) : null), [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildEstrogenOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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

  const toggleSymptom = (s: Symptom) => setInputs((p) => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter((x) => x !== s) : [...p.symptoms, s] }));

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildEstrogenOutput(parsed.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.e2}
          <input type="number" min={5} max={500} value={inputs.e2_pg_ml} onChange={(e) => setInputs((p) => ({ ...p, e2_pg_ml: num(e.target.value, 5) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.weekly_test}
          <input type="number" min={0} max={1000} value={inputs.weekly_testosterone_mg} onChange={(e) => setInputs((p) => ({ ...p, weekly_testosterone_mg: num(e.target.value, 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.body_fat}
          <input type="number" min={5} max={60} value={inputs.body_fat_pct} onChange={(e) => setInputs((p) => ({ ...p, body_fat_pct: num(e.target.value, 5) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input type="checkbox" checked={inputs.taking_ai} onChange={(e) => setInputs((p) => ({ ...p, taking_ai: e.target.checked }))} className="accent-lime-500" />{t.taking_ai}
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.ai_dose}
          <input type="number" min={0} max={7} step={0.25} value={inputs.weekly_ai_dose_mg} onChange={(e) => setInputs((p) => ({ ...p, weekly_ai_dose_mg: num(e.target.value, 0) }))} disabled={!inputs.taking_ai} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono disabled:opacity-40" />
        </label>
      </div>
      <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">{t.symptoms}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {SYMPTOMS.map((s) => (
          <button key={s} type="button" onClick={() => toggleSymptom(s)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${inputs.symptoms.includes(s) ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'}`}>
            {isRtl ? SYMPTOM_AR[s] : s}
          </button>
        ))}
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.band}</span><span className={`text-xl font-bold font-mono ${BAND_COLOR[result.band] ?? 'text-zinc-300'}`}>{result.band}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.optimal}</span><span className="text-xl font-bold font-mono text-lime-400">{result.optimal_range.low}-{result.optimal_range.high}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.delta}</span><span className={`text-xl font-bold font-mono ${result.ai_delta_mg > 0 ? 'text-amber-400' : result.ai_delta_mg < 0 ? 'text-cyan-400' : 'text-zinc-500'}`}>{result.ai_delta_mg > 0 ? '+' : ''}{result.ai_delta_mg}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.action}</span><span className="text-sm font-bold text-white">{isRtl ? (ACTION_AR[result.action] ?? result.action) : result.action}</span></div>
          </div>
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
