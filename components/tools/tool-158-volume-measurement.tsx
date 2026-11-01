'use client';

import React, { useState } from 'react';
import { calculateVolumeRatio, VolumeInputSchema } from '@/lib/tools/engines/tool-158-volume-measurement.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const ML_PER_US_FL_OZ = 29.5735295625;

export default function Tool158() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [amountMl, setAmountMl] = useState('');
  const [containerMl, setContainerMl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateVolumeRatio> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imperial = unitSystem === 'imperial';
  const unit = imperial ? 'US fl oz' : 'mL';
  const toDisplay = (ml: string) => ml === '' ? '' : String(Number((Number(ml) / (imperial ? ML_PER_US_FL_OZ : 1)).toFixed(4)));
  const toMl = (display: string) => display === '' ? '' : String(Number(display) * (imperial ? ML_PER_US_FL_OZ : 1));
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const calculate = () => {
    const parsed = VolumeInputSchema.safeParse({
      amount_ml: amountMl === '' ? Number.NaN : Number(amountMl),
      container_ml: containerMl === '' ? Number.NaN : Number(containerMl),
    });
    if (!parsed.success) { setResult(null); setError(tr('أدخل حجماً ضمن الحدود، واجعل حجم الوعاء أكبر من صفر.', 'Enter volumes within the allowed limits and make the container volume greater than zero.')); return; }
    setResult(calculateVolumeRatio(parsed.data));
    setError(null);
  };
  const field = (id: 'amount' | 'container', value: string, update: (v: string) => void, labelAr: string, labelEn: string) => {
    const label = tr(labelAr, labelEn);
    return <label className="block space-y-1 text-sm">{label} ({unit})
      <input aria-label={`${label} (${unit})`} type="number" min="0" max={imperial ? '33.814' : '1000'} step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={toDisplay(value)} onChange={(event) => { update(toMl(event.target.value)); setResult(null); setError(null); }} />
    </label>;
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('قياس نسبة الحجم', 'Volume Measurement Ratio')}</h1>
    <p className="text-sm text-zinc-300">{tr('حساب نسبة حجم عامة بين قيمتين مدخلتين. لا يحدد حجماً آمناً للحقن ولا يقدم تعليمات حقن.', 'Generic ratio between two entered volumes. It does not determine a safe injection volume or provide injection instructions.')}</p>
    {field('amount', amountMl, setAmountMl, 'الحجم المقارن', 'Compared volume')}
    {field('container', containerMl, setContainerMl, 'حجم الوعاء المرجعي', 'Reference container volume')}
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب النسبة', 'Calculate ratio')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة الحساب', 'Calculation result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{tr('النسبة الحسابية', 'Calculated ratio')}: {result.ratio}</h2>
      <p className="text-xs text-zinc-400">{tr('حالة النتيجة', 'Result status')}: {result.status} · {tr('نسبة بلا وحدة', 'Dimensionless ratio')}</p>
      <p className="mt-2 text-sm text-amber-200">{tr('لا تحدد الأداة حجماً آمناً للحقن ولا تقدم تعليمات حقن.', 'This tool does not determine a safe injection volume or provide injection instructions.')}</p>
    </section>}
  </main>;
}
