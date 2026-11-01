'use client';

import { useState } from 'react';
import { calculateMeasuredDensity } from '@/lib/tools/engines/tool-240-density.v7';
import { DensityMeasurementInputV7Schema } from '@/lib/tools/schemas/tool-240-raw-powder-density-engine.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const GRAMS_PER_LB = 453.59237;
const ML_PER_US_FL_OZ = 29.5735295625;
const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool240MeasuredDensity() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [massGrams, setMassGrams] = useState('');
  const [volumeMl, setVolumeMl] = useState('');
  const [method, setMethod] = useState<'recorded_measurement' | 'other'>('recorded_measurement');
  const [sourceReference, setSourceReference] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateMeasuredDensity> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const massUnit = unitSystem === 'metric' ? 'g' : 'lb';
  const volumeUnit = unitSystem === 'metric' ? 'mL' : 'US fl oz';
  const massValue = massGrams === '' ? '' : String(Number((Number(massGrams) / (unitSystem === 'metric' ? 1 : GRAMS_PER_LB)).toPrecision(8)));
  const volumeValue = volumeMl === '' ? '' : String(Number((Number(volumeMl) / (unitSystem === 'metric' ? 1 : ML_PER_US_FL_OZ)).toPrecision(8)));
  const resetResult = () => { setResult(null); setError(null); };

  const calculate = () => {
    const parsed = DensityMeasurementInputV7Schema.safeParse({
      massGrams: massGrams === '' ? undefined : Number(massGrams),
      measuredVolumeMl: volumeMl === '' ? undefined : Number(volumeMl),
      measurementMethod: method,
      sourceReference,
    });
    if (!parsed.success) {
      setError(tr('أدخل كتلة وحجماً مقاسين ومصدراً للقياس بقيم موجبة.', 'Enter positive measured mass and volume values with a measurement reference.'));
      setResult(null);
      return;
    }
    setResult(calculateMeasuredDensity(parsed.data));
    setError(null);
  };

  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
    <header><h1 className="text-2xl font-black">{tr('حاسبة كثافة عينة مقاسة', 'Measured Sample Density Calculator')}</h1><p className="mt-2 text-sm text-zinc-300">{tr('تحسب الكثافة لعينة من كتلتها وحجمها المقاسين فقط: ρ = m ÷ V. لا توجد قاعدة كثافات أو حسابات تحضير.', 'Calculates density for a sample from its measured mass and volume only: ρ = m ÷ V. No density database or preparation calculations are included.')}</p></header>
    <section className="grid gap-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-zinc-200">{tr('الكتلة المقاسة', 'Measured mass')} ({massUnit})<input aria-label={tr('الكتلة المقاسة', 'Measured mass')} className={inputClass} type="number" min="0" step="any" value={massValue} onChange={(event) => { setMassGrams(event.target.value === '' ? '' : String(Number(event.target.value) * (unitSystem === 'metric' ? 1 : GRAMS_PER_LB))); resetResult(); }} /></label>
      <label className="block text-sm font-semibold text-zinc-200">{tr('الحجم المقاس', 'Measured volume')} ({volumeUnit})<input aria-label={tr('الحجم المقاس', 'Measured volume')} className={inputClass} type="number" min="0" step="any" value={volumeValue} onChange={(event) => { setVolumeMl(event.target.value === '' ? '' : String(Number(event.target.value) * (unitSystem === 'metric' ? 1 : ML_PER_US_FL_OZ))); resetResult(); }} /></label>
      <label className="block text-sm font-semibold text-zinc-200">{tr('طريقة التسجيل', 'Measurement record')}<select className={inputClass} value={method} onChange={(event) => { setMethod(event.target.value as typeof method); resetResult(); }}><option value="recorded_measurement">{tr('قياس مسجل من المستخدم', 'User-recorded measurement')}</option><option value="other">{tr('طريقة أخرى مدخلة من المستخدم', 'Other user-entered method')}</option></select></label>
      <label className="block text-sm font-semibold text-zinc-200">{tr('مرجع القياس', 'Measurement reference')}<input className={inputClass} maxLength={500} value={sourceReference} onChange={(event) => { setSourceReference(event.target.value); resetResult(); }} /></label>
    </section>
    <div className="flex gap-2"><button type="button" onClick={calculate} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black">{tr('احسب الكثافة', 'Calculate density')}</button><button type="button" onClick={() => { setMassGrams(''); setVolumeMl(''); setSourceReference(''); setMethod('recorded_measurement'); setResult(null); setError(null); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm">{tr('مسح', 'Clear')}</button></div>
    {error && <p role="alert" className="rounded-lg border border-amber-700 p-3 text-sm text-amber-200">{error}</p>}
    {result && <section role="status" className="space-y-2 rounded-xl border border-lime-700 bg-zinc-900 p-4"><h2 className="font-bold">{tr('الناتج الحسابي', 'Calculated result')}</h2><p className="text-xl">{result.density.value} g/mL</p><p className="text-xs text-zinc-400">{tr('القيمة تخص القياسات التي أدخلتها لهذه العينة فقط؛ لا تحدد النقاء أو الجرعة أو التحضير.', 'This value applies only to the measurements entered for this sample; it does not determine purity, dose, or preparation.')}</p></section>}
  </main>;
}
