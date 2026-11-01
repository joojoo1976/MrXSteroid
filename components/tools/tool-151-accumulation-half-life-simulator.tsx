'use client';

import React, { useState } from 'react';
import {
  AccumulationInputSchema,
  calculateAccumulationScenario,
  type AccumulationInput,
  type AccumulationResult,
} from '@/lib/tools/engines/tool-151-accumulation-half-life-simulator.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type InputKey = keyof AccumulationInput;

const FIELD_ORDER: InputKey[] = ['initial_amount', 'half_life_days', 'interval_days', 'simulation_days'];
const LABELS: Record<InputKey, { en: string; ar: string; min: string; max: string; step: string }> = {
  initial_amount: { en: 'Initial amount (unitless)', ar: 'الكمية الابتدائية (بلا وحدة)', min: '0', max: '100000', step: 'any' },
  half_life_days: { en: 'Half-life (days)', ar: 'نصف العمر (أيام)', min: '0.000001', max: '365', step: 'any' },
  interval_days: { en: 'Repeated input interval (days)', ar: 'الفاصل بين الإدخالات المتكررة (أيام)', min: '0.000001', max: '365', step: 'any' },
  simulation_days: { en: 'Simulation duration (days)', ar: 'مدة المحاكاة (أيام)', min: '1', max: '3650', step: '1' },
};

export default function Tool151Accumulation() {
  const { locale } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [values, setValues] = useState<Record<InputKey, string>>({
    initial_amount: '100',
    half_life_days: '7',
    interval_days: '7',
    simulation_days: '28',
  });
  const [result, setResult] = useState<AccumulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateValue = (key: InputKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError(null);
  };

  const run = () => {
    const parsed = AccumulationInputSchema.safeParse(Object.fromEntries(
      FIELD_ORDER.map((key) => [key, values[key].trim() === '' ? Number.NaN : Number(values[key])]),
    ));
    if (!parsed.success) {
      setResult(null);
      setError(ar
        ? 'تحقق من إدخال قيم رقمية ضمن الحدود الموضحة لكل حقل.'
        : 'Enter numeric values within the limits shown for each field.');
      return;
    }

    try {
      setResult(calculateAccumulationScenario(parsed.data));
      setError(null);
    } catch {
      setResult(null);
      setError(ar ? 'تعذر حساب هذا السيناريو بالمدخلات الحالية.' : 'This scenario could not be calculated from the current inputs.');
    }
  };

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={ar ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{ar ? 'محاكي تراكم نصف العمر' : 'Accumulation Half-Life Simulator'}</h1>
      <p className="text-sm text-zinc-300">
        {ar
          ? 'سيناريو رياضي تعليمي فقط؛ لا يمثل جرعة أو توصية علاجية. الكمية بلا وحدة، والزمن بالأيام.'
          : 'Mathematical educational scenario only; not a dose or treatment recommendation. Amount is unitless and time is in days.'}
      </p>

      <div className="space-y-3">
        {FIELD_ORDER.map((key) => {
          const label = ar ? LABELS[key].ar : LABELS[key].en;
          return (
            <label key={key} className="block space-y-1 text-sm text-zinc-200">
              <span>{label}</span>
              <input
                aria-label={label}
                className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white"
                type="number"
                inputMode="decimal"
                min={LABELS[key].min}
                max={LABELS[key].max}
                step={LABELS[key].step}
                value={values[key]}
                onChange={(event) => updateValue(key, event.target.value)}
              />
              <span className="block text-xs text-zinc-500">
                {ar ? `النطاق: ${LABELS[key].min} إلى ${LABELS[key].max}` : `Allowed range: ${LABELS[key].min} to ${LABELS[key].max}`}
              </span>
            </label>
          );
        })}
      </div>

      <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={run}>
        {ar ? 'احسب السيناريو' : 'Calculate scenario'}
      </button>

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

      {result && (
        <section aria-live="polite" aria-label={ar ? 'نتيجة السيناريو' : 'Scenario result'} className="space-y-3 rounded-lg border border-zinc-700 p-4">
          <h2 className="text-lg font-bold">{ar ? 'نتيجة حسابية' : 'Calculated scenario'}</h2>
          <p className="text-sm text-amber-200">
            {ar
              ? 'سيناريو رياضي لنصف العمر فقط؛ ليس جرعة أو دورة أو انتقالاً أو توصية علاجية.'
              : result.disclaimer}
          </p>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-zinc-400">{ar ? 'الذروة الحسابية (بلا وحدة)' : 'Calculated peak (unitless)'}</dt><dd>{result.peak_amount}</dd></div>
            <div><dt className="text-zinc-400">{ar ? 'المتبقي عند نهاية المحاكاة (بلا وحدة)' : 'Remaining at simulation end (unitless)'}</dt><dd>{result.terminal_amount}</dd></div>
            <div><dt className="text-zinc-400">{ar ? 'عامل التراكم الرياضي' : 'Mathematical accumulation factor'}</dt><dd>{result.accumulation_factor}</dd></div>
            <div><dt className="text-zinc-400">{ar ? 'تصنيف النتيجة' : 'Result classification'}</dt><dd>{result.status} · {result.resultType}</dd></div>
          </dl>
          <div>
            <h3 className="text-sm font-semibold">{ar ? 'الافتراضات' : 'Assumptions'}</h3>
            <ul className="list-inside list-disc text-xs text-zinc-300">
              {(ar
                ? ['نصف عمر ثابت.', 'استخدام كمية متكررة متساوية كسيناريو رياضي فقط.', 'لا يتضمن اختلافاً بيولوجياً أو تفسيراً سريرياً.']
                : result.assumptions
              ).map((assumption) => <li key={assumption}>{assumption}</li>)}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
