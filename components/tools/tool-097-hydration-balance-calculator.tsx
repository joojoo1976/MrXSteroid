'use client';
/** Tool #097 — Hydration Balance Calculator (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateHydrationBalance, type HydrationBalanceCalculatorResult } from '@/lib/tools/engines/tool-097-hydration-balance-calculator';
import { buildHydrationBalanceCalculatorOutput } from '@/lib/tools/adapters/tool-097-hydration-balance-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { HydrationBalanceCalculatorInputSchema } from '@/lib/tools/schemas/tool-097-hydration-balance-calculator';
import i18nJson from '@/i18n/tool-097-hydration-balance-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-097-hydration-balance-calculator';

const HYDRATION_COLOR: Record<string, string> = {
  'baseline': 'text-lime-400',
  'elevated-fluid-demand': 'text-yellow-400',
  'critical-hyperhydration-required': 'text-orange-400',
};

const SWEAT_OPTIONS = [
  { value: 'light', labelKey: 'sweat_light' as const },
  { value: 'moderate', labelKey: 'sweat_mod' as const },
  { value: 'heavy_profuse', labelKey: 'sweat_heavy' as const },
];

const CLIMATE_OPTIONS = [
  { value: 'temperate', labelKey: 'climate_temp' as const },
  { value: 'hot_humid', labelKey: 'climate_hot' as const },
];

interface DraftInputs {
  body_weight_kg: number;
  training_duration_minutes_daily: number;
  sweat_rate_intensity: 'light' | 'moderate' | 'heavy_profuse';
  climate_temperature: 'temperate' | 'hot_humid';
  caffeine_or_diuretic_intake_mg: number;
}

export default function Tool097HydrationBalanceCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    body_weight_kg: 80,
    training_duration_minutes_daily: 60,
    sweat_rate_intensity: 'moderate',
    climate_temperature: 'temperate',
    caffeine_or_diuretic_intake_mg: 200,
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

  const parsedInput = useMemo(() => HydrationBalanceCalculatorInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<HydrationBalanceCalculatorResult | null>(() => (parsedInput.success ? calculateHydrationBalance(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildHydrationBalanceCalculatorOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildHydrationBalanceCalculatorOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.body_weight}
          <input type="number" min={30} max={250} step={1} value={inputs.body_weight_kg} onChange={(e) => setInputs((p) => ({ ...p, body_weight_kg: Number(e.target.value || 70) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.training_duration}
          <input type="number" min={0} max={360} step={15} value={inputs.training_duration_minutes_daily} onChange={(e) => setInputs((p) => ({ ...p, training_duration_minutes_daily: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.caffeine_diuretic}
          <input type="number" min={0} max={2000} step={50} value={inputs.caffeine_or_diuretic_intake_mg} onChange={(e) => setInputs((p) => ({ ...p, caffeine_or_diuretic_intake_mg: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.sweat_rate}
          <select value={inputs.sweat_rate_intensity} onChange={(e) => setInputs((p) => ({ ...p, sweat_rate_intensity: e.target.value as DraftInputs['sweat_rate_intensity'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {SWEAT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">{t.climate}
          <select value={inputs.climate_temperature} onChange={(e) => setInputs((p) => ({ ...p, climate_temperature: e.target.value as DraftInputs['climate_temperature'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {CLIMATE_OPTIONS.map((c) => (<option key={c.value} value={c.value}>{t[c.labelKey]}</option>))}
          </select>
        </label>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.daily_fluid}</span>
              <span className="text-3xl font-black font-mono text-white">{result.recommended_daily_fluid_liters}</span>
              <span className="text-[10px] text-zinc-400 block">L / day</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.sweat_loss}</span>
              <span className="text-3xl font-black font-mono text-white">{result.sweat_loss_estimate_liters}</span>
              <span className="text-[10px] text-zinc-400 block">L</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.hydration_tier}</span>
              <span className={`text-xs font-bold font-mono ${HYDRATION_COLOR[result.hydration_status_tier] ?? 'text-white'}`}>{result.hydration_status_tier}</span>
            </div>
          </div>
          {result.hydration_guidelines.length > 0 && (
            <div className="rounded-lg border border-lime-500/20 bg-lime-500/5 p-3 mb-3">
              <span className="text-[10px] font-bold text-lime-400 block mb-1">{t.guidelines}</span>
              <ul className="space-y-0.5 text-xs text-lime-300">{result.hydration_guidelines.map((g, i) => (<li key={i}>• {g}</li>))}</ul>
            </div>
          )}
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">AI context (structured values — no external model call)</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <p className="text-[10px] text-zinc-500 mt-3">{t.disclaimer}</p>
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
