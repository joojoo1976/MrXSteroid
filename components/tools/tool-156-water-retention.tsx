'use client';

import React, { useState } from 'react';
import { recordWaterObservation, WaterRetentionInputSchema } from '@/lib/tools/engines/tool-156-water-retention.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;
const round = (value: number) => Number(value.toFixed(3));

export default function Tool156() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [waterKg, setWaterKg] = useState('');
  const [referenceKg, setReferenceKg] = useState('');
  const [result, setResult] = useState<ReturnType<typeof recordWaterObservation> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imperial = unitSystem === 'imperial';
  const unit = imperial ? 'lb' : 'kg';
  const toDisplay = (kg: string) => kg === '' ? '' : String(round(Number(kg) / (imperial ? KG_PER_LB : 1)));
  const toKg = (display: string) => display === '' ? '' : String(Number(display) * (imperial ? KG_PER_LB : 1));
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const calculate = () => {
    const parsed = WaterRetentionInputSchema.safeParse({
      water_weight_kg: waterKg === '' ? Number.NaN : Number(waterKg),
      reference_weight_kg: referenceKg === '' ? Number.NaN : Number(referenceKg),
    });
    if (!parsed.success) { setResult(null); setError(tr('أدخل وزناً مرجعياً موجباً ووزناً ملاحظاً ضمن الحدود.', 'Enter a positive reference weight and an observed weight within the allowed limits.')); return; }
    setResult(recordWaterObservation(parsed.data));
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('ملاحظة فرق الوزن', 'Water Weight Observation')}</h1>
    <p className="text-sm text-zinc-300">{tr('حساب وصفي لفرق وزنين يدخلهما المستخدم. لا يشخّص احتباس السوائل أو سببه.', 'Descriptive arithmetic comparing two user-entered weights. It does not diagnose fluid retention or its cause.')}</p>
    <label className="block space-y-1 text-sm">{tr('الوزن الملاحظ', 'Observed weight')} ({unit})
      <input aria-label={`${tr('الوزن الملاحظ', 'Observed weight')} (${unit})`} type="number" min="0" max={imperial ? '1102.31' : '500'} step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={toDisplay(waterKg)} onChange={(event) => { setWaterKg(toKg(event.target.value)); setResult(null); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('الوزن المرجعي', 'Reference weight')} ({unit})
      <input aria-label={`${tr('الوزن المرجعي', 'Reference weight')} (${unit})`} type="number" min="0" max={imperial ? '1102.31' : '500'} step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={toDisplay(referenceKg)} onChange={(event) => { setReferenceKg(toKg(event.target.value)); setResult(null); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب الفرق الوصفي', 'Calculate descriptive difference')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('النتيجة الحسابية', 'Calculated result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{tr('فرق الوزن', 'Weight difference')}: {round(result.change_kg / (imperial ? KG_PER_LB : 1))} {unit}</h2>
      <p className="text-xs text-zinc-400">{tr('حالة النتيجة', 'Result status')}: {result.status} · {tr('حساب وصفي', 'Descriptive arithmetic')}</p>
      <p className="mt-2 text-sm text-amber-200">{tr('حساب تعليمي فقط؛ ليس تشخيصاً أو تقديراً لاحتباس السوائل.', 'Educational arithmetic only; not a diagnosis or estimate of fluid retention.')}</p>
    </section>}
  </main>;
}
