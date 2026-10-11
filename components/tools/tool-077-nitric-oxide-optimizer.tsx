'use client';
/** Tool #077 — Nitric Oxide Optimizer (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { optimizeNitricOxide, type NitricOxideResult } from '@/lib/tools/engines/tool-077-nitric-oxide-optimizer';
import { buildNitricOxideOutput } from '@/lib/tools/adapters/tool-077-nitric-oxide-optimizer';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { NitricOxideInputSchema } from '@/lib/tools/schemas/tool-077-nitric-oxide-optimizer';
import i18nJson from '@/i18n/tool-077-nitric-oxide-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-077-nitric-oxide-optimizer';
type NitrateFreq = 'rarely' | 'occasional' | 'daily' | 'high_daily';
interface DraftInputs {
  dietary_nitrate_frequency: NitrateFreq;
  aerobic_exercise_days_per_week: number;
  uses_antiseptic_mouthwash: boolean;
  citrulline_supplementation: boolean;
  high_sunlight_or_uva_exposure: boolean;
}

const BAND_COLOR: Record<string, string> = {
  'optimized-no-signaling': 'text-lime-400',
  'favorable-no-production': 'text-emerald-400',
  'suboptimal-no-support': 'text-amber-400',
  'depleted-no-pathway': 'text-red-400',
};

export default function Tool077NitricOxideOptimizer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    dietary_nitrate_frequency: 'daily',
    aerobic_exercise_days_per_week: 3,
    uses_antiseptic_mouthwash: false,
    citrulline_supplementation: false,
    high_sunlight_or_uva_exposure: false,
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

  const parsedInput = useMemo(() => NitricOxideInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<NitricOxideResult | null>(() => (parsedInput.success ? optimizeNitricOxide(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildNitricOxideOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildNitricOxideOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.dietary_nitrate}
          <select value={inputs.dietary_nitrate_frequency} onChange={(e) => setInputs((p) => ({ ...p, dietary_nitrate_frequency: e.target.value as NitrateFreq }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="rarely">{t.nitrate_rarely}</option>
            <option value="occasional">{t.nitrate_occasional}</option>
            <option value="daily">{t.nitrate_daily}</option>
            <option value="high_daily">{t.nitrate_high_daily}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.aerobic_days}
          <input type="number" min={0} max={7} step={1} value={inputs.aerobic_exercise_days_per_week} onChange={(e) => setInputs((p) => ({ ...p, aerobic_exercise_days_per_week: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.uses_antiseptic_mouthwash} onChange={(e) => setInputs((p) => ({ ...p, uses_antiseptic_mouthwash: e.target.checked }))} className="rounded" />
          {t.mouthwash}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.citrulline_supplementation} onChange={(e) => setInputs((p) => ({ ...p, citrulline_supplementation: e.target.checked }))} className="rounded" />
          {t.citrulline}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
          <input type="checkbox" checked={inputs.high_sunlight_or_uva_exposure} onChange={(e) => setInputs((p) => ({ ...p, high_sunlight_or_uva_exposure: e.target.checked }))} className="rounded" />
          {t.sunlight}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.no_score}</span><span className="text-3xl font-black font-mono text-white">{result.no_optimization_score}</span><span className="text-[10px] text-zinc-400 block">/100</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.no_band}</span><span className={`text-xs font-bold font-mono ${BAND_COLOR[result.no_status_band] ?? 'text-white'}`}>{result.no_status_band}</span></div>
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
