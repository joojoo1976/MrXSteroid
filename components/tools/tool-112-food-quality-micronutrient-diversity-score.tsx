'use client';
/** Tool #112 - Food Quality & Micronutrient Diversity Score (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type FoodQualityInput, type FoodQualityResult, type FoodItem, type ProcessingLevel } from '@/lib/tools/engines/tool-112-food-quality-micronutrient-diversity-score';
import { buildFoodQualityOutput } from '@/lib/tools/adapters/tool-112-food-quality-micronutrient-diversity-score';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { FoodQualityInputSchema } from '@/lib/tools/schemas/tool-112-food-quality-micronutrient-diversity-score';
import i18nJson from '@/i18n/tool-112-food-quality-micronutrient-diversity-score.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-112-food-quality-micronutrient-diversity-score';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const FOOD_GROUPS: FoodItem['group'][] = [
  'vegetables', 'fruits', 'whole_grains', 'legumes', 'nuts_seeds',
  'lean_protein', 'dairy', 'healthy_fats', 'processed_meats',
  'refined_grains', 'added_sugars', 'fried_foods', 'ultra_processed',
];
const GROUP_LABEL: Record<string, string> = {
  vegetables: 'grp_vegetables', fruits: 'grp_fruits', whole_grains: 'grp_whole_grains',
  legumes: 'grp_legumes', nuts_seeds: 'grp_nuts_seeds', lean_protein: 'grp_lean_protein',
  dairy: 'grp_dairy', healthy_fats: 'grp_healthy_fats', processed_meats: 'grp_processed_meats',
  refined_grains: 'grp_refined_grains', added_sugars: 'grp_added_sugars',
  fried_foods: 'grp_fried_foods', ultra_processed: 'grp_ultra_processed',
};
const PROCESSING_OPTIONS: ProcessingLevel[] = ['unprocessed', 'minimally_processed', 'processed', 'ultra_processed'];
const PROCESSING_LABEL: Record<ProcessingLevel, string> = {
  unprocessed: 'proc_unprocessed',
  minimally_processed: 'proc_minimally',
  processed: 'proc_processed',
  ultra_processed: 'proc_ultra',
};
const COMMON_MICROS = [
  'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
  'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
  'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc', 'copper',
  'manganese', 'selenium',
];

interface DraftFoodItem {
  name: string;
  group: FoodItem['group'];
  processing_level: ProcessingLevel;
  serving_size_g: number;
  calories_per_serving: number;
  micronutrients: string[];
}

interface DraftInputs {
  days_tracked: number;
  foods: DraftFoodItem[];
}

const DEFAULT_FOOD: DraftFoodItem = {
  name: '',
  group: 'vegetables',
  processing_level: 'unprocessed',
  serving_size_g: 100,
  calories_per_serving: 50,
  micronutrients: [],
};

export default function Tool112FoodQualityScore() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({
    days_tracked: 3,
    foods: [DEFAULT_FOOD],
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

  const updateFood = (index: number, field: keyof DraftFoodItem, value: unknown) => {
    setInputs((p) => {
      const newFoods = [...p.foods];
      newFoods[index] = { ...newFoods[index], [field]: value } as DraftFoodItem;
      return { ...p, foods: newFoods };
    });
  };

  const addFood = () => {
    setInputs((p) => ({ ...p, foods: [...p.foods, DEFAULT_FOOD] }));
  };

  const removeFood = (index: number) => {
    setInputs((p) => ({ ...p, foods: p.foods.filter((_, i) => i !== index) }));
  };

  const toggleMicro = (index: number, micro: string) => {
    setInputs((p) => {
      const newFoods = [...p.foods];
      const current = newFoods[index].micronutrients;
      newFoods[index] = {
        ...newFoods[index],
        micronutrients: current.includes(micro) ? current.filter((m) => m !== micro) : [...current, micro],
      };
      return { ...p, foods: newFoods };
    });
  };

  const parsed = useMemo(() => {
    const validationFoods = inputs.foods
      .filter((f) => f.name.trim().length > 0)
      .map((f) => ({
        ...f,
        micronutrients: f.micronutrients,
      }));
    return FoodQualityInputSchema.safeParse({ foods: validationFoods, days_tracked: inputs.days_tracked });
  }, [inputs]);

  const validInput = parsed.success ? parsed.data as FoodQualityInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<FoodQualityInput, FoodQualityResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>

      <div className="mb-4">
        <label className={LBL}>{t.days_tracked}
          <input data-r6-slider="true" type="number" min={1} max={30} step={1} value={inputs.days_tracked} onChange={(e) => setInputs((p) => ({ ...p, days_tracked: Number(e.target.value || 3) }))} className={INP} />
        </label>
      </div>

      <div className="space-y-3 mb-4">
        {inputs.foods.map((food, idx) => (
          <div key={idx} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300">{t.food_item} {idx + 1}</h3>
              {inputs.foods.length > 1 && (
                <button type="button" onClick={() => removeFood(idx)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className={LBL}>{t.food_name}
                <input type="text" maxLength={100} value={food.name} onChange={(e) => updateFood(idx, 'name', e.target.value)} className={INP} placeholder={t.food_name_placeholder} />
              </label>
              <label className={LBL}>{t.food_group}
                <select value={food.group} onChange={(e) => updateFood(idx, 'group', e.target.value)} className={SEL}>
                  {FOOD_GROUPS.map((g) => <option key={g} value={g}>{t[GROUP_LABEL[g]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.processing_level}
                <select value={food.processing_level} onChange={(e) => updateFood(idx, 'processing_level', e.target.value)} className={SEL}>
                  {PROCESSING_OPTIONS.map((p) => <option key={p} value={p}>{t[PROCESSING_LABEL[p]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.serving_size} ({unitSystem === 'metric' ? 'g' : 'oz'})
                <input data-r6-slider="true" type="number" min={1} max={unitSystem === 'metric' ? 2000 : 70} step={unitSystem === 'metric' ? 1 : 0.1} value={unitSystem === 'metric' ? food.serving_size_g : Number((food.serving_size_g / 28.3495).toFixed(1))} onChange={(e) => updateFood(idx, 'serving_size_g', Math.round(Number(e.target.value || (unitSystem === 'metric' ? 100 : 3.5)) * (unitSystem === 'metric' ? 1 : 28.3495)))} className={INP} />
              </label>
              <label className={LBL}>{t.calories}
                <input data-r6-slider="true" type="number" min={0} max={5000} step={1} value={food.calories_per_serving} onChange={(e) => updateFood(idx, 'calories_per_serving', Number(e.target.value || 50))} className={INP} />
              </label>
              <label className={LBL}>{t.micronutrients}
                <div className="flex flex-wrap gap-1 mt-1">
                  {COMMON_MICROS.map((micro) => (
                    <button
                      key={micro}
                      type="button"
                      onClick={() => toggleMicro(idx, micro)}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${food.micronutrients.includes(micro) ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
                    >
                      {micro}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addFood} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_food}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as FoodQualityInput, buildFoodQualityOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ days_tracked: 3, foods: [{ ...DEFAULT_FOOD, micronutrients: [] }] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label={t.food_quality_score} value={`${result.food_quality_score}/100`} />
              <Metric label={t.micronutrient_diversity} value={`${result.micronutrient_diversity_score}/100`} />
              <Metric label={t.whole_food_ratio} value={`${Math.round(result.whole_food_ratio * 100)}%`} />
              <Metric label={t.food_group_coverage} value={`${Math.round(result.food_group_coverage * 100)}%`} />
              <Metric label={t.unique_micronutrients} value={`${result.unique_micronutrients}`} />
              <Metric label={t.ultra_processed_ratio} value={`${Math.round(result.processing_distribution.ultra_processed * 100)}%`} />
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-black text-zinc-400 mb-2">{t.processing_breakdown}</h3>
              <div className="grid grid-cols-2 gap-2">
                <Metric label={t.proc_unprocessed} value={`${Math.round(result.processing_distribution.unprocessed * 100)}%`} />
                <Metric label={t.proc_minimally} value={`${Math.round(result.processing_distribution.minimally_processed * 100)}%`} />
                <Metric label={t.proc_processed} value={`${Math.round(result.processing_distribution.processed * 100)}%`} />
                <Metric label={t.proc_ultra} value={`${Math.round(result.processing_distribution.ultra_processed * 100)}%`} />
              </div>
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
