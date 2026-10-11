'use client';
/** Tool #081 — Cellular Aging Calculator (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateCellularAging, type CellularAgingResult } from '@/lib/tools/engines/tool-081-cellular-aging-calculator';
import { buildCellularAgingOutput } from '@/lib/tools/adapters/tool-081-cellular-aging-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { CellularAgingInputSchema } from '@/lib/tools/schemas/tool-081-cellular-aging-calculator';
import i18nJson from '@/i18n/tool-081-cellular-aging-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-081-cellular-aging-calculator';
type Smoking = 'never' | 'former' | 'current';
type SunProt = 'never' | 'sometimes' | 'always';
type DietFreq = 'rare' | 'moderate' | 'high';

interface DraftInputs {
  chronological_age: number;
  smoking_history: Smoking;
  weekly_sun_protection_frequency: SunProt;
  average_sleep_hours: number;
  ultra_processed_food_frequency: DietFreq;
  regular_strength_training: boolean;
}

const TIER_COLOR: Record<string, string> = {
  'resilient': 'text-lime-400',
  'moderate-wear': 'text-amber-400',
  'accelerated-stress': 'text-red-400',
};

export default function Tool081CellularAgingCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    chronological_age: 32,
    smoking_history: 'never',
    weekly_sun_protection_frequency: 'always',
    average_sleep_hours: 7.5,
    ultra_processed_food_frequency: 'rare',
    regular_strength_training: true,
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

  const parsedInput = useMemo(() => CellularAgingInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<CellularAgingResult | null>(() => (parsedInput.success ? calculateCellularAging(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildCellularAgingOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildCellularAgingOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.chronological_age}
          <input type="number" min={18} max={90} step={1} value={inputs.chronological_age} onChange={(e) => setInputs((p) => ({ ...p, chronological_age: Number(e.target.value || 18) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.smoking}
          <select value={inputs.smoking_history} onChange={(e) => setInputs((p) => ({ ...p, smoking_history: e.target.value as Smoking }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="never">{t.smoking_never}</option>
            <option value="former">{t.smoking_former}</option>
            <option value="current">{t.smoking_current}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.sun_protection}
          <select value={inputs.weekly_sun_protection_frequency} onChange={(e) => setInputs((p) => ({ ...p, weekly_sun_protection_frequency: e.target.value as SunProt }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="never">{t.sun_never}</option>
            <option value="sometimes">{t.sun_sometimes}</option>
            <option value="always">{t.sun_always}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.sleep_hours}
          <input type="number" min={3} max={12} step={0.5} value={inputs.average_sleep_hours} onChange={(e) => setInputs((p) => ({ ...p, average_sleep_hours: Number(e.target.value || 3) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.diet}
          <select value={inputs.ultra_processed_food_frequency} onChange={(e) => setInputs((p) => ({ ...p, ultra_processed_food_frequency: e.target.value as DietFreq }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="rare">{t.diet_rare}</option>
            <option value="moderate">{t.diet_moderate}</option>
            <option value="high">{t.diet_high}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 pt-4">
          <input type="checkbox" checked={inputs.regular_strength_training} onChange={(e) => setInputs((p) => ({ ...p, regular_strength_training: e.target.checked }))} className="rounded" />
          {t.strength_training}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.age_delta}</span><span className={`text-3xl font-black font-mono ${result.biological_age_delta_estimate <= 0 ? 'text-lime-400' : 'text-red-400'}`}>{result.biological_age_delta_estimate > 0 ? `+${result.biological_age_delta_estimate}` : result.biological_age_delta_estimate}</span><span className="text-[10px] text-zinc-400 block">years</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.phenotypic_age}</span><span className="text-3xl font-black font-mono text-white">{result.estimated_phenotypic_age}</span><span className="text-[10px] text-zinc-400 block">years</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.cellular_tier}</span><span className={`text-xs font-bold font-mono ${TIER_COLOR[result.cellular_stress_tier] ?? 'text-white'}`}>{result.cellular_stress_tier}</span></div>
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
