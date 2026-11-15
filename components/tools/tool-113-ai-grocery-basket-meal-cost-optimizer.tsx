'use client';
/** Tool #113 - AI Grocery Basket & Meal Cost Optimizer (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { type GroceryInput, type GroceryResult, type GroceryItem } from '@/lib/tools/engines/tool-113-ai-grocery-basket-meal-cost-optimizer';
import { buildGroceryOutput } from '@/lib/tools/adapters/tool-113-ai-grocery-basket-meal-cost-optimizer';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { GroceryInputSchema } from '@/lib/tools/schemas/tool-113-ai-grocery-basket-meal-cost-optimizer';
import i18nJson from '@/i18n/tool-113-ai-grocery-basket-meal-cost-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-113-ai-grocery-basket-meal-cost-optimizer';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const UNITS = ['g', 'kg', 'lb', 'oz', 'piece', 'can', 'pack'] as const;
const UNIT_LABEL: Record<string, string> = { g: 'unit_g', kg: 'unit_kg', lb: 'unit_lb', oz: 'unit_oz', piece: 'unit_piece', can: 'unit_can', pack: 'unit_pack' };
const CATEGORIES = ['protein', 'carb', 'fat', 'vegetable', 'fruit', 'dairy', 'pantry'] as const;
const CAT_LABEL: Record<string, string> = {
  protein: 'cat_protein', carb: 'cat_carb', fat: 'cat_fat',
  vegetable: 'cat_vegetable', fruit: 'cat_fruit', dairy: 'cat_dairy', pantry: 'cat_pantry',
};

interface DraftItem {
  id: string;
  name: string;
  price_per_unit: number;
  unit: GroceryItem['unit'];
  unit_size_g: number;
  macros_per_100g: { protein: number; carbs: number; fat: number; calories: number };
  min_quantity: number;
  max_quantity: number;
  category: GroceryItem['category'];
}

interface DraftInputs {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  budget_usd: number;
  days: number;
  items: DraftItem[];
}

const DEFAULT_ITEM: DraftItem = {
  id: '',
  name: '',
  price_per_unit: 1,
  unit: 'kg',
  unit_size_g: 1000,
  macros_per_100g: { protein: 20, carbs: 5, fat: 3, calories: 130 },
  min_quantity: 1,
  max_quantity: 10,
  category: 'protein',
};

export default function Tool113GroceryOptimizer() {
  requireTool(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>({
    daily_calories: 2500,
    daily_protein: 180,
    daily_carbs: 250,
    daily_fat: 85,
    budget_usd: 100,
    days: 7,
    items: [DEFAULT_ITEM],
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

  const massDisplayFactor = unitSystem === 'metric' ? 1 : 28.349523125;
  const massDisplayUnit = unitSystem === 'metric' ? 'g' : 'oz';

  const updateItem = (index: number, field: keyof DraftItem, value: unknown) => {
    setInputs((p) => {
      const newItems = [...p.items];
      newItems[index] = { ...newItems[index], [field]: value } as DraftItem;
      return { ...p, items: newItems };
    });
  };

  const updateMacro = (index: number, macro: keyof DraftItem['macros_per_100g'], value: number) => {
    setInputs((p) => {
      const newItems = [...p.items];
      newItems[index] = { ...newItems[index], macros_per_100g: { ...newItems[index].macros_per_100g, [macro]: value } };
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
      .map((f, index) => ({ ...f, id: f.id || `item_${index + 1}` }));
    return GroceryInputSchema.safeParse({
      items: validationItems,
      daily_targets: { calories: inputs.daily_calories, protein_g: inputs.daily_protein, carbs_g: inputs.daily_carbs, fat_g: inputs.daily_fat },
      budget_usd: inputs.budget_usd,
      days: inputs.days,
    });
  }, [inputs]);

  const validInput = parsed.success ? parsed.data as GroceryInput : null;
  const { output, calculate, reset } = useExplicitToolOutput<GroceryInput, GroceryResult>(validInput);
  const result = output?.result ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">


        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.targets_section}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.daily_calories}
          <input data-r6-slider="true" type="number" min={500} max={10000} step={50} value={inputs.daily_calories} onChange={(e) => setInputs((p) => ({ ...p, daily_calories: Number(e.target.value || 2500) }))} className={INP} />
        </label>
        <label className={LBL}>{t.daily_protein}
          <input data-r6-slider="true" type="number" min={20} max={500} step={5} value={inputs.daily_protein} onChange={(e) => setInputs((p) => ({ ...p, daily_protein: Number(e.target.value || 180) }))} className={INP} />
        </label>
        <label className={LBL}>{t.daily_carbs}
          <input data-r6-slider="true" type="number" min={20} max={1000} step={10} value={inputs.daily_carbs} onChange={(e) => setInputs((p) => ({ ...p, daily_carbs: Number(e.target.value || 250) }))} className={INP} />
        </label>
        <label className={LBL}>{t.daily_fat}
          <input data-r6-slider="true" type="number" min={10} max={300} step={5} value={inputs.daily_fat} onChange={(e) => setInputs((p) => ({ ...p, daily_fat: Number(e.target.value || 85) }))} className={INP} />
        </label>
        <label className={LBL}>{t.budget}
          <input data-r6-slider="true" type="number" min={1} max={100000} step={1} value={inputs.budget_usd} onChange={(e) => setInputs((p) => ({ ...p, budget_usd: Number(e.target.value || 100) }))} className={INP} />
        </label>
        <label className={LBL}>{t.days}
          <input data-r6-slider="true" type="number" min={1} max={30} step={1} value={inputs.days} onChange={(e) => setInputs((p) => ({ ...p, days: Number(e.target.value || 7) }))} className={INP} />
        </label>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.items_section}</h2>
      <div className="space-y-3 mb-4">
        {inputs.items.map((item, idx) => (
          <div key={idx} className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300">{t.item} {idx + 1}</h3>
              {inputs.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 text-xs">{t.remove}</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <label className={LBL}>{t.name}
                <input type="text" maxLength={100} value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} className={INP} placeholder={t.name_placeholder} />
              </label>
              <label className={LBL}>{t.price}
                <input data-r6-slider="true" type="number" min={0.01} max={10000} step={0.01} value={item.price_per_unit} onChange={(e) => updateItem(idx, 'price_per_unit', Number(e.target.value || 1))} className={INP} />
              </label>
              <label className={LBL}>{t.unit}
                <select value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} className={SEL}>
                  {UNITS.map((u) => <option key={u} value={u}>{t[UNIT_LABEL[u]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.unit_size.replace(/\s*\([^)]*\)\s*$/, '')} ({massDisplayUnit})
                <input data-r6-slider="true"
                  type="number"
                  min={unitSystem === 'metric' ? 1 : Number((1 / massDisplayFactor).toFixed(4))}
                  max={unitSystem === 'metric' ? 50000 : Number((50000 / massDisplayFactor).toFixed(2))}
                  step={unitSystem === 'metric' ? 1 : 0.01}
                  value={unitSystem === 'metric' ? item.unit_size_g : Number((item.unit_size_g / massDisplayFactor).toFixed(2))}
                  onChange={(e) => updateItem(idx, 'unit_size_g', Number((Number(e.target.value || (unitSystem === 'metric' ? 1000 : 1000 / massDisplayFactor)) * massDisplayFactor).toFixed(3)))}
                  className={INP}
                />
              </label>
              <label className={LBL}>{t.category}
                <select value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)} className={SEL}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{t[CAT_LABEL[c]]}</option>)}
                </select>
              </label>
              <label className={LBL}>{t.min_qty}
                <input data-r6-slider="true" type="number" min={0} max={1000} step={1} value={item.min_quantity} onChange={(e) => updateItem(idx, 'min_quantity', Number(e.target.value || 1))} className={INP} />
              </label>
              <label className={LBL}>{t.max_qty}
                <input data-r6-slider="true" type="number" min={1} max={1000} step={1} value={item.max_quantity} onChange={(e) => updateItem(idx, 'max_quantity', Number(e.target.value || 10))} className={INP} />
              </label>
              <label className={LBL}>{t.protein_100g}
                <input data-r6-slider="true" type="number" min={0} max={100} step={0.5} value={item.macros_per_100g.protein} onChange={(e) => updateMacro(idx, 'protein', Number(e.target.value || 20))} className={INP} />
              </label>
              <label className={LBL}>{t.carbs_100g}
                <input data-r6-slider="true" type="number" min={0} max={100} step={0.5} value={item.macros_per_100g.carbs} onChange={(e) => updateMacro(idx, 'carbs', Number(e.target.value || 5))} className={INP} />
              </label>
              <label className={LBL}>{t.fat_100g}
                <input data-r6-slider="true" type="number" min={0} max={100} step={0.5} value={item.macros_per_100g.fat} onChange={(e) => updateMacro(idx, 'fat', Number(e.target.value || 3))} className={INP} />
              </label>
              <label className={LBL}>{t.calories_100g}
                <input data-r6-slider="true" type="number" min={0} max={900} step={1} value={item.macros_per_100g.calories} onChange={(e) => updateMacro(idx, 'calories', Number(e.target.value || 130))} className={INP} />
              </label>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className="mb-4 px-3 py-1.5 text-xs font-bold rounded-lg bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30">{t.add_item}</button>

      {!parsed.success && <p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>}

      <div className="mb-4 flex gap-2">
        <button type="button" disabled={!parsed.success} onClick={() => parsed.success && calculate(parsed.data as GroceryInput, buildGroceryOutput, locale, unitSystem)} className="rounded-lg bg-lime-500 px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">{locale === 'ar' ? 'احسب' : 'Calculate'}</button>
        <button type="button" onClick={() => { reset(); setInputs({ daily_calories: 2500, daily_protein: 180, daily_carbs: 250, daily_fat: 85, budget_usd: 100, days: 7, items: [{ ...DEFAULT_ITEM, macros_per_100g: { ...DEFAULT_ITEM.macros_per_100g } }] }); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold text-zinc-300">{locale === 'ar' ? 'إعادة ضبط' : 'Reset'}</button>
      </div>

      {output && <ToolOutputSummary output={output} locale={locale} />}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Metric label={t.total_cost} value={`$${result.total_cost_usd.toFixed(2)}`} />
              <Metric label={t.budget_used} value={`${result.budget_utilization_pct}%`} />
              <Metric label={t.items_selected} value={`${result.selected_items.length}`} />
              <Metric label={t.avg_achievement} value={`${Math.round((result.target_achievement.calories_pct + result.target_achievement.protein_pct + result.target_achievement.carbs_pct + result.target_achievement.fat_pct) / 4)}%`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.target_achievement}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Metric label={t.calories} value={`${result.target_achievement.calories_pct}%`} />
              <Metric label={t.protein} value={`${result.target_achievement.protein_pct}%`} />
              <Metric label={t.carbs} value={`${result.target_achievement.carbs_pct}%`} />
              <Metric label={t.fat} value={`${result.target_achievement.fat_pct}%`} />
            </div>

            <h3 className="text-xs font-black text-zinc-400 mb-2">{t.selected_items}</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.selected_items.map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs p-2 rounded bg-zinc-950 border border-zinc-800">
                  <span className="font-bold text-lime-400">{s.name}</span>
                  <span className="text-zinc-400">{s.quantity} {s.unit}</span>
                  <span className="text-amber-400">${s.cost_usd.toFixed(2)}</span>
                  <span className="text-zinc-500">P:{s.macros.protein_g}g C:{s.macros.carbs_g}g F:{s.macros.fat_g}g</span>
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
