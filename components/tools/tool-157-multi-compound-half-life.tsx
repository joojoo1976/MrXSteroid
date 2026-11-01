'use client';

import React, { useState } from 'react';
import { calculateMultiHalfLife, MultiHalfLifeInputSchema } from '@/lib/tools/engines/tool-157-multi-compound-half-life.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool157() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [name, setName] = useState('');
  const [halfLife, setHalfLife] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateMultiHalfLife> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const calculate = () => {
    const parsed = MultiHalfLifeInputSchema.safeParse({ compounds: [{ name, half_life_days: halfLife === '' ? Number.NaN : Number(halfLife) }] });
    if (!parsed.success) { setResult(null); setError(tr('أدخل اسماً ونصف عمر موجباً لا يتجاوز 365 يوماً.', 'Enter a name and a positive half-life no greater than 365 days.')); return; }
    setResult(calculateMultiHalfLife(parsed.data));
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('حسابات مستقلة لأعمار النصف', 'Independent Half-Life Entries')}</h1>
    <p className="text-sm text-zinc-300">{tr('لكل إدخال على حدة: بعد مرور نصف عمر واحد يتبقى رياضياً 50٪. لا يوجد جمع أو بناء ستاك أو جرعات أو توقيت.', 'For each entry independently: after one half-life, 50% remains mathematically. No summation, stack design, dosing, or timing is performed.')}</p>
    <label className="block space-y-1 text-sm">{tr('اسم وصفي', 'Descriptive name')}
      <input aria-label={tr('اسم وصفي', 'Descriptive name')} maxLength={80} className="w-full rounded border bg-zinc-950 p-2 text-white" value={name} onChange={(event) => { setName(event.target.value); setResult(null); setError(null); }} />
    </label>
    <label className="block space-y-1 text-sm">{tr('نصف العمر', 'Half-life')} ({tr('أيام', 'days')})
      <input aria-label={`${tr('نصف العمر', 'Half-life')} (${tr('أيام', 'days')})`} type="number" min="0" max="365" step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={halfLife} onChange={(event) => { setHalfLife(event.target.value); setResult(null); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب الحالة المستقلة', 'Calculate independent entry')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة الحساب', 'Calculation result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{result.compounds[0].name}</h2>
      <p>{tr('بعد نصف عمر واحد: المتبقي رياضياً', 'After one half-life: mathematical remainder')}: {result.compounds[0].remaining_after_one_half_life * 100}%</p>
      <p className="text-xs text-zinc-400">{tr('حالة النتيجة', 'Result status')}: {result.status} · {tr('سيناريو رياضي', 'Mathematical scenario')}</p>
      <p className="mt-2 text-sm text-amber-200">{tr('حساب نصف العمر فقط؛ ليس دورة أو جرعة أو جدول حقن.', 'Half-life arithmetic only; not a cycle, dose, or injection schedule.')}</p>
    </section>}
  </main>;
}
