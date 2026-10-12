'use client';
/** Tool #094 — Pregnancy Risk Calculator (dynamic UI, 2gpt MASTER v3.0).
 * CRITICAL SAFETY TOOL — prominent red disclaimers mandatory.
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculatePregnancyRisk, type PregnancyRiskCalculatorResult } from '@/lib/tools/engines/tool-094-pregnancy-risk-calculator';
import { buildPregnancyRiskCalculatorOutput } from '@/lib/tools/adapters/tool-094-pregnancy-risk-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { PregnancyRiskCalculatorInputSchema } from '@/lib/tools/schemas/tool-094-pregnancy-risk-calculator';
import i18nJson from '@/i18n/tool-094-pregnancy-risk-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-094-pregnancy-risk-calculator';

const RISK_COLOR: Record<string, string> = {
  'low-post-washout-risk': 'text-lime-400',
  'moderate-residual-risk': 'text-yellow-400',
  'high-teratogenic-risk': 'text-orange-400',
  'absolute-contraindicated-extreme': 'text-red-500',
};

const COMPOUND_CLASSES = [
  { value: 'anabolic_androgenic_steroid', labelKey: 'class_aas' as const },
  { value: 'sarm', labelKey: 'class_sarm' as const },
  { value: 'aromatase_inhibitor_or_serm', labelKey: 'class_ai_serm' as const },
  { value: 'retinoid_isotretinoin', labelKey: 'class_retinoid' as const },
  { value: 'thermogenic_adrenergic', labelKey: 'class_thermogenic' as const },
];

interface DraftInputs {
  compound_class: 'anabolic_androgenic_steroid' | 'sarm' | 'aromatase_inhibitor_or_serm' | 'retinoid_isotretinoin' | 'thermogenic_adrenergic';
  weeks_since_last_exposure: number;
  currently_pregnant_or_attempting_conception: boolean;
  unprotected_intercourse_during_exposure: boolean;
}

export default function Tool094PregnancyRiskCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    compound_class: 'anabolic_androgenic_steroid',
    weeks_since_last_exposure: 8,
    currently_pregnant_or_attempting_conception: false,
    unprotected_intercourse_during_exposure: false,
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

  const parsedInput = useMemo(() => PregnancyRiskCalculatorInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<PregnancyRiskCalculatorResult | null>(() => (parsedInput.success ? calculatePregnancyRisk(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildPregnancyRiskCalculatorOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildPregnancyRiskCalculatorOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsedInput.data);
      if (submitted.ok && projection.ok) { await clearDraft(TOOL_SLUG); setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard'); }
      else setSaveStatus(isRtl ? 'فشل الحفظ — سجل الدخول أولاً' : 'Save failed — sign in first');
    } finally { setIsSaving(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Critical safety banner */}
      <div className="mb-4 rounded-xl border-2 border-red-600 bg-red-950/60 p-4">
        <p className="text-xs font-black text-red-400 text-center uppercase tracking-widest">⚠ {isRtl ? 'أداة سلامة حرجة — هذه المعلومات ليست بديلاً عن المتخصص الطبي' : 'CRITICAL SAFETY TOOL — Educational only, NOT a substitute for medical advice'}</p>
        <p className="text-[10px] text-red-300/80 text-center mt-1">{t.disclaimer}</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">{t.compound_class}
          <select value={inputs.compound_class} onChange={(e) => setInputs((p) => ({ ...p, compound_class: e.target.value as DraftInputs['compound_class'] }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            {COMPOUND_CLASSES.map((c) => (<option key={c.value} value={c.value}>{t[c.labelKey]}</option>))}
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.weeks_since}
          <input type="number" min={0} max={104} step={1} value={inputs.weeks_since_last_exposure} onChange={(e) => setInputs((p) => ({ ...p, weeks_since_last_exposure: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-red-400">
          <input type="checkbox" checked={inputs.currently_pregnant_or_attempting_conception} onChange={(e) => setInputs((p) => ({ ...p, currently_pregnant_or_attempting_conception: e.target.checked }))} className="rounded" />
          {t.currently_pregnant}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-orange-400">
          <input type="checkbox" checked={inputs.unprotected_intercourse_during_exposure} onChange={(e) => setInputs((p) => ({ ...p, unprotected_intercourse_during_exposure: e.target.checked }))} className="rounded" />
          {t.unprotected_intercourse}
        </label>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-red-900/50 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-red-900/50 md:col-span-2">
              <span className="text-[10px] text-zinc-400 block">{t.terato_risk}</span>
              <span className={`text-sm font-black font-mono uppercase ${RISK_COLOR[result.fetal_teratogenicity_risk] ?? 'text-white'}`}>{result.fetal_teratogenicity_risk}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.washout_status}</span>
              <span className={`text-xs font-bold font-mono ${result.washout_completion_status === 'post-5-halflives-washout-cleared' ? 'text-lime-400' : 'text-red-400'}`}>{result.washout_completion_status}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.wait_weeks}</span>
              <span className="text-3xl font-black font-mono text-white">{result.recommended_safe_conception_wait_weeks}</span>
              <span className="text-[10px] text-zinc-400 block">{isRtl ? 'أسبوع' : 'weeks'}</span>
            </div>
          </div>
          {result.critical_safety_alerts.length > 0 && (
            <div className="rounded-lg border-2 border-red-600 bg-red-950/50 p-3 mb-3">
              <span className="text-[10px] font-black text-red-400 block mb-1">⚠ {t.alerts}</span>
              <ul className="space-y-0.5 text-xs text-red-300">{result.critical_safety_alerts.map((a, i) => (<li key={i}>• {a}</li>))}</ul>
            </div>
          )}
          {aiContext && (<details className="mt-3 text-[11px] text-zinc-500"><summary className="cursor-pointer font-bold">AI context (structured values — no external model call)</summary><pre className="mt-2 overflow-auto rounded-lg bg-zinc-950 p-3 font-mono" dir="ltr">{JSON.stringify({ provenanceLine: aiContext.provenanceLine, findings: aiContext.findings }, null, 2)}</pre></details>)}
          <p className="text-[10px] text-red-400/80 mt-3">{t.disclaimer}</p>
          <div className="flex flex-col md:flex-row justify-between items-center pt-3 mt-3 border-t border-zinc-800 gap-3">
            <span className="text-xs text-zinc-500 font-mono">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving} className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-red-700 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50">{isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ في لوحة القيادة الحيوية' : 'Save to Bio-Dashboard')}</button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition"><span>←</span><span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition"><span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </div>
  );
}
