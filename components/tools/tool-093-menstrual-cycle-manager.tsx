'use client';
/** Tool #093 — Menstrual Cycle Manager (dynamic UI, 2gpt MASTER v3.0).
 * useMemo instant recompute, Zod validation, auto-draft, Bio-Dashboard save, AR/EN RTL/LTR. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { manageMenstrualCycle, type MenstrualCycleManagerResult } from '@/lib/tools/engines/tool-093-menstrual-cycle-manager';
import { buildMenstrualCycleManagerOutput } from '@/lib/tools/adapters/tool-093-menstrual-cycle-manager';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { MenstrualCycleManagerInputSchema } from '@/lib/tools/schemas/tool-093-menstrual-cycle-manager';
import i18nJson from '@/i18n/tool-093-menstrual-cycle-manager.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-093-menstrual-cycle-manager';

const SUBSTRATE_COLOR: Record<string, string> = {
  'carbohydrate_glycogen_dominant': 'text-amber-400',
  'balanced': 'text-lime-400',
  'lipid_oxidation_dominant': 'text-blue-400',
};

const THERMO_COLOR: Record<string, string> = {
  'baseline_cool': 'text-lime-400',
  'elevated_core_temp_higher_sweat_sodium': 'text-orange-400',
};

interface DraftInputs {
  cycle_length_days: number;
  current_cycle_day: number;
  oral_contraceptive_active: boolean;
  high_intensity_training_focus: boolean;
}

export default function Tool093MenstrualCycleManager() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [inputs, setInputs] = useState<DraftInputs>({
    cycle_length_days: 28,
    current_cycle_day: 14,
    oral_contraceptive_active: false,
    high_intensity_training_focus: false,
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

  const parsedInput = useMemo(() => MenstrualCycleManagerInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<MenstrualCycleManagerResult | null>(() => (parsedInput.success ? manageMenstrualCycle(parsedInput.data) : null), [parsedInput]);

  const aiContext = useMemo(() => {
    if (!result || !parsedInput.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildMenstrualCycleManagerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'draft', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
      const output = buildMenstrualCycleManagerOutput(parsedInput.data, { locale, unitSystem: 'metric', snapshotType: 'dashboard_projection', calculatedAt: now, recordedAt: now, timezone: 'UTC' });
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
          <input type="number" min={21} max={45} step={1} value={inputs.cycle_length_days} onChange={(e) => setInputs((p) => ({ ...p, cycle_length_days: Number(e.target.value || 28) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">{t.current_day}
          <input type="number" min={1} max={45} step={1} value={inputs.current_cycle_day} onChange={(e) => setInputs((p) => ({ ...p, current_cycle_day: Number(e.target.value || 1) }))} className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono" />
        </label>
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <input type="checkbox" checked={inputs.oral_contraceptive_active} onChange={(e) => setInputs((p) => ({ ...p, oral_contraceptive_active: e.target.checked }))} className="rounded" />
            {t.birth_control}
          </label>
          <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <input type="checkbox" checked={inputs.high_intensity_training_focus} onChange={(e) => setInputs((p) => ({ ...p, high_intensity_training_focus: e.target.checked }))} className="rounded" />
            {t.high_intensity}
          </label>
        </div>
      </div>

      {validationError && (<p className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>)}

      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 md:col-span-2">
              <span className="text-[10px] text-zinc-400 block">{t.current_phase}</span>
              <span className="text-sm font-bold text-lime-400 block mt-1">{isRtl ? result.phase_name_ar : result.phase_name_en}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.power_score}</span>
              <span className="text-3xl font-black font-mono text-white">{result.strength_power_potential_score}</span>
              <span className="text-[10px] text-zinc-400 block">/100</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.substrate_pref}</span>
              <span className={`text-xs font-bold font-mono ${SUBSTRATE_COLOR[result.metabolic_substrate_preference] ?? 'text-white'}`}>{isRtl ? (result.metabolic_substrate_preference === 'carbohydrate_glycogen_dominant' ? t.carb_fuel : result.metabolic_substrate_preference === 'lipid_oxidation_dominant' ? t.lipid_fuel : t.balanced_fuel) : (result.metabolic_substrate_preference === 'carbohydrate_glycogen_dominant' ? t.carb_fuel : result.metabolic_substrate_preference === 'lipid_oxidation_dominant' ? t.lipid_fuel : t.balanced_fuel)}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 md:col-span-2">
              <span className="text-[10px] text-zinc-400 block">{t.thermo_tier}</span>
              <span className={`text-xs font-bold font-mono ${THERMO_COLOR[result.thermoregulatory_strain_tier] ?? 'text-white'}`}>{isRtl ? (result.thermoregulatory_strain_tier === 'baseline_cool' ? t.thermo_cool : t.thermo_warm) : (result.thermoregulatory_strain_tier === 'baseline_cool' ? t.thermo_cool : t.thermo_warm)}</span>
            </div>
          </div>
          {result.recommendations.length > 0 && (
            <div className="rounded-lg border border-lime-500/20 bg-lime-500/5 p-3 mb-3">
              <span className="text-[10px] font-bold text-lime-400 block mb-1">{t.recommendations}</span>
              <ul className="space-y-0.5 text-xs text-lime-300">{result.recommendations.map((r, i) => (<li key={i}>• {r}</li>))}</ul>
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
