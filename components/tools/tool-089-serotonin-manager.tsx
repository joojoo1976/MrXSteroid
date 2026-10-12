'use client';
/** Tool #089 — Serotonin Manager (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { manageSerotonin, type SerotoninManagerResult } from '@/lib/tools/engines/tool-089-serotonin-manager';
import { buildSerotoninManagerOutput } from '@/lib/tools/adapters/tool-089-serotonin-manager';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { SerotoninManagerInputSchema } from '@/lib/tools/schemas/tool-089-serotonin-manager';
import i18nJson from '@/i18n/tool-089-serotonin-manager.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-089-serotonin-manager';
type TrypLevel = 'low' | 'moderate' | 'optimal';
type GutHealth = 'frequent_gi_distress' | 'occasional_bloating' | 'healthy_regular';

interface DraftInputs {
  tryptophan_rich_food_intake: TrypLevel;
  gut_health_status: GutHealth;
  daily_sunlight_lux_exposure_mins: number;
  nighttime_melatonin_transition_calm: boolean;
  chronic_irritability_or_carb_craving: boolean;
}

const TIER_COLOR: Record<string, string> = {
  'optimal-harmonized': 'text-lime-400',
  'moderate-fluctuating': 'text-amber-400',
  'suboptimal-depleted': 'text-red-400',
};

export default function Tool089SerotoninManager() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    tryptophan_rich_food_intake: 'optimal',
    gut_health_status: 'healthy_regular',
    daily_sunlight_lux_exposure_mins: 40,
    nighttime_melatonin_transition_calm: true,
    chronic_irritability_or_carb_craving: false,
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

  const parsedInput = useMemo(() => SerotoninManagerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<SerotoninManagerResult | null>(() => (parsedInput.success ? manageSerotonin(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildSerotoninManagerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildSerotoninManagerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.tryptophan_intake}
          <select value={inputs.tryptophan_rich_food_intake} onChange={(e) => setInputs((p) => ({ ...p, tryptophan_rich_food_intake: e.target.value as TrypLevel }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="low">{t.tryp_low}</option>
            <option value="moderate">{t.tryp_mod}</option>
            <option value="optimal">{t.tryp_opt}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.gut_health}
          <select value={inputs.gut_health_status} onChange={(e) => setInputs((p) => ({ ...p, gut_health_status: e.target.value as GutHealth }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="healthy_regular">{t.gut_regular}</option>
            <option value="occasional_bloating">{t.gut_bloating}</option>
            <option value="frequent_gi_distress">{t.gut_distress}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.sunlight_lux}
          <input type="number" min={0} max={180} step={5} value={inputs.daily_sunlight_lux_exposure_mins} onChange={(e) => setInputs((p) => ({ ...p, daily_sunlight_lux_exposure_mins: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 md:col-span-1 pt-2">
          <input type="checkbox" checked={inputs.nighttime_melatonin_transition_calm} onChange={(e) => setInputs((p) => ({ ...p, nighttime_melatonin_transition_calm: e.target.checked }))} className="rounded" />
          {t.melatonin_transition}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 md:col-span-2 pt-2">
          <input type="checkbox" checked={inputs.chronic_irritability_or_carb_craving} onChange={(e) => setInputs((p) => ({ ...p, chronic_irritability_or_carb_craving: e.target.checked }))} className="rounded" />
          {t.carb_craving}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.serotonin_score}</span><span className="text-3xl font-black font-mono text-white">{result.serotonin_somatic_score}</span><span className="text-[10px] text-zinc-400 block">/100</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.serotonin_tier}</span><span className={`text-xs font-bold font-mono ${TIER_COLOR[result.serotonin_balance_tier] ?? 'text-white'}`}>{result.serotonin_balance_tier}</span></div>
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
