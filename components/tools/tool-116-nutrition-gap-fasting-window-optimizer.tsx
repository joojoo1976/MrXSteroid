'use client';
/** Tool #116 - Nutrition Gap & Fasting Window Optimizer (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type NutritionGapInput, type NutritionGapResult } from '@/lib/tools/engines/tool-116-nutrition-gap-fasting-window-optimizer';
import { buildNutritionGapOutput } from '@/lib/tools/adapters/tool-116-nutrition-gap-fasting-window-optimizer';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { NutritionGapInputSchema } from '@/lib/tools/schemas/tool-116-nutrition-gap-fasting-window-optimizer';
import i18nJson from '@/i18n/tool-116-nutrition-gap-fasting-window-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-116-nutrition-gap-fasting-window-optimizer';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const NUTRIENTS = [
  'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
  'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
  'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc',
  'copper', 'manganese', 'selenium', 'iodine', 'chromium', 'molybdenum',
] as const;

const FASTING_GOALS = ['weight_loss', 'metabolic_health', 'longevity', 'muscle_retention', 'general_wellness'] as const;
const GOAL_LABEL: Record<string, string> = {
  weight_loss: 'goal_weight_loss', metabolic_health: 'goal_metabolic',
  longevity: 'goal_longevity', muscle_retention: 'goal_muscle', general_wellness: 'goal_wellness',
};
const CHRONOTYPES = ['early', 'intermediate', 'late'] as const;
const CHRONO_LABEL: Record<string, string> = { early: 'chrono_early', intermediate: 'chrono_inter', late: 'chrono_late' };

interface DraftFoodEntry {
  name: string;
  amount_g: number;
  nutrients: Record<string, number>;
}

interface DraftInputs {
  sex: 'male' | 'female';
  days_tracked: number;
  fasting_goal: NutritionGapInput['fasting_goal'];
  chronotype: NutritionGapInput['chronotype'];
  typical_wake_time: string;
  typical_sleep_time: string;
  current_fasting_window: number;
  food_log: DraftFoodEntry[];
}

const DEFAULT_FOOD: DraftFoodEntry = { name: '', amount_g: 100, nutrients: {} };

export default function Tool116NutritionGapOptimizer() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    sex: 'male',
    days_tracked: 3,
    fasting_goal: 'general_wellness',
    chronotype: 'intermediate',
    typical_wake_time: '07:00',
    typical_sleep_time: '23:00',
    current_fasting_window: 14,
    food_log: [DEFAULT_FOOD],
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

  const updateProfile = (field: keyof DraftInputs, value: unknown) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const addFood = () => {
    setInputs((p) => ({ ...p, food_log: [...p.food_log, DEFAULT_FOOD] }));
  };

  const removeFood = (index: number) => {
    if (inputs.food_log.length <= 1) return;
    setInputs((p) => ({ ...p, food_log: p.food_log.filter((_, i) => i !== index) }));
  };

  const updateFood = (index: number, field: keyof DraftFoodEntry, value: unknown) => {
    setInputs((p) => {
      const newLog = [...p.food_log];
      newLog[index] = { ...newLog[index], [field]: value } as DraftFoodEntry;
      return { ...p, food_log: newLog };
    });
  };

  const updateNutrient = (foodIndex: number, nutrient: string, value: number | undefined) => {
    setInputs((p) => {
      const newLog = [...p.food_log];
      const nutrients = { ...newLog[foodIndex].nutrients };
      if (value === undefined) delete nutrients[nutrient];
      else nutrients[nutrient] = value;
      newLog[foodIndex] = { ...newLog[foodIndex], nutrients };
      return { ...p, food_log: newLog };
    });
  };

  const parsed = useMemo(() => NutritionGapInputSchema.safeParse(inputs), [inputs]);
  const validInput = parsed.success ? parsed.data : null;
  const { output, calculate, reset } = useExplicitToolOutput<NutritionGapInput, NutritionGapResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.profile_section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <label className={LBL}>{t.sex}
          <select value={inputs.sex} onChange={(e) => updateProfile('sex', e.target.value)} className={SEL}>
            <option value="male">{t.sex_male}</option>
            <option value="female">{t.sex_female}</option>
          </select>
        </label>
        <label className={LBL}>{t.days}
          <input data-r6-slider="true" type="number" min={1} max={30} step={1} value={inputs.days_tracked} onChange={(e) => updateProfile('days_tracked', Number(e.target.value || 3))} className={INP} />
        </label>
        <label className={LBL}>{t.fasting_goal}
          <select value={inputs.fasting_goal ?? ''} onChange={(e) => updateProfile('fasting_goal', e.target.value || undefined)} className={SEL}>
            {FASTING_GOALS.map((g) => <option key={g} value={g}>{t[GOAL_LABEL[g]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.chronotype}
          <select value={inputs.chronotype ?? ''} onChange={(e) => updateProfile('chronotype', e.target.value || undefined)} className={SEL}>
            {CHRONOTYPES.map((c) => <option key={c} value={c}>{t[CHRONO_LABEL[c]]}</option>)}
          </select>
        </label>
        <label className={LBL}>{t.wake_time}
          <input type="time" value={inputs.typical_wake_time} onChange={(e) => updateProfile('typical_wake_time', e.target.value)} className={INP} />
        </label>
        <label className={LBL}>{t.sleep_time}
          <input type="time" value={inputs.typical_sleep_time} onChange={(e) => updateProfile('typical_sleep_time', e.target.value)} className={INP} />
        </label>
        <label className={LBL}>{t.current_fasting}
          <input data-r6-slider="true" type="number" min={8} max={23} step={1} value={inputs.current_fasting_window} onChange={(e) => updateProfile('current_fasting_window', Number(e.target.value || 14))} className={INP} />
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.food_log_section}</h2>
      <div className="space-y-2 mb-4">
        {inputs.food_log.map((food, idx) => (
          <div key={idx} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300">{t.food_entry} {idx + 1}</h3>
              {inputs.food_log.length > 1 && <button type="button" onClick={() => removeFood(idx)} className="text-red-400 hover:text-red-300 text-xs">{t.remove}</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className={LBL}>{t.food_name}
                <input type="text" maxLength={100} value={food.name} onChange={(e) => updateFood(idx, 'name', e.target.value)} className={INP} placeholder={t.food_placeholder} />
              </label>
              <label className={LBL}>{t.amount_g} ({unitSystem === 'metric' ? 'g' : 'oz'})
                <input data-r6-slider="true" type="number" min={1} max={unitSystem === 'metric' ? 5000 : 176} step={unitSystem === 'metric' ? 1 : 0.1} value={unitSystem === 'metric' ? food.amount_g : Number((food.amount_g / 28.3495).toFixed(1))} onChange={(e) => updateFood(idx, 'amount_g', Math.round(Number(e.target.value || (unitSystem === 'metric' ? 100 : 3.5)) * (unitSystem === 'metric' ? 1 : 28.3495)))} className={INP} />
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {NUTRIENTS.map((nutrient) => (
                <label key={nutrient} className={LBL} style={{ fontSize: '8px' }}>
                  {t[`nutrient_${nutrient}`]}
                  <input data-r6-slider="true" type="number" min={0} max={10000} step={0.1} value={food.nutrients[nutrient] ?? ''} onChange={(e) => updateNutrient(idx, nutrient, e.target.value === '' ? undefined : Number(e.target.value))} className={INP} style={{ padding: '2px' }} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addFood} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_food}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data, buildNutritionGapOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ sex: 'male', days_tracked: 3, fasting_goal: 'general_wellness', chronotype: 'intermediate', typical_wake_time: '07:00', typical_sleep_time: '23:00', current_fasting_window: 14, food_log: [{ ...DEFAULT_FOOD, nutrients: {} }] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.fasting_recommendation}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Metric label={t.fasting_window} value={`${result.fasting_recommendation.suggested_window_hours}:${24 - result.fasting_recommendation.suggested_window_hours}`} />
              <Metric label={t.eating_window} value={`${result.fasting_recommendation.eating_window_start}–${result.fasting_recommendation.eating_window_end}`} />
              <Metric label={t.alignment} value={`${Math.round(result.fasting_recommendation.chronotype_alignment * 100)}%`} />
            </div>
            <p className="text-xs text-zinc-400 mb-4">{result.fasting_recommendation.rationale}</p>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.nutrient_analysis}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-1">{t.nutrient}</th>
                    <th className="pb-1">{t.intake}</th>
                    <th className="pb-1">{t.rda}</th>
                    <th className="pb-1">{t.pct_rda}</th>
                    <th className="pb-1">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.nutrient_analysis.map((n) => (
                    <tr key={n.nutrient} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                      <td className="py-1 font-bold text-lime-400">{t[`nutrient_${n.nutrient}`] || n.nutrient}</td>
                      <td className="py-1">{n.status === 'not_reported' ? '—' : `${n.avg_intake.toFixed(1)} ${n.unit}`}</td>
                      <td className="py-1">{n.rda} {n.unit}</td>
                      <td className="py-1">{n.status === 'not_reported' ? '—' : `${n.pct_rda}%`}</td>
                      <td className="py-1">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                          n.status === 'adequate' ? 'bg-emerald-500/20 text-emerald-400' :
                          n.status === 'low' ? 'bg-amber-500/20 text-amber-400' :
                          n.status === 'very_low' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {t[`status_${n.status}`]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.identified_gaps.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-zinc-400 mb-2">{t.identified_gaps}</h4>
                <div className="flex flex-wrap gap-2">
                  {result.identified_gaps.map((gap) => (
                    <span key={gap} className="px-2 py-0.5 text-[9px] font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      {t[`nutrient_${gap}`] || gap}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
