'use client';

import React, { useState } from 'react';
import { convertMass, ConversionInputSchema } from '@/lib/tools/engines/tool-167-ester-conversion.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool167() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [value, setValue] = useState('');
  const [factor, setFactor] = useState('');
  const [unit, setUnit] = useState('');
  const [result, setResult] = useState<ReturnType<typeof convertMass> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const calculate = () => {
    const parsed = ConversionInputSchema.safeParse({ value: value === '' ? Number.NaN : Number(value), factor: factor === '' ? Number.NaN : Number(factor), unit });
    if (!parsed.success) { setResult(null); setError(tr('أدخل قيمة وعاملاً غير سالبين ضمن الحدود، وحدد وحدة الناتج.', 'Enter a non-negative value and factor within range, and specify the output unit.')); return; }
    setResult(convertMass(parsed.data));
    setError(null);
  };
  const fields = [
    { label: tr('القيمة المدخلة', 'Input value'), value, set: setValue, max: '1000000' },
    { label: tr('عامل التحويل الذي أدخلته', 'User-entered conversion factor'), value: factor, set: setFactor, max: '1000' },
  ];
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('حساب عامل تحويل عام', 'Generic Conversion Factor Arithmetic')}</h1>
    <p className="text-sm text-zinc-300">{tr('تضرب القيمة في العامل الذي تدخله. لا توفر الأداة عوامل تحويل معتمدة ولا توصية هرمونية أو جرعة.', 'Multiplies the value by the factor you enter. The tool does not supply validated conversion factors or hormone/dose recommendations.')}</p>
    {fields.map((field) => <label key={field.label} className="block space-y-1 text-sm">{field.label}
      <input aria-label={field.label} type="number" min="0" max={field.max} step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={field.value} onChange={(event) => { field.set(event.target.value); setResult(null); setError(null); }} />
    </label>)}
    <label className="block space-y-1 text-sm">{tr('وحدة الناتج كما تحددها', 'Output unit as specified by you')}
      <input aria-label={tr('وحدة الناتج كما تحددها', 'Output unit as specified by you')} maxLength={30} className="w-full rounded border bg-zinc-950 p-2 text-white" value={unit} onChange={(event) => { setUnit(event.target.value); setResult(null); setError(null); }} />
    </label>
    <p className="text-xs text-zinc-400">{tr('المعادلة: القيمة × العامل. لم يتم التحقق من أبعاد الوحدات أو مصدر العامل.', 'Formula: value × factor. Unit dimensions and factor source are not verified.')}</p>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب الناتج', 'Calculate result')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة الحساب', 'Calculation result')} className="rounded border border-zinc-700 p-4"><h2 className="font-bold">{tr('الناتج الحسابي', 'Arithmetic result')}: {result.value} {result.unit}</h2><p className="text-xs text-zinc-400">{result.status} · {tr('حساب عامل عام', 'Generic factor arithmetic')}</p><p className="text-sm text-amber-200">{tr('لا يقدم توصية هرمونية أو جرعة.', 'No hormone or dose recommendation is provided.')}</p></section>}
  </main>;
}
