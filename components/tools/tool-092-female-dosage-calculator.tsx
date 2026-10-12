'use client';
/** Tool #092 — Female Dosage Calculator (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateFemaleDosage, type FemaleDosageCalculatorResult } from '@/lib/tools/engines/tool-092-female-dosage-calculator';
import { buildFemaleDosageCalculatorOutput } from '@/lib/tools/adapters/tool-092-female-dosage-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { FemaleDosageCalculatorInputSchema } from '@/lib/tools/schemas/tool-092-female-dosage-calculator';
import i18nJson from '@/i18n/tool-092-female-dosage-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-092-female-dosage-calculator';
type CompoundType = 'oxandrolone' | 'methenolone_acetate' | 'nandrolone_decanoate' | 'testosterone_propionate';
type ExpLevel = 'first_time' | 'intermediate_experience' | 'advanced_risk_aware';

interface DraftInputs {
  compound: CompoundType;
  proposed_weekly_dose_mg: number;
  cycle_experience: ExpLevel;
  monitoring_bloodwork_planned: boolean;
}

const VIRILIZATION_COLOR: Record<string, string> = {
  'conservative-minimal-risk': 'text-lime-400',
  'moderate-risk': 'text-amber-400',
  'high-irreversible-virilization-risk': 'text-red-400',
};

export default function Tool092FemaleDosageCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    compound: 'oxandrolone',
    proposed_weekly_dose_mg: 20,
    cycle_experience: 'first_time',
    monitoring_bloodwork_planned: true,
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

  const parsedInput = useMemo(() => FemaleDosageCalculatorInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<FemaleDosageCalculatorResult | null>(() => (parsedInput.success ? calculateFemaleDosage(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildFemaleDosageCalculatorOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildFemaleDosageCalculatorOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.compound}
          <select value={inputs.compound} onChange={(e) => setInputs((p) => ({ ...p, compound: e.target.value as CompoundType }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="oxandrolone">{t.comp_oxan}</option>
            <option value="methenolone_acetate">{t.comp_prim}</option>
            <option value="nandrolone_decanoate">{t.comp_nand}</option>
            <option value="testosterone_propionate">{t.comp_test}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.weekly_dose}
          <input type="number" min={1} max={250} step={1} value={inputs.proposed_weekly_dose_mg} onChange={(e) => setInputs((p) => ({ ...p, proposed_weekly_dose_mg: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.experience}
          <select value={inputs.cycle_experience} onChange={(e) => setInputs((p) => ({ ...p, cycle_experience: e.target.value as ExpLevel }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="first_time">{t.exp_first}</option>
            <option value="intermediate_experience">{t.exp_inter}</option>
            <option value="advanced_risk_aware">{t.exp_adv}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 md:col-span-3 pt-2">
          <input type="checkbox" checked={inputs.monitoring_bloodwork_planned} onChange={(e) => setInputs((p) => ({ ...p, monitoring_bloodwork_planned: e.target.checked }))} className="rounded" />
          {t.bloodwork}
        </label>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.virilization_tier}</span><span className={`text-xs font-bold font-mono ${VIRILIZATION_COLOR[result.virilization_risk_tier] ?? 'text-white'}`}>{result.virilization_risk_tier}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.ceiling_percent}</span><span className="text-3xl font-black font-mono text-white">{result.dose_relative_to_conservative_ceiling_percent}</span><span className="text-[10px] text-zinc-400 block">%</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.max_duration}</span><span className="text-3xl font-black font-mono text-white">{result.recommended_safe_exposure_duration_weeks}</span><span className="text-[10px] text-zinc-400 block">{t.weeks}</span></div>
          </div>
          {result.safety_warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">{t.warnings}</span>
              <ul className="space-y-0.5 text-xs text-amber-300">{result.safety_warnings.map((w, i) => (<li key={i}>• {w}</li>))}</ul>
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
