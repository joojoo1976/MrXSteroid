'use client';
/** Tool #066 — Estrogen Sensitivity Manager (dynamic UI, GPT2 spec).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { manageEstrogenSensitivity, type EstrogenSensitivityResult } from '@/lib/tools/engines/tool-066-estrogen-sensitivity-manager';
import { buildEstrogenSensitivityOutput } from '@/lib/tools/adapters/tool-066-estrogen-sensitivity-manager';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { EstrogenSensitivityInputSchema } from '@/lib/tools/schemas/tool-066-estrogen-sensitivity-manager';
import i18nJson from '@/i18n/tool-066-estrogen-sensitivity-manager.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-066-estrogen-sensitivity-manager';
interface DraftInputs {
  e2_level_pg_ml: number;
  water_retention_score: number;
  nipple_sensitivity: boolean;
  mood_lability_score: number;
  libido_impact: 'none' | 'reduced' | 'crashed';
}

const PATTERN_COLOR: Record<string, string> = {
  'low-sensitivity': 'text-lime-400',
  'normal-sensitivity': 'text-cyan-400',
  'high-sensitivity': 'text-amber-400',
};

export default function Tool066EstrogenSensitivityManager() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    e2_level_pg_ml: 30,
    water_retention_score: 1,
    nipple_sensitivity: false,
    mood_lability_score: 1,
    libido_impact: 'none',
  });
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

  const parsedInput = useMemo(() => EstrogenSensitivityInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<EstrogenSensitivityResult | null>(() => (parsedInput.success ? manageEstrogenSensitivity(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildEstrogenSensitivityOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
    return buildAiContext({ ...output, result });
  }, [result, parsedInput, locale]);

  useEffect(() => { setValidationError(parsedInput.success ? null : parsedInput.error.issues[0]?.message ?? 'Invalid input'); }, [parsedInput]);

  useEffect(() => {
    const key = JSON.stringify(inputs) + locale;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    const timer = setTimeout(() => { saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }); }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const handleSave = async () => {
    if (!parsedInput.success || !result) { setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first'); return; }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildEstrogenSensitivityOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsedInput.data);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.e2_level}
          <input type="number" min={5} max={200} step={1} value={inputs.e2_level_pg_ml} onChange={(e) => setInputs((p) => ({ ...p, e2_level_pg_ml: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.water_retention}
          <select value={inputs.water_retention_score} onChange={(e) => setInputs((p) => ({ ...p, water_retention_score: Number(e.target.value) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
            <option value={0}>{t.water_none}</option>
            <option value={1}>{t.water_mild}</option>
            <option value={2}>{t.water_mod}</option>
            <option value={3}>{t.water_sev}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.mood_lability}
          <select value={inputs.mood_lability_score} onChange={(e) => setInputs((p) => ({ ...p, mood_lability_score: Number(e.target.value) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
            <option value={0}>{t.mood_none}</option>
            <option value={1}>{t.mood_mild}</option>
            <option value={2}>{t.mood_mod}</option>
            <option value={3}>{t.mood_sev}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.libido_impact}
          <select value={inputs.libido_impact} onChange={(e) => setInputs((p) => ({ ...p, libido_impact: e.target.value as DraftInputs['libido_impact'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white">
            <option value="none">{t.libido_none}</option>
            <option value="reduced">{t.libido_reduced}</option>
            <option value="crashed">{t.libido_crashed}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 md:col-span-2">
          <input type="checkbox" checked={inputs.nipple_sensitivity} onChange={(e) => setInputs((p) => ({ ...p, nipple_sensitivity: e.target.checked }))} className="rounded" />
          {t.nipple_sensitivity}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.sensitivity_pattern}</span><span className={`text-sm font-bold font-mono ${PATTERN_COLOR[result.sensitivity_pattern] ?? 'text-white'}`}>{result.sensitivity_pattern}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.symptom_score}</span><span className="text-3xl font-black font-mono text-white">{result.total_symptom_score}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.contextual_band}</span><span className="text-xs font-bold font-mono text-zinc-200">{result.contextual_band}</span></div>
          </div>
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-amber-300">{result.warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
            </div>
          )}
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">AI context (structured values — no external model call)</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <p className="text-[10px] text-zinc-500">{t.disclaimer}</p>
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
