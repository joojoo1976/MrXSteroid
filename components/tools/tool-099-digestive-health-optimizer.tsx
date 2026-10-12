'use client';
/** Tool #099 — Digestive Health Optimizer (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { optimizeDigestiveHealth, type DigestiveHealthOptimizerResult } from '@/lib/tools/engines/tool-099-digestive-health-optimizer';
import { buildDigestiveHealthOptimizerOutput } from '@/lib/tools/adapters/tool-099-digestive-health-optimizer';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { DigestiveHealthOptimizerInputSchema } from '@/lib/tools/schemas/tool-099-digestive-health-optimizer';
import i18nJson from '@/i18n/tool-099-digestive-health-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-099-digestive-health-optimizer';

const BARRIER_COLOR: Record<string, string> = {
  'healthy-intact': 'text-lime-400',
  'mild-dysbiosis': 'text-yellow-400',
  'compromised-mucosal-strain': 'text-red-400',
};

const REFLUX_OPTIONS = [
  { value: 'rare', labelKey: 'reflux_rare' as const },
  { value: 'occasional', labelKey: 'reflux_occ' as const },
  { value: 'severe_daily', labelKey: 'reflux_severe' as const },
];

interface DraftInputs {
  daily_protein_intake_grams: number;
  bloating_or_reflux_frequency: 'rare' | 'occasional' | 'severe_daily';
  bowel_regularity_bristol_score: number;
  using_oral_17aa_or_nsaids: boolean;
  fermented_food_or_probiotic_intake: boolean;
}

export default function Tool099DigestiveHealthOptimizer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    daily_protein_intake_grams: 180,
    bloating_or_reflux_frequency: 'rare',
    bowel_regularity_bristol_score: 4,
    using_oral_17aa_or_nsaids: false,
    fermented_food_or_probiotic_intake: true,
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

  const parsedInput = useMemo(() => DigestiveHealthOptimizerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<DigestiveHealthOptimizerResult | null>(() => (parsedInput.success ? optimizeDigestiveHealth(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildDigestiveHealthOptimizerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildDigestiveHealthOptimizerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.protein_grams}
          <input type="number" min={30} max={500} step={10} value={inputs.daily_protein_intake_grams} onChange={(e) => setInputs((p) => ({ ...p, daily_protein_intake_grams: Number(e.target.value || 150) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.bristol_score}
          <input type="number" min={1} max={7} step={1} value={inputs.bowel_regularity_bristol_score} onChange={(e) => setInputs((p) => ({ ...p, bowel_regularity_bristol_score: Number(e.target.value || 4) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
          <span className="text-[9px] text-zinc-500 block mt-0.5">{t.bristol_hint}</span>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.bloating_reflux}
          <select value={inputs.bloating_or_reflux_frequency} onChange={(e) => setInputs((p) => ({ ...p, bloating_or_reflux_frequency: e.target.value as DraftInputs['bloating_or_reflux_frequency'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {REFLUX_OPTIONS.map((r) => (<option key={r.value} value={r.value}>{t[r.labelKey]}</option>))}
          </select>
        </label>
        <div className="flex flex-col gap-2 pt-1 md:col-span-3">
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <input type="checkbox" checked={inputs.using_oral_17aa_or_nsaids} onChange={(e) => setInputs((p) => ({ ...p, using_oral_17aa_or_nsaids: e.target.checked }))} className="rounded" />
            {t.meds_nsaids}
          </label>
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <input type="checkbox" checked={inputs.fermented_food_or_probiotic_intake} onChange={(e) => setInputs((p) => ({ ...p, fermented_food_or_probiotic_intake: e.target.checked }))} className="rounded" />
            {t.fermented_probiotic}
          </label>
        </div>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.digestive_score}</span>
              <span className="text-3xl font-black font-mono text-white">{result.digestive_efficiency_score}</span>
              <span className="text-[10px] text-zinc-400 block">/100</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.barrier_tier}</span>
              <span className={`text-xs font-bold font-mono ${BARRIER_COLOR[result.gi_barrier_strain_tier] ?? 'text-white'}`}>{result.gi_barrier_strain_tier}</span>
            </div>
          </div>
          {result.support_priorities.length > 0 && (
            <div className="rounded-lg border border-lime-500/20 bg-lime-500/5 p-3 mb-3">
              <span className="text-[10px] font-bold text-lime-400 block mb-1">{t.support_priorities}</span>
              <ul className="space-y-0.5 text-xs text-lime-300">{result.support_priorities.map((p, i) => (<li key={i}>• {p}</li>))}</ul>
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
