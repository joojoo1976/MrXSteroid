'use client';

import React, { useState } from 'react';
import { calculateHalfLifeScenario, HalfLifeStackInputSchema } from '@/lib/tools/engines/tool-159-half-life-stacker.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

export default function Tool159() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [halfLife, setHalfLife] = useState('');
  const [interval, setInterval] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateHalfLifeScenario> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const calculate = () => {
    const parsed = HalfLifeStackInputSchema.safeParse({
      half_lives_days: [halfLife === '' ? Number.NaN : Number(halfLife)],
      interval_days: interval === '' ? Number.NaN : Number(interval),
    });
    if (!parsed.success) { setResult(null); setError(tr('أدخل نصف عمر وفاصلاً موجبين لا يتجاوز كل منهما 365 يوماً.', 'Enter positive half-life and interval values, each no greater than 365 days.')); return; }
    setResult(calculateHalfLifeScenario(parsed.data));
    setError(null);
  };
  const field = (labelAr: string, labelEn: string, value: string, setValue: (value: string) => void) => {
    const label = tr(labelAr, labelEn);
    return <label className="block space-y-1 text-sm">{label} ({tr('أيام', 'days')})
      <input aria-label={`${label} (${tr('أيام', 'days')})`} type="number" min="0" max="365" step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={value} onChange={(event) => { setValue(event.target.value); setResult(null); setError(null); }} />
    </label>;
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سيناريو تلاشي نصف العمر', 'Half-Life Decay Scenario')}</h1>
    <p className="text-sm text-zinc-300">{tr('يعرض عامل التلاشي الرياضي خلال فاصل زمني مدخل، دون جدول حقن أو تفسير سريري.', 'Shows a mathematical decay factor over an entered interval, without an injection schedule or clinical interpretation.')}</p>
    {field('نصف العمر', 'Half-life', halfLife, setHalfLife)}
    {field('الفاصل الزمني', 'Elapsed interval', interval, setInterval)}
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب عامل التلاشي', 'Calculate decay factor')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة السيناريو', 'Scenario result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{tr('عامل التلاشي الحسابي', 'Calculated decay factor')}: {result.decay_factors[0]}</h2>
      <p className="text-xs text-zinc-400">{tr('حالة النتيجة', 'Result status')}: {result.status} · {tr('سيناريو رياضي', 'Mathematical scenario')}</p>
      <p className="mt-2 text-sm text-amber-200">{tr('سيناريو رياضي فقط؛ ليس جدول حقن أو توصية علاجية.', 'Mathematical scenario only; not an injection schedule or treatment recommendation.')}</p>
    </section>}
  </main>;
}
