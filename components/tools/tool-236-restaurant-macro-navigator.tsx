'use client';

import { useState } from 'react';
import { calculateRestaurantLabelTotals } from '@/lib/tools/engines/tool-236-restaurant-macro.v7';
import { RestaurantMacroInputV7Schema } from '@/lib/tools/schemas/tool-236-restaurant-macro-navigator.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type RestaurantDraft = {
  itemName: string;
  restaurantName: string;
  servings: string;
  caloriesPerServing: string;
  proteinGramsPerServing: string;
  carbohydrateGramsPerServing: string;
  fatGramsPerServing: string;
  sourceReference: string;
};

const emptyItem = (): RestaurantDraft => ({
  itemName: '', restaurantName: '', servings: '', caloriesPerServing: '', proteinGramsPerServing: '',
  carbohydrateGramsPerServing: '', fatGramsPerServing: '', sourceReference: '',
});
const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool236RestaurantMacroNavigator() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [items, setItems] = useState<RestaurantDraft[]>([emptyItem()]);
  const [result, setResult] = useState<ReturnType<typeof calculateRestaurantLabelTotals> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (index: number, field: keyof RestaurantDraft, value: string) => {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
    setResult(null);
    setError(null);
  };

  const calculate = () => {
    const number = (value: string) => value.trim() === '' ? undefined : Number(value);
    const candidate = {
      items: items.map((item) => ({
        itemName: item.itemName,
        ...(item.restaurantName.trim() ? { restaurantName: item.restaurantName } : {}),
        servings: number(item.servings),
        caloriesPerServing: number(item.caloriesPerServing),
        proteinGramsPerServing: number(item.proteinGramsPerServing),
        carbohydrateGramsPerServing: number(item.carbohydrateGramsPerServing),
        fatGramsPerServing: number(item.fatGramsPerServing),
        sourceReference: item.sourceReference,
      })),
    };
    const parsed = RestaurantMacroInputV7Schema.safeParse(candidate);
    if (!parsed.success) {
      setError(tr('أكمل كل بيانات الملصق ومصدره، واستخدم قيماً محدودة غير سالبة.', 'Complete each label entry and its source using bounded, non-negative values.'));
      setResult(null);
      return;
    }
    setResult(calculateRestaurantLabelTotals(parsed.data));
    setError(null);
  };

  const field = (index: number, key: keyof RestaurantDraft, label: string, numeric = false) => (
    <label className="block text-xs font-semibold text-zinc-300">
      {label}
      <input
        className={inputClass}
        data-testid={`restaurant-${index}-${key}`}
        type={numeric ? 'number' : 'text'}
        min={numeric ? '0' : undefined}
        step={numeric ? 'any' : undefined}
        maxLength={numeric ? undefined : 500}
        value={items[index][key]}
        onChange={(event) => update(index, key, event.target.value)}
      />
    </label>
  );

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-6 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <header>
        <h1 className="text-2xl font-black">{tr('حاسبة بيانات ملصق وجبات المطاعم', 'Restaurant Menu Label Calculator')}</h1>
        <p className="mt-2 text-sm text-zinc-300">{tr('أدخل قيماً منشورة أو منقولة بنفسك من الملصق. الأداة تضرب القيم في عدد الحصص فقط ولا تخمّن بيانات المطعم.', 'Enter values you transcribed from a menu or label. This tool only multiplies them by servings; it does not estimate restaurant data.')}</p>
      </header>

      {items.map((item, index) => (
        <section key={index} className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4" aria-label={tr(`الصنف ${index + 1}`, `Item ${index + 1}`)}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">{tr(`الصنف ${index + 1}`, `Item ${index + 1}`)}</h2>
            {items.length > 1 && <button type="button" className="text-sm text-rose-300 underline" onClick={() => { setItems((current) => current.filter((_, i) => i !== index)); setResult(null); }}>{tr('حذف الصنف', 'Remove item')}</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {field(index, 'itemName', tr('اسم الصنف', 'Item name'))}
            {field(index, 'restaurantName', tr('اسم المطعم (اختياري)', 'Restaurant (optional)'))}
            {field(index, 'servings', tr('عدد الحصص', 'Number of servings'), true)}
            {field(index, 'caloriesPerServing', tr('السعرات لكل حصة كما في المصدر', 'Label calories per serving'), true)}
            {field(index, 'proteinGramsPerServing', tr('البروتين لكل حصة (جم)', 'Protein per serving (g)'), true)}
            {field(index, 'carbohydrateGramsPerServing', tr('الكربوهيدرات لكل حصة (جم)', 'Carbohydrate per serving (g)'), true)}
            {field(index, 'fatGramsPerServing', tr('الدهون لكل حصة (جم)', 'Fat per serving (g)'), true)}
            {field(index, 'sourceReference', tr('مصدر القيم أو مرجع الملصق', 'Value source or label reference'))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={items.length >= 12} onClick={() => { setItems((current) => [...current, emptyItem()]); setResult(null); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm disabled:opacity-40">{tr('إضافة صنف', 'Add item')}</button>
        <button type="button" onClick={calculate} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black">{tr('احسب الإجمالي', 'Calculate totals')}</button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-sm text-amber-200">{error}</p>}
      {result && <section role="status" className="space-y-2 rounded-xl border border-lime-700 bg-zinc-900 p-4" aria-label={tr('الإجمالي المحسوب من بيانات المستخدم', 'Calculated total from user-provided data')}>
        <h2 className="font-bold">{tr('الإجمالي الحسابي', 'Arithmetic total')}</h2>
        <p>{tr('السعرات', 'Calories')}: {result.totals.calories} kcal</p>
        <p>{tr('البروتين', 'Protein')}: {result.totals.proteinGrams} g · {tr('الكربوهيدرات', 'Carbohydrate')}: {result.totals.carbohydrateGrams} g · {tr('الدهون', 'Fat')}: {result.totals.fatGrams} g</p>
        <p className="text-xs text-zinc-400">{tr('المدخلات من المستخدم وليست متحققاً منها. اختلاف السعرات عن 4/4/9 لا يثبت خطأ الملصق.', 'Inputs are user-provided and unverified. Differences from 4/4/9 arithmetic do not establish a label error.')}</p>
      </section>}
    </main>
  );
}
