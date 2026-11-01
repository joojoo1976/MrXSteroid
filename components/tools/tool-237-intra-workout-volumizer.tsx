'use client';

import { useState } from 'react';
import { calculateIntraWorkoutLabelTotals } from '@/lib/tools/engines/tool-237-intra-workout.v7';
import { IntraWorkoutLabelInputV7Schema } from '@/lib/tools/schemas/tool-237-intra-workout-volumizer.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const ML_PER_US_FL_OZ = 29.5735295625;
const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
type Draft = Record<'productName' | 'sourceReference' | 'servingVolumeMl' | 'servingsConsumed' | 'caloriesPerServing' | 'proteinGramsPerServing' | 'carbohydrateGramsPerServing' | 'fatGramsPerServing', string>;
const emptyDraft: Draft = { productName: '', sourceReference: '', servingVolumeMl: '', servingsConsumed: '', caloriesPerServing: '', proteinGramsPerServing: '', carbohydrateGramsPerServing: '', fatGramsPerServing: '' };

export default function Tool237IntraWorkoutVolumizer() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [result, setResult] = useState<ReturnType<typeof calculateIntraWorkoutLabelTotals> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const volumeUnit = unitSystem === 'metric' ? 'mL' : 'US fl oz';
  const volumePerServing = draft.servingVolumeMl === '' ? '' : String(Number((Number(draft.servingVolumeMl) / (unitSystem === 'metric' ? 1 : ML_PER_US_FL_OZ)).toFixed(4)));
  const update = (key: keyof Draft, value: string) => { setDraft((current) => ({ ...current, [key]: value })); setResult(null); setError(null); };

  const calculate = () => {
    const number = (value: string) => value.trim() === '' ? undefined : Number(value);
    const displayedVolume = number(volumePerServing);
    const candidate = {
      productName: draft.productName,
      sourceReference: draft.sourceReference,
      servingVolumeMl: displayedVolume === undefined ? undefined : displayedVolume * (unitSystem === 'metric' ? 1 : ML_PER_US_FL_OZ),
      servingsConsumed: number(draft.servingsConsumed),
      caloriesPerServing: number(draft.caloriesPerServing),
      proteinGramsPerServing: number(draft.proteinGramsPerServing),
      carbohydrateGramsPerServing: number(draft.carbohydrateGramsPerServing),
      fatGramsPerServing: number(draft.fatGramsPerServing),
    };
    const parsed = IntraWorkoutLabelInputV7Schema.safeParse(candidate);
    if (!parsed.success) {
      setError(tr('أكمل بيانات الملصق والحصص ومصدر المنتج بقيم صحيحة.', 'Complete the product-label values, servings, and source using valid values.'));
      setResult(null);
      return;
    }
    setResult(calculateIntraWorkoutLabelTotals(parsed.data));
    setError(null);
  };

  const textField = (key: 'productName' | 'sourceReference', label: string) => <label className="block text-xs font-semibold text-zinc-300">{label}<input className={inputClass} value={draft[key]} maxLength={500} onChange={(event) => update(key, event.target.value)} /></label>;
  const numberField = (key: Exclude<keyof Draft, 'productName' | 'sourceReference'>, label: string, testId = key) => <label className="block text-xs font-semibold text-zinc-300">{label}<input className={inputClass} data-testid={`intra-${testId}`} type="number" min="0" step="any" value={key === 'servingVolumeMl' ? volumePerServing : draft[key]} onChange={(event) => key === 'servingVolumeMl' ? update(key, event.target.value === '' ? '' : String(Number(event.target.value) * (unitSystem === 'metric' ? 1 : ML_PER_US_FL_OZ))) : update(key, event.target.value)} /></label>;

  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
    <header><h1 className="text-2xl font-black">{tr('حاسبة ملصق منتج أثناء التدريب', 'Intra-Workout Product Label Calculator')}</h1><p className="mt-2 text-sm text-zinc-300">{tr('تجمع القيم التي تدخلها من ملصق المنتج وعدد الحصص الذي تسجله. لا تحدد مشروباً مثالياً أو احتياجاً غذائياً.', 'Totals values you enter from a product label and the servings you record. It does not determine an ideal drink or nutrition requirement.')}</p></header>
    <section className="grid gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 sm:grid-cols-2">
      {textField('productName', tr('اسم المنتج', 'Product name'))}
      {textField('sourceReference', tr('مصدر القيم / مرجع الملصق', 'Value source / label reference'))}
      {numberField('servingVolumeMl', tr(`حجم الحصة (${volumeUnit})`, `Serving volume (${volumeUnit})`))}
      {numberField('servingsConsumed', tr('عدد الحصص المسجلة', 'Servings recorded'))}
      {numberField('caloriesPerServing', tr('السعرات لكل حصة', 'Calories per serving'))}
      {numberField('carbohydrateGramsPerServing', tr('الكربوهيدرات لكل حصة (جم)', 'Carbohydrate per serving (g)'))}
      {numberField('proteinGramsPerServing', tr('البروتين لكل حصة (جم)', 'Protein per serving (g)'))}
      {numberField('fatGramsPerServing', tr('الدهون لكل حصة (جم)', 'Fat per serving (g)'))}
    </section>
    <div className="flex gap-2"><button type="button" onClick={calculate} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black">{tr('احسب المجاميع', 'Calculate totals')}</button><button type="button" onClick={() => { setDraft(emptyDraft); setResult(null); setError(null); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm">{tr('مسح', 'Clear')}</button></div>
    {error && <p role="alert" className="rounded-lg border border-amber-700 p-3 text-sm text-amber-200">{error}</p>}
    {result && <section role="status" className="space-y-2 rounded-xl border border-lime-700 bg-zinc-900 p-4"><h2 className="font-bold">{tr('إجمالي الملصق للحصص المسجلة', 'Label totals for recorded servings')}</h2><p>{tr('الحجم', 'Volume')}: {Number((result.calculatedTotals.volumeMl / (unitSystem === 'metric' ? 1 : ML_PER_US_FL_OZ)).toFixed(2))} {volumeUnit}</p><p>{tr('السعرات', 'Calories')}: {result.calculatedTotals.calories} kcal</p><p>{tr('الكربوهيدرات', 'Carbohydrate')}: {result.calculatedTotals.carbohydrateGrams} g · {tr('البروتين', 'Protein')}: {result.calculatedTotals.proteinGrams} g · {tr('الدهون', 'Fat')}: {result.calculatedTotals.fatGrams} g</p><p className="text-xs text-zinc-400">{tr('حساب من بيانات الملصق فقط؛ ليس توصية تغذية أو ترطيب.', 'Arithmetic from label data only; not a nutrition or hydration recommendation.')}</p></section>}
  </main>;
}
