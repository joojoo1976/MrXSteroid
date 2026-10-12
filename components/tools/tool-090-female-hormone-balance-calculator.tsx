'use client';
/** Tool #090 — Female Hormone Balance Calculator (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateFemaleHormoneBalance, type FemaleHormoneBalanceResult } from '@/lib/tools/engines/tool-090-female-hormone-balance-calculator';
import { buildFemaleHormoneBalanceOutput } from '@/lib/tools/adapters/tool-090-female-hormone-balance-calculator';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { FemaleHormoneBalanceInputSchema } from '@/lib/tools/schemas/tool-090-female-hormone-balance-calculator';
import i18nJson from '@/i18n/tool-090-female-hormone-balance-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-090-female-hormone-balance-calculator';
type PmsSeverity = 'none_mild' | 'moderate' | 'severe';
type CycleReg = 'strictly_regular' | 'mildly_variable' | 'highly_irregular_or_absent';

interface DraftInputs {
  cycle_length_days: number;
  pms_symptom_severity: PmsSeverity;
  androgenic_signs_present: boolean;
  cycle_regularity: CycleReg;
  high_stress_or_rapid_weight_loss: boolean;
}

const TIER_COLOR: Record<string, string> = {
  'harmonious-baseline': 'text-lime-400',
  'estrogen-dominance-leaning': 'text-amber-400',
  'ovulatory-disruption-risk': 'text-red-400',
};

const VIRILIZATION_COLOR: Record<string, string> = {
  low: 'text-lime-400',
  moderate: 'text-amber-400',
  elevated: 'text-red-400',
};

export default function Tool090FemaleHormoneBalanceCalculator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    cycle_length_days: 28,
    pms_symptom_severity: 'none_mild',
    androgenic_signs_present: false,
    cycle_regularity: 'strictly_regular',
    high_stress_or_rapid_weight_loss: false,
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

  const parsedInput = useMemo(() => FemaleHormoneBalanceInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<FemaleHormoneBalanceResult | null>(() => (parsedInput.success ? calculateFemaleHormoneBalance(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildFemaleHormoneBalanceOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildFemaleHormoneBalanceOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
        <label className="text-[10px] font-bold text-zinc-500">{t.cycle_length}
          <input type="number" min={21} max={45} step={1} value={inputs.cycle_length_days} onChange={(e) => setInputs((p) => ({ ...p, cycle_length_days: Number(e.target.value || 0) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.cycle_regularity}
          <select value={inputs.cycle_regularity} onChange={(e) => setInputs((p) => ({ ...p, cycle_regularity: e.target.value as CycleReg }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="strictly_regular">{t.reg_strict}</option>
            <option value="mildly_variable">{t.reg_variable}</option>
            <option value="highly_irregular_or_absent">{t.reg_irregular}</option>
          </select>
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.pms_severity}
          <select value={inputs.pms_symptom_severity} onChange={(e) => setInputs((p) => ({ ...p, pms_symptom_severity: e.target.value as PmsSeverity }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono">
            <option value="none_mild">{t.pms_none}</option>
            <option value="moderate">{t.pms_mod}</option>
            <option value="severe">{t.pms_sev}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 md:col-span-1 pt-2">
          <input type="checkbox" checked={inputs.androgenic_signs_present} onChange={(e) => setInputs((p) => ({ ...p, androgenic_signs_present: e.target.checked }))} className="rounded" />
          {t.androgenic_signs}
        </label>
        <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 md:col-span-2 pt-2">
          <input type="checkbox" checked={inputs.high_stress_or_rapid_weight_loss} onChange={(e) => setInputs((p) => ({ ...p, high_stress_or_rapid_weight_loss: e.target.checked }))} className="rounded" />
          {t.stress_weight}
        </label>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.harmony_score}</span><span className="text-3xl font-black font-mono text-white">{result.hormone_harmony_score}</span><span className="text-[10px] text-zinc-400 block">/100</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.balance_tier}</span><span className={`text-xs font-bold font-mono ${TIER_COLOR[result.estrogen_progesterone_balance_tier] ?? 'text-white'}`}>{result.estrogen_progesterone_balance_tier}</span></div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800"><span className="text-[10px] text-zinc-400 block">{t.virilization_risk}</span><span className={`text-xs font-bold font-mono ${VIRILIZATION_COLOR[result.androgenic_virilization_risk] ?? 'text-white'}`}>{result.androgenic_virilization_risk}</span></div>
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
