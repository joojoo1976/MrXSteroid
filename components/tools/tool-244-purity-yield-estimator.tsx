'use client';

import { useState } from 'react';
import { calculateGenericYield } from '@/lib/tools/engines/tool-244-purity-yield.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool244GenericRatio() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateGenericYield> | null>(null);
  const [error, setError] = useState('');
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const calculate = () => {
    setResult(null);
    setError('');
    if (input.trim() === '' || output.trim() === '') {
      setError(tr('أدخل قيمتي البداية والنهاية.', 'Enter both input and output values.'));
      return;
    }
    try {
      setResult(calculateGenericYield({ input: Number(input), output: Number(output) }));
    } catch {
      setError(tr('القيم غير صالحة؛ يجب أن تكون قيمة البداية أكبر من صفر.', 'Invalid values; input must be greater than zero.'));
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('حاسبة نسبة رياضية عامة', 'Generic Mathematical Ratio Calculator')}</h1>
      <p className="mt-2 text-sm text-zinc-400">{tr('احسب الناتج ÷ المدخل. افترض تطابق وحدتي القيمتين؛ لا يفسّر الناتج كنقاء أو مردود كيميائي.', 'Calculates output ÷ input. The two values are assumed to use matching units; the result is not chemical purity or yield.')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">{tr('قيمة المدخل', 'Input value')}<input aria-label={tr('قيمة المدخل', 'Input value')} type="number" min="0.000001" step="any" className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={input} onChange={(event) => setInput(event.target.value)} /></label>
        <label className="grid gap-1 text-sm">{tr('قيمة الناتج', 'Output value')}<input aria-label={tr('قيمة الناتج', 'Output value')} type="number" min="0" step="any" className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={output} onChange={(event) => setOutput(event.target.value)} /></label>
      </div>
      <button type="button" className="mt-4 rounded bg-blue-600 px-4 py-2 font-bold text-white" onClick={calculate}>{tr('احسب الناتج ÷ المدخل', 'Calculate output ÷ input')}</button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {result && <div role="status" className="mt-3 rounded border border-emerald-700 p-3"><p className="font-mono">output / input = {result.ratio}</p><p>{tr('النسبة الحسابية', 'Arithmetic percentage')}: {result.ratioPercent}%</p></div>}
      <p className="mt-4 text-xs text-zinc-500">{tr('لا يحدد الأداة وحدات القيم ولا تقدم حكماً على النقاء أو المردود أو التحضير.', 'This tool does not determine units and makes no purity, yield, or preparation claim.')}</p>
    </section>
  );
}
