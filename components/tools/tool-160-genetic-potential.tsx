'use client';

import React, { useState } from 'react';
import { calculatePotentialScenario, GeneticPotentialInputSchema } from '@/lib/tools/engines/tool-160-genetic-potential.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const INCHES_PER_CM = 1 / 2.54;
type MeasureKey = 'height_cm' | 'wrist_cm' | 'ankle_cm';
const FIELDS: Record<MeasureKey, { ar: string; en: string; min: number; max: number; coefficient: number }> = {
  height_cm: { ar: 'الطول', en: 'Height', min: 100, max: 250, coefficient: 0.1 },
  wrist_cm: { ar: 'محيط الرسغ', en: 'Wrist circumference', min: 5, max: 30, coefficient: 0.2 },
  ankle_cm: { ar: 'محيط الكاحل', en: 'Ankle circumference', min: 10, max: 40, coefficient: 0.1 },
};

export default function Tool160() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const imperial = unitSystem === 'imperial';
  const [measurements, setMeasurements] = useState<Record<MeasureKey, string>>({ height_cm: '', wrist_cm: '', ankle_cm: '' });
  const [result, setResult] = useState<ReturnType<typeof calculatePotentialScenario> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unit = imperial ? 'in' : 'cm';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const toDisplay = (cm: string) => cm === '' ? '' : String(Number((Number(cm) * (imperial ? INCHES_PER_CM : 1)).toFixed(3)));
  const toCm = (display: string) => display === '' ? '' : String(Number(display) / (imperial ? INCHES_PER_CM : 1));
  const calculate = () => {
    const candidate = Object.fromEntries(Object.entries(measurements).map(([key, value]) => [key, value === '' ? Number.NaN : Number(value)]));
    const parsed = GeneticPotentialInputSchema.safeParse(candidate);
    if (!parsed.success) { setResult(null); setError(tr('أدخل القياسات الثلاثة ضمن الحدود الموضحة.', 'Enter all three measurements within the displayed limits.')); return; }
    setResult(calculatePotentialScenario(parsed.data));
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('مؤشر قياسات توضيحي', 'Illustrative Measurement Index')}</h1>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('معادلة توضيحية غير معتمدة علمياً؛ لا تتنبأ بحد جيني أو إمكانات عضلية أو نتيجة صحية.', 'Illustrative, unvalidated arithmetic; it does not predict genetic limits, muscular potential, or health outcomes.')}</p>
    {(Object.keys(FIELDS) as MeasureKey[]).map((key) => {
      const field = FIELDS[key];
      const label = ar ? field.ar : field.en;
      const min = imperial ? Number((field.min * INCHES_PER_CM).toFixed(2)) : field.min;
      const max = imperial ? Number((field.max * INCHES_PER_CM).toFixed(2)) : field.max;
      return <label key={key} className="block space-y-1 text-sm">{label} ({unit})
        <input aria-label={`${label} (${unit})`} type="number" min={min} max={max} step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={toDisplay(measurements[key])} onChange={(event) => { setMeasurements((old) => ({ ...old, [key]: toCm(event.target.value) })); setResult(null); setError(null); }} />
        <span className="block text-xs text-zinc-500">{tr('النطاق', 'Range')}: {min}–{max} {unit}</span>
      </label>;
    })}
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب المؤشر التوضيحي', 'Calculate illustrative index')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('النتيجة التوضيحية', 'Illustrative result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{tr('المؤشر الحسابي التوضيحي', 'Illustrative arithmetic index')}: {result.index}</h2>
      <p className="text-xs text-zinc-400">{tr('حالة النتيجة', 'Result status')}: {result.status} · {tr('ليس تنبؤاً', 'Not a prediction')}</p>
      <p>{tr('المعادلة المستخدمة: 0.1 × الطول + 0.2 × محيط الرسغ + 0.1 × محيط الكاحل، بعد التحويل إلى السنتيمتر.', 'Formula: 0.1 × height + 0.2 × wrist circumference + 0.1 × ankle circumference, after conversion to centimeters.')}</p>
      <p className="text-sm text-amber-200">{tr('حساب توضيحي فقط؛ لا يتنبأ بحد جيني أو نتيجة صحية.', 'Illustrative arithmetic only; it does not predict genetic limits or health outcomes.')}</p>
    </section>}
  </main>;
}
