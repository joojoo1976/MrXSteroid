'use client';
/** Tool #104 - Thyroid Function & Metabolic Rate Dynamics (dynamic UI).
 * Educational estimate only - never a diagnosis of thyroid dysfunction. */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { calculateThyroidDynamics, type ThyroidResult } from '@/lib/tools/engines/tool-104-thyroid-metabolic-rate-dynamics';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { ThyroidInputSchema } from '@/lib/tools/schemas/tool-104-thyroid-metabolic-rate-dynamics';
import i18nJson from '@/i18n/tool-104-thyroid-metabolic-rate-dynamics.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-104-thyroid-metabolic-rate-dynamics';

interface DraftInputs {
  tsh_miu_l: number;
  free_t4_ng_dl: number;
  free_t3_pg_ml: number;
  age_years: number;
  sex: 'male' | 'female';
  weight_kg: number;
  height_cm: number;
}

const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

export default function Tool104ThyroidDynamics() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({
    tsh_miu_l: 2.0,
    free_t4_ng_dl: 1.3,
    free_t3_pg_ml: 3.0,
    age_years: 30,
    sex: 'male',
    weight_kg: 80,
    height_cm: 178,
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) setInputs((p) => ({ ...p, ...draft.inputs }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem, savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale, unitSystem]);

  const isImperial = unitSystem === 'imperial';
  const displayWeight = (kg: number) => isImperial ? Number((kg * 2.2046226218).toFixed(1)) : kg;
  const canonicalWeight = (value: number) => isImperial ? value / 2.2046226218 : value;
  const displayHeight = (cm: number) => isImperial ? Number((cm / 2.54).toFixed(1)) : cm;
  const canonicalHeight = (value: number) => isImperial ? value * 2.54 : value;

  const parsed = useMemo(() => ThyroidInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<ThyroidResult | null>(() => (parsed.success ? calculateThyroidDynamics(parsed.data) : null), [parsed]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.tsh}
          <input data-r6-slider="true" type="number" min={0.01} max={100} step={0.01} value={inputs.tsh_miu_l} onChange={(e) => setInputs((p) => ({ ...p, tsh_miu_l: Number(e.target.value || 2) }))} className={INP} />
        </label>
        <label className={LBL}>{t.free_t4}
          <input data-r6-slider="true" type="number" min={0.1} max={10} step={0.1} value={inputs.free_t4_ng_dl} onChange={(e) => setInputs((p) => ({ ...p, free_t4_ng_dl: Number(e.target.value || 1.3) }))} className={INP} />
        </label>
        <label className={LBL}>{t.free_t3}
          <input data-r6-slider="true" type="number" min={0.5} max={20} step={0.1} value={inputs.free_t3_pg_ml} onChange={(e) => setInputs((p) => ({ ...p, free_t3_pg_ml: Number(e.target.value || 3) }))} className={INP} />
        </label>
        <label className={LBL}>{t.age}
          <input data-r6-slider="true" type="number" min={18} max={120} value={inputs.age_years} onChange={(e) => setInputs((p) => ({ ...p, age_years: Number(e.target.value || 30) }))} className={INP} />
        </label>
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => setInputs((p) => ({ ...p, sex: e.target.value as DraftInputs['sex'] }))} className={SEL}>
            <option value="male">{t.sex_male}</option>
            <option value="female">{t.sex_female}</option>
          </select>
        </label>
        <label className={LBL}>{t.weight_kg.replace(/\s*\([^)]*\)\s*$/, '')} ({isImperial ? 'lb' : 'kg'})
          <input data-r6-slider="true" type="number" min={isImperial ? 66.1 : 30} max={isImperial ? 551.2 : 250} step={isImperial ? 0.1 : 1} value={displayWeight(inputs.weight_kg)} onChange={(e) => setInputs((p) => ({ ...p, weight_kg: canonicalWeight(Number(e.target.value || (isImperial ? 176.4 : 80))) }))} className={INP} />
        </label>
        <label className={LBL}>{t.height_cm.replace(/\s*\([^)]*\)\s*$/, '')} ({isImperial ? 'in' : 'cm'})
          <input data-r6-slider="true" type="number" min={isImperial ? 47.2 : 120} max={isImperial ? 90.6 : 230} step={isImperial ? 0.1 : 1} value={displayHeight(inputs.height_cm)} onChange={(e) => setInputs((p) => ({ ...p, height_cm: canonicalHeight(Number(e.target.value || (isImperial ? 70.1 : 178))) }))} className={INP} />
        </label>
      </div>


      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label={t.bmr_kcal} value={`${result.bmr_kcal} kcal/d`} />
              <Metric label={t.adjusted_bmr} value={`${result.adjusted_bmr_kcal} kcal/d`} />
              <Metric label={t.multiplier} value={`x${result.metabolic_multiplier}`} />
              <Metric label={t.thyroid_status} value={result.thyroid_state} />
            </div>
            {result.interpretation_flags.length > 0 && (
              <ul className="mt-3 list-disc list-inside text-[11px] text-amber-300 space-y-1">
                {result.interpretation_flags.map((f) => (<li key={f} className="font-mono">{f}</li>))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-4 text-xs text-amber-200">
            <p className="font-black mb-1">&#9888; {t.scope_title}</p>
            <p>{t.scope_text}</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-zinc-500">{t.disclaimer}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
      <div className="text-[9px] text-zinc-500 font-bold uppercase">{label}</div>
      <div className="text-sm text-lime-400 font-mono font-black">{value}</div>
    </div>
  );
}
