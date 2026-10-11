'use client';
/** Tool #079 — Fat Metabolism Calculator (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateFatMetabolism, type FatMetabolismResult } from '@/lib/tools/engines/tool-079-fat-metabolism-calculator';
import { buildFatMetabolismOutput } from '@/lib/tools/adapters/tool-079-fat-metabolism-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { FatMetabolismInputSchema } from '@/lib/tools/schemas/tool-079-fat-metabolism-calculator';
import i18nJson from '@/i18n/tool-079-fat-metabolism-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-079-fat-metabolism-calculator';
interface DraftInputs {
  body_weight_kg: number;
  body_fat_pct: string;
  vo2max_ml_kg_min: string;
  heart_rate_bpm: number;
  resting_heart_rate_bpm: number;
  fasted_state: boolean;
}

const ZONE_COLOR: Record<string, string> = {
  'predominantly-fat': 'text-lime-400',
  'balanced-crossover': 'text-amber-400',
  'predominantly-glycolytic': 'text-orange-400',
};

export default function Tool079FatMetabolismCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    body_weight_kg: 80,
    body_fat_pct: '15',
    vo2max_ml_kg_min: '',
    heart_rate_bpm: 130,
    resting_heart_rate_bpm: 60,
    fasted_state: false,
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

  const parsedInput = useMemo(() => {
    const bfVal = inputs.body_fat_pct !== '' ? parseFloat(inputs.body_fat_pct) : undefined;
    const vo2Val = inputs.vo2max_ml_kg_min !== '' ? parseFloat(inputs.vo2max_ml_kg_min) : undefined;
    return FatMetabolismInputSchema.safeParse({
      body_weight_kg: inputs.body_weight_kg,
      body_fat_pct: bfVal !== undefined && !isNaN(bfVal) ? bfVal : undefined,
      vo2max_ml_kg_min: vo2Val !== undefined && !isNaN(vo2Val) ? vo2Val : undefined,
      heart_rate_bpm: inputs.heart_rate_bpm,
      resting_heart_rate_bpm: inputs.resting_heart_rate_bpm,
      fasted_state: inputs.fasted_state,
    });
  }, [inputs]);

  const result = useMemo<FatMetabolismResult | null>(() => (parsedInput.success ? calculateFatMetabolism(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildFatMetabolismOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildFatMetabolismOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
          <input type="number" min={40} max={200} step={0.5} value={inputs.body_weight_kg} onChange={(e) => setInputs((p) => ({ ...p, body_weight_kg: Number(e.target.value || 40) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.body_fat_pct}
          <input type="number" min={5} max={50} step={0.5} placeholder="optional" value={inputs.body_fat_pct} onChange={(e) => setInputs((p) => ({ ...p, body_fat_pct: e.target.value }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.vo2max}
          <input type="number" min={20} max={85} step={1} placeholder="optional" value={inputs.vo2max_ml_kg_min} onChange={(e) => setInputs((p) => ({ ...p, vo2max_ml_kg_min: e.target.value }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.heart_rate}
          <input type="number" min={50} max={210} step={1} value={inputs.heart_rate_bpm} onChange={(e) => setInputs((p) => ({ ...p, heart_rate_bpm: Number(e.target.value || 50) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.resting_hr}
          <input type="number" min={40} max={100} step={1} value={inputs.resting_heart_rate_bpm} onChange={(e) => setInputs((p) => ({ ...p, resting_heart_rate_bpm: Number(e.target.value || 40) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 pt-4">
          <input type="checkbox" checked={inputs.fasted_state} onChange={(e) => setInputs((p) => ({ ...p, fasted_state: e.target.checked }))} className="rounded" />
          {t.fasted}
        </label>
      </div>
      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.fat_oxidation}</span><span className="text-2xl font-black font-mono text-lime-400">{result.estimated_fat_oxidation_g_hr}</span><span className="text-[10px] text-zinc-400 block">g/hr</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.carb_oxidation}</span><span className="text-2xl font-bold font-mono text-amber-400">{result.estimated_carb_oxidation_g_hr}</span><span className="text-[10px] text-zinc-400 block">g/hr</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.rer}</span><span className="text-2xl font-bold font-mono text-zinc-200">{result.estimated_rer}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.zone_state}</span><span className={`text-xs font-bold font-mono ${ZONE_COLOR[result.zone_state] ?? 'text-white'}`}>{result.zone_state}</span></div>
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
