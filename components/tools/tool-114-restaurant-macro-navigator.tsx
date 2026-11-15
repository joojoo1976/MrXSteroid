'use client';
/** Tool #114 - Restaurant Macro Navigator & Fast-Food Estimator (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type RestaurantInput, type RestaurantResult, type RestaurantItem } from '@/lib/tools/engines/tool-114-restaurant-macro-navigator';
import { buildRestaurantOutput } from '@/lib/tools/adapters/tool-114-restaurant-macro-navigator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { RestaurantInputSchema } from '@/lib/tools/schemas/tool-114-restaurant-macro-navigator';
import i18nJson from '@/i18n/tool-114-restaurant-macro-navigator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-114-restaurant-macro-navigator';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const CUISINES = ['american', 'mexican', 'italian', 'chinese', 'japanese', 'indian', 'mediterranean', 'fast_food', 'other'] as const;
const CUISINE_LABEL: Record<string, string> = {
  american: 'cuisine_american', mexican: 'cuisine_mexican', italian: 'cuisine_italian',
  chinese: 'cuisine_chinese', japanese: 'cuisine_japanese', indian: 'cuisine_indian',
  mediterranean: 'cuisine_mediterranean', fast_food: 'cuisine_fast_food', other: 'cuisine_other',
};
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_LABEL: Record<string, string> = {
  breakfast: 'meal_breakfast', lunch: 'meal_lunch', dinner: 'meal_dinner', snack: 'meal_snack',
};
const PORTION_SIZES = ['small', 'regular', 'large', 'extra_large'] as const;
const PORTION_LABEL: Record<string, string> = {
  small: 'portion_small', regular: 'portion_regular', large: 'portion_large', extra_large: 'portion_xlarge',
};

interface DraftIngredient {
  name: string;
  estimated_weight_g: number;
  macros_per_100g?: { protein: number; carbs: number; fat: number; calories: number };
}

interface DraftItem {
  id: string;
  name: string;
  restaurant: string;
  cuisine: RestaurantItem['cuisine'];
  meal_type: RestaurantItem['meal_type'];
  known_calories?: number;
  known_protein_g?: number;
  known_carbs_g?: number;
  known_fat_g?: number;
  ingredients: DraftIngredient[];
  portion_size: RestaurantItem['portion_size'];
}

interface DraftInputs {
  items: DraftItem[];
}

const DEFAULT_INGREDIENT: DraftIngredient = { name: '', estimated_weight_g: 100 };

const DEFAULT_ITEM: DraftItem = {
  id: '',
  name: '',
  restaurant: '',
  cuisine: 'american',
  meal_type: 'lunch',
  ingredients: [],
  portion_size: 'regular',
};

export default function Tool114RestaurantMacroNavigator() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();

  const [inputs, setInputs] = useState<DraftInputs>({ items: [DEFAULT_ITEM] });
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

  const updateItem = (index: number, field: keyof DraftItem, value: unknown) => {
    setInputs((p) => {
      const newItems = [...p.items];
      newItems[index] = { ...newItems[index], [field]: value } as DraftItem;
      return { ...p, items: newItems };
    });
  };

  const updateIngredient = (itemIndex: number, ingIndex: number, field: keyof DraftIngredient, value: unknown) => {
    setInputs((p) => {
      const newItems = [...p.items];
      const newIngredients = [...newItems[itemIndex].ingredients];
      newIngredients[ingIndex] = { ...newIngredients[ingIndex], [field]: value } as DraftIngredient;
      newItems[itemIndex] = { ...newItems[itemIndex], ingredients: newIngredients };
      return { ...p, items: newItems };
    });
  };

  const addIngredient = (itemIndex: number) => {
    setInputs((p) => {
      const newItems = [...p.items];
      newItems[itemIndex] = { ...newItems[itemIndex], ingredients: [...newItems[itemIndex].ingredients, DEFAULT_INGREDIENT] };
      return { ...p, items: newItems };
    });
  };

  const removeIngredient = (itemIndex: number, ingIndex: number) => {
    setInputs((p) => {
      const newItems = [...p.items];
      newItems[itemIndex] = { ...newItems[itemIndex], ingredients: newItems[itemIndex].ingredients.filter((_, i) => i !== ingIndex) };
      return { ...p, items: newItems };
    });
  };

  const addItem = () => {
    setInputs((p) => ({ ...p, items: [...p.items, { ...DEFAULT_ITEM, id: `item_${Date.now()}` }] }));
  };

  const removeItem = (index: number) => {
    if (inputs.items.length <= 1) return;
    setInputs((p) => ({ ...p, items: p.items.filter((_, i) => i !== index) }));
  };

  const parsed = useMemo(() => {
    const validationItems = inputs.items
      .filter((f) => f.name.trim().length > 0)
      .map((f, index) => ({
        ...f,
        id: f.id || `item_${index + 1}`,
        ingredients: f.ingredients.filter((ing) => ing.name.trim().length > 0).map((ing) => ({
          name: ing.name,
          estimated_weight_g: ing.estimated_weight_g,
          macros_per_100g: ing.macros_per_100g,
        })),
      }));
    return RestaurantInputSchema.safeParse({ items: validationItems });
  }, [inputs]);

  const validInput = parsed.success ? parsed.data as RestaurantInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<RestaurantInput, RestaurantResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>

        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.meals_section}</h2>
      <div className="space-y-3 mb-4">
        {inputs.items.map((item, idx) => (
          <div key={idx} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300">{t.meal} {idx + 1}</h3>
              {inputs.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 text-xs">{t.remove}</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className={LBL}>{t.name}
                <input type="text" maxLength={100} value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} className={INP} placeholder={t.name_placeholder} />
              </label>
              <label className={LBL}>{t.restaurant}
                <input type="text" maxLength={100} value={item.restaurant} onChange={(e) => updateItem(idx, 'restaurant', e.target.value)} className={INP} placeholder={t.restaurant_placeholder} />
              </label>
              <label className={LBL}>{t.cuisine}
                <select value={item.cuisine} onChange={(e) => updateItem(idx, 'cuisine', e.target.value)} className={SEL}>
                  {CUISINES.map((c) => <option key={c} value={c}>{t[CUISINE_LABEL[c]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.meal_type}
                <select value={item.meal_type} onChange={(e) => updateItem(idx, 'meal_type', e.target.value)} className={SEL}>
                  {MEAL_TYPES.map((m) => <option key={m} value={m}>{t[MEAL_LABEL[m]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.portion_size}
                <select value={item.portion_size} onChange={(e) => updateItem(idx, 'portion_size', e.target.value)} className={SEL}>
                  {PORTION_SIZES.map((p) => <option key={p} value={p}>{t[PORTION_LABEL[p]]}</option>)}
                </select>
              </label>
            </div>

            <div className="border-t border-zinc-800 pt-2 space-y-2">
              <h4 className="text-xs font-bold text-zinc-400">{t.known_nutrition_optional}</h4>
              <div className="grid grid-cols-2 gap-2">
                <label className={LBL}>{t.calories}
                  <input data-r6-slider="true" type="number" min={0} max={5000} step={1} value={item.known_calories ?? ''} onChange={(e) => updateItem(idx, 'known_calories', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                </label>
                <label className={LBL}>{t.protein}
                  <input data-r6-slider="true" type="number" min={0} max={300} step={1} value={item.known_protein_g ?? ''} onChange={(e) => updateItem(idx, 'known_protein_g', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                </label>
                <label className={LBL}>{t.carbs}
                  <input data-r6-slider="true" type="number" min={0} max={500} step={1} value={item.known_carbs_g ?? ''} onChange={(e) => updateItem(idx, 'known_carbs_g', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                </label>
                <label className={LBL}>{t.fat}
                  <input data-r6-slider="true" type="number" min={0} max={200} step={1} value={item.known_fat_g ?? ''} onChange={(e) => updateItem(idx, 'known_fat_g', e.target.value ? Number(e.target.value) : undefined)} className={INP} placeholder="—" />
                </label>
              </div>
              <p className="text-[9px] text-zinc-500">{t.known_nutrition_hint}</p>
            </div>

            <div className="border-t border-zinc-800 pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-400">{t.ingredients_optional}</h4>
                <button type="button" onClick={() => addIngredient(idx)} className="text-xs text-lime-400 hover:text-lime-300">{t.add_ingredient}</button>
              </div>
              {item.ingredients.map((ing, ingIdx) => (
                <div key={ingIdx} className="flex gap-2">
                  <label className="flex-1" style={{ fontSize: '9px' }}>{t.ingredient_name}
                    <input type="text" maxLength={100} value={ing.name} onChange={(e) => updateIngredient(idx, ingIdx, 'name', e.target.value)} className={INP} placeholder={t.ingredient_placeholder} />
                  </label>
                  <label className="w-24" style={{ fontSize: '9px' }}>{t.weight_g} ({unitSystem === 'metric' ? 'g' : 'oz'})
                    <input data-r6-slider="true" type="number" min={1} max={unitSystem === 'metric' ? 2000 : 70} step={unitSystem === 'metric' ? 1 : 0.1} value={unitSystem === 'metric' ? ing.estimated_weight_g : Number((ing.estimated_weight_g / 28.3495).toFixed(1))} onChange={(e) => updateIngredient(idx, ingIdx, 'estimated_weight_g', Math.round(Number(e.target.value || (unitSystem === 'metric' ? 100 : 3.5)) * (unitSystem === 'metric' ? 1 : 28.3495)))} className={INP} />
                  </label>
                  <button type="button" onClick={() => removeIngredient(idx, ingIdx)} className="text-red-400 hover:text-red-300 text-xs w-16">{t.remove}</button>
                </div>
              ))}
              <p className="text-[9px] text-zinc-500">{t.ingredients_hint}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_meal}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as RestaurantInput, buildRestaurantOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ items: [{ ...DEFAULT_ITEM, ingredients: [] }] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Metric label={t.total_calories} value={`${result.daily_totals.calories} kcal`} />
              <Metric label={t.total_protein} value={`${result.daily_totals.protein_g} g`} />
              <Metric label={t.total_carbs} value={`${result.daily_totals.carbs_g} g`} />
              <Metric label={t.total_fat} value={`${result.daily_totals.fat_g} g`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.uncertainty_ranges}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <Metric label={t.calories} value={`${result.daily_uncertainty.calories[0]}–${result.daily_uncertainty.calories[1]}`} />
              <Metric label={t.protein} value={`${result.daily_uncertainty.protein[0]}–${result.daily_uncertainty.protein[1]}g`} />
              <Metric label={t.carbs} value={`${result.daily_uncertainty.carbs[0]}–${result.daily_uncertainty.carbs[1]}g`} />
              <Metric label={t.fat} value={`${result.daily_uncertainty.fat[0]}–${result.daily_uncertainty.fat[1]}g`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.meal_breakdown}</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.items.map((item, i) => (
                <div key={i} className="rounded-lg bg-zinc-950 border border-zinc-800 p-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lime-400">{item.name}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${item.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : item.confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {t[`confidence_${item.confidence}`]}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${item.data_source === 'user_provided' ? 'bg-blue-500/20 text-blue-400' : item.data_source === 'ingredient_estimate' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                        {t[`source_${item.data_source.replace('_', '-')}`]}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[9px] text-zinc-400 font-mono">
                      <span>Cal: {item.estimated_calories} (±{Math.round((item.uncertainty_range.calories[1] - item.uncertainty_range.calories[0]) / 2)})</span>
                      <span>P:{item.estimated_protein_g}g C:{item.estimated_carbs_g}g F:{item.estimated_fat_g}g</span>
                    </div>
                  </div>
                </div>
              ))}
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
