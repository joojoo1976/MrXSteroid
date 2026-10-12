'use client';
/** Tool #110 - AI Meal Vision Scanner & Portion Estimator (dynamic UI). */
import React, { useEffect, useMemo, useState } from 'react';
import { calcMealEstimate, type MealMealInput, type MealResult } from '@/lib/tools/engines/tool-110-ai-meal-vision-scanner';
import { AUTO_DRAFT_DEBOUNCE_MS, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { requireTool } from '@/lib/tools/registry';
import { MealInputSchema } from '@/lib/tools/schemas/tool-110-ai-meal-vision-scanner';
import i18nJson from '@/i18n/tool-110-ai-meal-vision-scanner.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-110-ai-meal-vision-scanner';
const SEL = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const INP = 'mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono';
const LBL = 'text-[10px] font-bold text-zinc-500';

const MEAL_OPTIONS = ['breakfast', 'lunch', 'dinner', 'snack', 'shake'];
const PLATE_OPTIONS = ['small', 'medium', 'standard', 'large'];
const QUALITY_OPTIONS = ['poor', 'medium', 'high'];
const CONSENT_OPTIONS = ['given', 'not_given', 'declined'];

const MEAL_LABEL: Record<string, string> = {
  breakfast: 'meal_breakfast', lunch: 'meal_lunch', dinner: 'meal_dinner',
  snack: 'meal_snack', shake: 'meal_shake',
};
const PLATE_LABEL: Record<string, string> = {
  small: 'plate_small', medium: 'plate_medium',
  standard: 'plate_standard', large: 'plate_large',
};
const QUALITY_LABEL: Record<string, string> = {
  poor: 'quality_poor', medium: 'quality_medium', high: 'quality_high',
};
const CONSENT_LABEL: Record<string, string> = {
  given: 'consent_given', not_given: 'consent_not_given', declined: 'consent_declined',
};

interface DraftInputs {
  meal_type: string;
  plate_size: string;
  food_items: string[];
  photo_attached: boolean;
  photo_quality: string;
  photo_consent: string;
}

const DEFAULT_FOOD_CSV = 'chicken breast, white rice, broccoli';

function splitFood(csv: string): string[] {
  return csv.split(',').map((s) => s.trim()).filter((s) => s.length > 0).slice(0, 24);
}

export default function Tool110MealVisionScanner() {
  requireTool(TOOL_SLUG);
  const [locale, setLocale] = useState<'ar' | 'en'>('ar');
  const [foodCsv, setFoodCsv] = useState(DEFAULT_FOOD_CSV);
  const [inputs, setInputs] = useState<DraftInputs>({
    meal_type: 'lunch',
    plate_size: 'standard',
    food_items: splitFood(DEFAULT_FOOD_CSV),
    photo_attached: false,
    photo_quality: 'medium',
    photo_consent: 'not_given',
  });
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (draft?.inputs) {
      setInputs((p) => ({ ...p, ...draft.inputs }));
      if (draft.inputs.food_items?.length) setFoodCsv(draft.inputs.food_items.join(', '));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => saveDraft(TOOL_SLUG, inputs, { locale, unitSystem: 'metric', savedAt: new Date().toISOString() }), AUTO_DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputs, locale]);

  const parsed = useMemo(() => MealInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo<MealResult | null>(() => (parsed.success ? calcMealEstimate(parsed.data as MealMealInput) : null), [parsed]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setLocale('ar')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'ar' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>عربي</button>
          <button type="button" onClick={() => setLocale('en')} className={`px-3 py-1 text-xs font-bold rounded-lg ${locale === 'en' ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>EN</button>
        </div>
      </div>

      <h2 className="mb-2 text-xs font-black text-zinc-400 uppercase">{t.inputs}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className={LBL}>{t.meal_type}
          <select value={inputs.meal_type} onChange={(e) => setInputs((p) => ({ ...p, meal_type: e.target.value }))} className={SEL}>
            {MEAL_OPTIONS.map((m) => (<option key={m} value={m}>{t[MEAL_LABEL[m]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.plate_size}
          <select value={inputs.plate_size} onChange={(e) => setInputs((p) => ({ ...p, plate_size: e.target.value }))} className={SEL}>
            {PLATE_OPTIONS.map((p) => (<option key={p} value={p}>{t[PLATE_LABEL[p]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.photo_quality}
          <select value={inputs.photo_quality} onChange={(e) => setInputs((p) => ({ ...p, photo_quality: e.target.value }))} className={SEL}>
            {QUALITY_OPTIONS.map((q) => (<option key={q} value={q}>{t[QUALITY_LABEL[q]]}</option>))}
          </select>
        </label>
        <label className={LBL}>{t.photo_consent}
          <select value={inputs.photo_consent} onChange={(e) => setInputs((p) => ({ ...p, photo_consent: e.target.value }))} className={SEL}>
            {CONSENT_OPTIONS.map((c) => (<option key={c} value={c}>{t[CONSENT_LABEL[c]]}</option>))}
          </select>
        </label>
        <label className={`${LBL} flex items-center gap-2 md:col-span-2`}>
          <input type="checkbox" checked={inputs.photo_attached} onChange={(e) => setInputs((p) => ({ ...p, photo_attached: e.target.checked }))} className="rounded" />
          {t.photo_attached}
        </label>
        <label className={`${LBL} md:col-span-3`}>{t.food_items}
          <input type="text" value={foodCsv} onChange={(e) => { setFoodCsv(e.target.value); setInputs((p) => ({ ...p, food_items: splitFood(e.target.value) })); }} className={INP} />
        </label>
      </div>

      {!parsed.success && (<p className="mb-3 text-xs font-bold text-red-400">&#9888; {t.invalid}</p>)}

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5">
            <h2 className="text-sm font-black text-lime-400 mb-3">{t.results}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label={t.energy} value={`${result.total_energy_kcal} kcal`} />
              <Metric label={t.protein} value={`${result.protein_g} g`} />
              <Metric label={t.carbs} value={`${result.carbs_g} g`} />
              <Metric label={t.fat} value={`${result.fat_g} g`} />
              <Metric label={t.range} value={`${result.energy_range_kcal[0]}\u2013${result.energy_range_kcal[1]} kcal`} />
              <Metric label={t.estimate} value={`${result.portion_estimates.length}`} />
            </div>

            <h3 className="mt-4 text-[10px] font-black text-zinc-400 uppercase mb-1">{t.portions}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-zinc-300">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="text-start py-1">{t.estimate}</th>
                    <th className="text-start py-1">g</th>
                    <th className="text-start py-1">{t.range}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.portion_estimates.map((p) => (
                    <tr key={p.food} className="border-t border-zinc-800">
                      <td className="py-1 capitalize">{p.food}</td>
                      <td className="py-1 font-mono">{p.estimate_g}</td>
                      <td className="py-1 font-mono">{p.low_g} \u2013 {p.high_g}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-[11px] text-zinc-300">
              <p className="font-black text-amber-300 mb-1">{t.uncertainty}</p>
              <p className="font-mono">{result.uncertainty_label}</p>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                {result.education_flags.map((f) => (<li key={f}>{f}</li>))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-sky-950/30 border border-sky-800/50 p-4 text-xs text-sky-200">
            <p className="font-black mb-1">&#128274; {t.privacy_title}</p>
            <p>{t.privacy_text}</p>
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
