'use client';
/** Tool #071 — Antioxidant Manager (dynamic UI, GPT2 spec).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { manageAntioxidants, type AntioxidantResult } from '@/lib/tools/engines/tool-071-antioxidant-manager';
import { buildAntioxidantOutput } from '@/lib/tools/adapters/tool-071-antioxidant-manager';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { AntioxidantInputSchema } from '@/lib/tools/schemas/tool-071-antioxidant-manager';
import i18nJson from '@/i18n/tool-071-antioxidant-manager.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-071-antioxidant-manager';
interface DraftInputs {
  daily_fruit_veg_servings: number;
  takes_coq10: boolean;
  takes_vitamin_c_e: boolean;
  takes_zinc_selenium: boolean;
  high_oxidative_lifestyle: boolean;
}

const TIER_COLOR: Record<string, string> = {
  'depleted-defense': 'text-red-400',
  'adequate-defense': 'text-amber-400',
  'robust-defense': 'text-lime-400',
};

export default function Tool071AntioxidantManager() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    daily_fruit_veg_servings: 6,
    takes_coq10: true,
    takes_vitamin_c_e: true,
    takes_zinc_selenium: true,
    high_oxidative_lifestyle: false,
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

  const parsedInput = useMemo(() => AntioxidantInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<AntioxidantResult | null>(() => (parsedInput.success ? manageAntioxidants(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildAntioxidantOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildAntioxidantOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500 md:col-span-2">{t.daily_fruit_veg}
          <input type="number" min={0} max={15} step={1} value={inputs.daily_fruit_veg_servings} onChange={(e) => setInputs((p) => ({ ...p, daily_fruit_veg_servings: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.takes_coq10} onChange={(e) => setInputs((p) => ({ ...p, takes_coq10: e.target.checked }))} className="rounded" />
          {t.takes_coq10}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.takes_vitamin_c_e} onChange={(e) => setInputs((p) => ({ ...p, takes_vitamin_c_e: e.target.checked }))} className="rounded" />
          {t.takes_vit_c_e}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.takes_zinc_selenium} onChange={(e) => setInputs((p) => ({ ...p, takes_zinc_selenium: e.target.checked }))} className="rounded" />
          {t.takes_zinc_sel}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.high_oxidative_lifestyle} onChange={(e) => setInputs((p) => ({ ...p, high_oxidative_lifestyle: e.target.checked }))} className="rounded" />
          {t.high_oxidative}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.defense_score}</span><span className="text-3xl font-black font-mono text-white">{result.antioxidant_defense_score}</span><span className="text-[10px] text-zinc-400 block">/100</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.defense_tier}</span><span className={`text-base font-bold font-mono ${TIER_COLOR[result.defense_tier] ?? 'text-white'}`}>{result.defense_tier}</span></div>
          </div>
          {result.key_recommendations.length > 0 && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 mb-3">
              <span className="text-[10px] font-bold text-zinc-400 block mb-1">{t.recommendations}</span>
              <ul className="space-y-0.5 text-xs text-zinc-300">{result.key_recommendations.map((r, i) => (<li key={i}>• {r}</li>))}</ul>
            </div>
          )}
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
