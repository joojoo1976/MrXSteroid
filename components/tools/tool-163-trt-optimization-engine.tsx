'use client';

import React, { useState } from 'react';
import { compareTrtValues, TrtInputSchema } from '@/lib/tools/engines/tool-163-trt-optimization.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool163() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [current, setCurrent] = useState('');
  const [comparison, setComparison] = useState('');
  const [unit, setUnit] = useState('');
  const [result, setResult] = useState<ReturnType<typeof compareTrtValues> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const calculate = () => {
    const parsed = TrtInputSchema.safeParse({
      current_value: current === '' ? Number.NaN : Number(current),
      target_value: comparison === '' ? Number.NaN : Number(comparison),
      unit,
    });
    if (!parsed.success) { setResult(null); setError(tr('أدخل قيمتين غير سالبتين ضمن الحدود، واكتب الوحدة نفسها لكليهما.', 'Enter two non-negative values within range and specify their shared unit.')); return; }
    setResult(compareTrtValues(parsed.data));
    setError(null);
  };
  const fields = [
    { key: 'current', value: current, set: setCurrent, label: tr('القيمة الحالية', 'Current value'), max: '100000' },
    { key: 'comparison', value: comparison, set: setComparison, label: tr('قيمة المقارنة', 'Comparison value'), max: '100000' },
  ];
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('مقارنة قيم حسابية', 'Arithmetic Value Comparison')}</h1>
    <p className="text-sm text-zinc-300">{tr('تحسب الفرق بين قيمتين بوحدة واحدة يحددها المستخدم. لا تحسن TRT أو تقترح جرعات أو توصيات طبية.', 'Calculates the difference between two values in one user-specified unit. It does not optimize TRT or provide doses or medical recommendations.')}</p>
    {fields.map((field) => <label key={field.key} className="block space-y-1 text-sm">{field.label}
      <input aria-label={field.label} type="number" min="0" max={field.max} step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={field.value} onChange={(event) => { field.set(event.target.value); setResult(null); setError(null); }} />
    </label>)}
    <label className="block space-y-1 text-sm">{tr('الوحدة نفسها للقيمتين', 'Same unit for both values')}
      <input aria-label={tr('الوحدة نفسها للقيمتين', 'Same unit for both values')} maxLength={30} className="w-full rounded border bg-zinc-950 p-2 text-white" value={unit} onChange={(event) => { setUnit(event.target.value); setResult(null); setError(null); }} />
    </label>
    <p className="text-xs text-zinc-400">{tr('الوحدة نص يدخله المستخدم ولا تتحقق الأداة من توافق القيم معها أو تحوّل الوحدات.', 'The unit is user-entered text; the tool does not verify its compatibility or convert units.')}</p>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب الفرق الحسابي', 'Calculate arithmetic difference')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة المقارنة', 'Comparison result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{tr('الفرق (قيمة المقارنة ناقص القيمة الحالية)', 'Difference (comparison value minus current value)')}: {result.difference} {result.unit}</h2>
      <p className="text-xs text-zinc-400">{tr('حالة النتيجة', 'Result status')}: {result.status} · {tr('حساب مقارنة فقط', 'Comparison arithmetic only')}</p>
      <p className="text-sm text-amber-200">{tr('لا يقدم تحسين TRT أو توصية طبية.', 'No TRT optimization or medical recommendation is provided.')}</p>
    </section>}
  </main>;
}
