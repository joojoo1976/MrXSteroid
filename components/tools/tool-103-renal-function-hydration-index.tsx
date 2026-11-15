'use client';
/** Tool #103 - Renal Function & Hydration Index (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { calculateRenalFunction, type RenalFunctionResult } from '@/lib/tools/engines/tool-103-renal-function-hydration-index';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { RenalFunctionInputSchema } from '@/lib/tools/schemas/tool-103-renal-function-hydration-index';
import i18nJson from '@/i18n/tool-103-renal-function-hydration-index.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-103-renal-function-hydration-index';

interface DraftInputs {
  serum_creatinine_mg_dl: number;
  age_years: number;
  sex: 'male' | 'female';
  body_weight_kg: number;
  fluid_intake_liters: number;
  climate: 'temperate' | 'hot_humid';
  training_sweat_liters: number;
}

const CLIMATE_OPTIONS = [
  { value: 'temperate', labelKey: 'climate_temperate' as const },
  { value: 'hot_humid', labelKey: 'climate_hot' as const },
];

const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

export default function Tool103RenalFunctionHydration() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({
    serum_creatinine_mg_dl: 1.0,
    age_years: 30,
    sex: 'male',
    body_weight_kg: 80,
    fluid_intake_liters: 2.5,
    climate: 'temperate',
    training_sweat_liters: 0.5,
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

  const massFactor = unitSystem === 'metric' ? 1 : 2.20462;
  const fluidFactor = unitSystem === 'metric' ? 1 : 33.8140227;
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lb';
  const fluidUnit = unitSystem === 'metric' ? 'L' : 'fl oz';
  const displayWeight = (weightKg: number) => unitSystem === 'metric' ? weightKg : Number((weightKg * massFactor).toFixed(1));
  const canonicalWeight = (displayed: number) => unitSystem === 'metric' ? displayed : displayed / massFactor;
  const displayFluid = (liters: number) => unitSystem === 'metric' ? liters : Number((liters * fluidFactor).toFixed(1));
  const canonicalFluid = (displayed: number) => unitSystem === 'metric' ? displayed : displayed / fluidFactor;

  const parsed = useMemo(() => RenalFunctionInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<RenalFunctionResult | null>(() => (parsed.success ? calculateRenalFunction(parsed.data) : null), [parsed]);

  const statusLabel = (s: string): string =>
    s === 'well-hydrated' ? t.hydration_normal : s === 'mild-dehydration-risk' ? t.hydration_mild_dehydration : t.hydration_severe_dehydration;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.creatinine}
          <input data-r6-slider="true" type="number" min={0.1} max={20} step={0.1} value={inputs.serum_creatinine_mg_dl} onChange={(e) => setInputs((p) => ({ ...p, serum_creatinine_mg_dl: Number(e.target.value || 1) }))} className={INP} />
        </label>
        <label className={LBL}>{t.age}
          <input data-r6-slider="true" type="number" min={18} max={100} value={inputs.age_years} onChange={(e) => setInputs((p) => ({ ...p, age_years: Number(e.target.value || 30) }))} className={INP} />
        </label>
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => setInputs((p) => ({ ...p, sex: e.target.value as DraftInputs['sex'] }))} className={SEL}>
            <option value="male">{t.sex_male}</option>
            <option value="female">{t.sex_female}</option>
          </select>
        </label>
        <label className={LBL}>{t.body_weight.replace(/\s*\([^)]*\)\s*$/, '')} ({weightUnit})
          <input data-r6-slider="true" type="number" min={unitSystem === 'metric' ? 30 : 66.1} max={unitSystem === 'metric' ? 250 : 551.2} step={unitSystem === 'metric' ? 1 : 0.1} value={displayWeight(inputs.body_weight_kg)} onChange={(e) => setInputs((p) => ({ ...p, body_weight_kg: canonicalWeight(Number(e.target.value || (unitSystem === 'metric' ? 80 : 176.4))) }))} className={INP} />
        </label>
        <label className={LBL}>{t.fluid_intake.replace(/\s*\([^)]*\)\s*$/, '')} ({fluidUnit})
          <input data-r6-slider="true" type="number" min={0} max={unitSystem === 'metric' ? 15 : 507.2} step={unitSystem === 'metric' ? 0.1 : 0.1} value={displayFluid(inputs.fluid_intake_liters)} onChange={(e) => setInputs((p) => ({ ...p, fluid_intake_liters: canonicalFluid(Number(e.target.value || (unitSystem === 'metric' ? 2.5 : 84.5))) }))} className={INP} />
        </label>
        <label className={LBL}>{t.training_sweat.replace(/\s*\([^)]*\)\s*$/, '')} ({fluidUnit})
          <input data-r6-slider="true" type="number" min={0} max={unitSystem === 'metric' ? 10 : 338.1} step={unitSystem === 'metric' ? 0.1 : 0.1} value={displayFluid(inputs.training_sweat_liters)} onChange={(e) => setInputs((p) => ({ ...p, training_sweat_liters: canonicalFluid(Number(e.target.value || (unitSystem === 'metric' ? 0.5 : 16.9))) }))} className={INP} />
        </label>
        <label className={`${LBL} md:col-span-3`}>{t.climate}
          <select value={inputs.climate} onChange={(e) => setInputs((p) => ({ ...p, climate: e.target.value as DraftInputs['climate'] }))} className={SEL}>
            {CLIMATE_OPTIONS.map((c) => (<option key={c.value} value={c.value}>{t[c.labelKey]}</option>))}
          </select>
        </label>
      </div>


      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label={t.egfr_ckd_epi} value={result.egfr_valid ? `${result.egfr_ml_min_1_73} mL/min/1.73m2` : t.egfr_invalid} />
              <Metric label={t.ckd_stage} value={result.egfr_category} />
              <Metric label={t.hydration_index} value={`${result.hydration_index}/100`} />
              <Metric label={t.hydration} value={statusLabel(result.hydration_status)} />
              <Metric label={t.target_fluid} value={`${displayFluid(result.target_fluid_liters)} ${fluidUnit}`} />
            </div>
            {result.monitoring_flags.length > 0 && (
              <ul className="mt-3 list-disc list-inside text-[11px] text-amber-300 space-y-1">
                {result.monitoring_flags.map((f) => (<li key={f} className="font-mono">{f}</li>))}
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
