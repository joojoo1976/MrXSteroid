'use client';
/** Tool #117 - Intra-Workout Nutrient Volumizer & Transport Engine (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type IntraWorkoutInput, type IntraWorkoutResult } from '@/lib/tools/engines/tool-117-intra-workout-nutrient-volumizer';
import { buildIntraWorkoutOutput } from '@/lib/tools/adapters/tool-117-intra-workout-nutrient-volumizer';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { IntraWorkoutInputSchema } from '@/lib/tools/schemas/tool-117-intra-workout-nutrient-volumizer';
import i18nJson from '@/i18n/tool-117-intra-workout-nutrient-volumizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-117-intra-workout-nutrient-volumizer';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const TRAINING_TYPES = ['resistance', 'endurance', 'mixed', 'hiit', 'skill'] as const;
const TYPE_LABEL: Record<string, string> = {
  resistance: 'type_resistance', endurance: 'type_endurance', mixed: 'type_mixed', hiit: 'type_hiit', skill: 'type_skill',
};
const INTENSITIES = ['low', 'moderate', 'high', 'very_high'] as const;
const INT_LABEL: Record<string, string> = { low: 'int_low', moderate: 'int_moderate', high: 'int_high', very_high: 'int_very_high' };
const CLIMATES = ['cool', 'moderate', 'hot', 'humid'] as const;
const CLIMATE_LABEL: Record<string, string> = { cool: 'climate_cool', moderate: 'climate_moderate', hot: 'climate_hot', humid: 'climate_humid' };
const GOALS = ['performance', 'hydration', 'recovery', 'muscle_protein_synthesis'] as const;
const GOAL_LABEL: Record<string, string> = { performance: 'goal_perf', hydration: 'goal_hydro', recovery: 'goal_recovery', muscle_protein_synthesis: 'goal_mps' };

interface DraftInputs {
  training_type: IntraWorkoutInput['training_type'];
  duration_min: number;
  intensity: IntraWorkoutInput['intensity'];
  climate: IntraWorkoutInput['climate'];
  sweat_rate_ml_per_h: number;
  goal: IntraWorkoutInput['goal'];
  current_carbs: number;
  current_sodium: number;
  current_fluid: number;
  current_eaa: number;
}

export default function Tool117IntraWorkoutVolumizer() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    training_type: 'resistance',
    duration_min: 90,
    intensity: 'high',
    climate: 'moderate',
    sweat_rate_ml_per_h: 1000,
    goal: 'performance',
    current_carbs: 30,
    current_sodium: 300,
    current_fluid: 500,
    current_eaa: 5,
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

  const updateInput = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const parsed = useMemo(() => IntraWorkoutInputSchema.safeParse({
    training_type: inputs.training_type,
    duration_min: inputs.duration_min,
    intensity: inputs.intensity,
    climate: inputs.climate,
    sweat_rate_ml_per_h: inputs.sweat_rate_ml_per_h || undefined,
    goal: inputs.goal,
    current_intake: {
      carbs_g_per_h: inputs.current_carbs,
      sodium_mg_per_h: inputs.current_sodium,
      fluid_ml_per_h: inputs.current_fluid,
      eaa_g_per_h: inputs.current_eaa,
    },
  }), [inputs]);

  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<IntraWorkoutInput, IntraWorkoutResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.training_type}
          <select value={inputs.training_type} onChange={(e) => updateInput('training_type', e.target.value)} className={SEL}>
            {TRAINING_TYPES.map((ty) => <option key={ty} value={ty}>{t[TYPE_LABEL[ty]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.duration}
          <input type="number" min={15} max={480} step={5} value={inputs.duration_min} onChange={(e) => updateInput('duration_min', Number(e.target.value || 90))} className={INP} />
        </label>
        <label className={LBL}>{t.intensity}
          <select value={inputs.intensity} onChange={(e) => updateInput('intensity', e.target.value)} className={SEL}>
            {INTENSITIES.map((i) => <option key={i} value={i}>{t[INT_LABEL[i]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.climate}
          <select value={inputs.climate} onChange={(e) => updateInput('climate', e.target.value)} className={SEL}>
            {CLIMATES.map((c) => <option key={c} value={c}>{t[CLIMATE_LABEL[c]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{locale === 'ar' ? 'معدل التعرق' : 'Sweat Rate'} ({unitSystem === 'metric' ? (locale === 'ar' ? 'مل/ساعة' : 'ml/h') : 'fl oz/h'}{locale === 'ar' ? '، اختياري' : ', optional'})
          <input type="number" min={unitSystem === 'metric' ? 100 : 3} max={unitSystem === 'metric' ? 3000 : 101} step={unitSystem === 'metric' ? 50 : 1} value={unitSystem === 'metric' ? inputs.sweat_rate_ml_per_h : Number((inputs.sweat_rate_ml_per_h / 29.5735).toFixed(1))} onChange={(e) => updateInput('sweat_rate_ml_per_h', Math.round(Number(e.target.value || (unitSystem === 'metric' ? 1000 : 33.8)) * (unitSystem === 'metric' ? 1 : 29.5735)))} className={INP} />
        </label>
        <label className={LBL}>{t.goal}
          <select value={inputs.goal} onChange={(e) => updateInput('goal', e.target.value)} className={SEL}>
            {GOALS.map((g) => <option key={g} value={g}>{t[GOAL_LABEL[g]]}</option>)}
          </select>
        </label>
      </div>

      <h3 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.current_intake_optional}</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <label className={LBL}>{t.current_carbs}
          <input type="number" min={0} max={120} step={1} value={inputs.current_carbs} onChange={(e) => updateInput('current_carbs', Number(e.target.value || 30))} className={INP} />
        </label>
        <label className={LBL}>{t.current_sodium}
          <input type="number" min={0} max={2000} step={10} value={inputs.current_sodium} onChange={(e) => updateInput('current_sodium', Number(e.target.value || 300))} className={INP} />
        </label>
        <label className={LBL}>{locale === 'ar' ? 'السوائل الحالية' : 'Current fluid'} ({unitSystem === 'metric' ? (locale === 'ar' ? 'مل/ساعة' : 'ml/h') : 'fl oz/h'})
          <input type="number" min={0} max={unitSystem === 'metric' ? 2000 : 68} step={unitSystem === 'metric' ? 10 : 0.5} value={unitSystem === 'metric' ? inputs.current_fluid : Number((inputs.current_fluid / 29.5735).toFixed(1))} onChange={(e) => updateInput('current_fluid', Math.round(Number(e.target.value || (unitSystem === 'metric' ? 500 : 16.9)) * (unitSystem === 'metric' ? 1 : 29.5735)))} className={INP} />
        </label>
        <label className={LBL}>{t.current_eaa}
          <input type="number" min={0} max={20} step={0.5} value={inputs.current_eaa} onChange={(e) => updateInput('current_eaa', Number(e.target.value || 5))} className={INP} />
        </label>
      </div>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data, buildIntraWorkoutOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ training_type: 'resistance', duration_min: 90, intensity: 'high', climate: 'moderate', sweat_rate_ml_per_h: 1000, goal: 'performance', current_carbs: 30, current_sodium: 300, current_fluid: 500, current_eaa: 5 }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.per_hour_targets}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Metric label={t.carbs_per_h} value={`${result.recommendations.carbohydrates.target_g_per_h} g/h`} />
              <Metric label={t.sodium_per_h} value={`${result.recommendations.electrolytes.sodium_mg_per_h} mg/h`} />
              <Metric label={t.fluid_per_h} value={`${unitSystem === 'metric' ? result.recommendations.fluid.target_ml_per_h : Number((result.recommendations.fluid.target_ml_per_h / 29.5735).toFixed(1))} ${unitSystem === 'metric' ? 'ml/h' : 'fl oz/h'}`} />
              <Metric label={t.eaa_per_h} value={`${result.recommendations.amino_acids.eaa_g_per_h} g/h`} />
              <Metric label={t.potassium_per_h} value={`${result.recommendations.electrolytes.potassium_mg_per_h} mg/h`} />
              <Metric label={t.magnesium_per_h} value={`${result.recommendations.electrolytes.magnesium_mg_per_h} mg/h`} />
              <Metric label={t.fluid_sodium} value={`${result.recommendations.fluid.sodium_concentration_mmol_l} mmol/L`} />
              <Metric label={t.bcaa_per_h} value={`${result.recommendations.amino_acids.bcaa_g_per_h} g/h`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.session_totals}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.total_carbs} value={`${result.session_totals.total_carbs_g} g`} />
              <Metric label={t.total_sodium} value={`${result.session_totals.total_sodium_mg} mg`} />
              <Metric label={t.total_potassium} value={`${result.session_totals.total_potassium_mg} mg`} />
              <Metric label={t.total_magnesium} value={`${result.session_totals.total_magnesium_mg} mg`} />
              <Metric label={t.total_fluid} value={`${unitSystem === 'metric' ? result.session_totals.total_fluid_ml : Number((result.session_totals.total_fluid_ml / 29.5735).toFixed(1))} ${unitSystem === 'metric' ? 'ml' : 'fl oz'}`} />
              <Metric label={t.total_eaa} value={`${result.session_totals.total_eaa_g} g`} />
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.carb_type}</h4>
              <p className="text-xs text-lime-400">{t[`carb_type_${result.recommendations.carbohydrates.type}`]}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{result.recommendations.carbohydrates.rationale}</p>
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-bold text-zinc-400 mb-1">{t.aa_rationale}</h4>
              <p className="text-[10px] text-zinc-400">{result.recommendations.amino_acids.rationale}</p>
            </div>

            {result.flags.length > 0 && (
              <div className="mt-3 text-[11px] text-amber-300">
                <p className="font-black mb-1">{t.flags_title}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.flags.map((f) => <li key={f}>{t[f] || f}</li>)}
                </ul>
              </div>
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
