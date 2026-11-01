'use client';

import { useState } from 'react';
import { calculateGenericRatio } from '@/lib/tools/engines/tool-241-solvent-ratio.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool241GenericRatio() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const calculate = () => {
    setResult(null);
    setError('');
    if (a.trim() === '' || b.trim() === '') {
      setError(tr('أدخل البسط والمقام.', 'Enter both numerator and denominator.'));
      return;
    }
    try {
      setResult(calculateGenericRatio({ a: Number(a), b: Number(b) }).ratio);
    } catch {
      setError(tr('القيم غير صالحة؛ يجب أن يكون المقام أكبر من صفر.', 'Invalid values; denominator must be greater than zero.'));
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('حاسبة نسبة رياضية عامة', 'Generic Mathematical Ratio Calculator')}</h1>
      <p className="mt-2 text-sm text-zinc-400">{tr('قسمة عددين مجردين فقط؛ لا تُفسّر المدخلات كمذيبات أو مواد كيميائية.', 'Divides two abstract numbers; inputs are not interpreted as solvents or chemicals.')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">{tr('البسط a', 'Numerator a')}<input aria-label={tr('البسط a', 'Numerator a')} type="number" min="0" step="any" className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={a} onChange={(event) => setA(event.target.value)} /></label>
        <label className="grid gap-1 text-sm">{tr('المقام b', 'Denominator b')}<input aria-label={tr('المقام b', 'Denominator b')} type="number" min="0.000001" step="any" className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={b} onChange={(event) => setB(event.target.value)} /></label>
      </div>
      <button type="button" className="mt-4 rounded bg-blue-600 px-4 py-2 font-bold text-white" onClick={calculate}>{tr('احسب النسبة a ÷ b', 'Calculate ratio a ÷ b')}</button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {result !== null && <p role="status" className="mt-3 rounded border border-emerald-700 p-3 font-mono">a / b = {result}</p>}
      <p className="mt-4 text-xs text-zinc-500">{tr('لا توجد إرشادات نسب للمذيبات أو الخلط أو التركيز أو الجرعات أو التحضير.', 'No solvent, mixing, concentration, dose, or preparation guidance.')}</p>
    </section>
  );
}
