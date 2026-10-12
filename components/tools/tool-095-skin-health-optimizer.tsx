'use client';
/** Tool #095 — Skin Health Optimizer (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { optimizeSkinHealth, type SkinHealthOptimizerResult } from '@/lib/tools/engines/tool-095-skin-health-optimizer';
import { buildSkinHealthOptimizerOutput } from '@/lib/tools/adapters/tool-095-skin-health-optimizer';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { SkinHealthOptimizerInputSchema } from '@/lib/tools/schemas/tool-095-skin-health-optimizer';
import i18nJson from '@/i18n/tool-095-skin-health-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-095-skin-health-optimizer';

const RISK_COLOR: Record<string, string> = {
  'calm-healthy': 'text-lime-400',
  'moderate-breakout-risk': 'text-yellow-400',
  'severe-cystic-inflammatory-flare': 'text-red-400',
};

const SEBUM_LEVELS = [
  { value: 'normal_balanced', labelKey: 'sebum_normal' as const },
  { value: 'moderately_oily', labelKey: 'sebum_mod' as const },
  { value: 'excessive_hyperseborrhea', labelKey: 'sebum_excess' as const },
];

const ACNE_DISTRIBUTIONS = [
  { value: 'none_or_mild_comedones', labelKey: 'acne_none' as const },
  { value: 'papules_and_pustules_face_or_back', labelKey: 'acne_pustules' as const },
  { value: 'deep_cystic_nodular_lesions', labelKey: 'acne_cystic' as const },
];

const SWEAT_HYGIENE_OPTIONS = [
  { value: 'immediate_shower', labelKey: 'hygiene_immediate' as const },
  { value: 'delayed_over_1hr', labelKey: 'hygiene_delayed' as const },
];

interface DraftInputs {
  sebum_production_level: 'normal_balanced' | 'moderately_oily' | 'excessive_hyperseborrhea';
  acne_lesion_distribution: 'none_or_mild_comedones' | 'papules_and_pustules_face_or_back' | 'deep_cystic_nodular_lesions';
  barrier_dryness_or_flaking: boolean;
  sweat_hygiene_post_workout: 'immediate_shower' | 'delayed_over_1hr';
  using_topical_dht_blockers_or_salicylic: boolean;
}

export default function Tool095SkinHealthOptimizer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    sebum_production_level: 'normal_balanced',
    acne_lesion_distribution: 'none_or_mild_comedones',
    barrier_dryness_or_flaking: false,
    sweat_hygiene_post_workout: 'immediate_shower',
    using_topical_dht_blockers_or_salicylic: false,
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

  const parsedInput = useMemo(() => SkinHealthOptimizerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<SkinHealthOptimizerResult | null>(() => (parsedInput.success ? optimizeSkinHealth(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildSkinHealthOptimizerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildSkinHealthOptimizerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.sebum_level}
          <select value={inputs.sebum_production_level} onChange={(e) => setInputs((p) => ({ ...p, sebum_production_level: e.target.value as DraftInputs['sebum_production_level'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {SEBUM_LEVELS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.acne_distribution}
          <select value={inputs.acne_lesion_distribution} onChange={(e) => setInputs((p) => ({ ...p, acne_lesion_distribution: e.target.value as DraftInputs['acne_lesion_distribution'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {ACNE_DISTRIBUTIONS.map((a) => (<option key={a.value} value={a.value}>{t[a.labelKey]}</option>))}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.sweat_hygiene}
          <select value={inputs.sweat_hygiene_post_workout} onChange={(e) => setInputs((p) => ({ ...p, sweat_hygiene_post_workout: e.target.value as DraftInputs['sweat_hygiene_post_workout'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {SWEAT_HYGIENE_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{t[s.labelKey]}</option>))}
          </select>
        </label>
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <input type="checkbox" checked={inputs.barrier_dryness_or_flaking} onChange={(e) => setInputs((p) => ({ ...p, barrier_dryness_or_flaking: e.target.checked }))} className="rounded" />
            {t.barrier_dry}
          </label>
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <input type="checkbox" checked={inputs.using_topical_dht_blockers_or_salicylic} onChange={(e) => setInputs((p) => ({ ...p, using_topical_dht_blockers_or_salicylic: e.target.checked }))} className="rounded" />
            {t.topicals}
          </label>
        </div>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.clarity_score}</span>
              <span className="text-3xl font-black font-mono text-white">{result.skin_clarity_score}</span>
              <span className="text-[10px] text-zinc-400 block">/100</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.risk_tier}</span>
              <span className={`text-sm font-black font-mono uppercase ${RISK_COLOR[result.dermatological_risk_tier] ?? 'text-white'}`}>{result.dermatological_risk_tier}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.priority}</span>
              <span className="text-xs font-bold font-mono text-lime-400">{result.skincare_protocol_priority}</span>
            </div>
          </div>
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 mb-3">
              <span className="text-[10px] font-bold text-orange-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-orange-300">{result.warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
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
