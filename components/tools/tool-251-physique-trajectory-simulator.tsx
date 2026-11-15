'use client';

import { useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import {
  calculatePhysiqueTrajectoryV7,
  inspectPhysiqueTrajectoryV7,
} from '@/lib/tools/engines/tool-251-physique-trajectory.v7';

const KG_PER_LB = 0.45359237;
type Fields = { weight: string; current: string; target: string; rates: string };

function convertNumberText(value: string, factor: number): string {
  if (!value.trim()) return value;
  const number = Number(value);
  return Number.isFinite(number) ? String(Number((number * factor).toPrecision(8))) : value;
}

function convertRateList(value: string, factor: number): string {
  if (!value.trim()) return value;
  return value.split(',').map((token) => {
    const trimmed = token.trim();
    if (!trimmed) return token;
    const number = Number(trimmed);
    return Number.isFinite(number) ? String(Number((number * factor).toPrecision(8))) : token;
  }).join(',');
}

function convertFields(fields: Fields, fromUnit: 'metric' | 'imperial', toUnit: 'metric' | 'imperial'): Fields {
  if (fromUnit === toUnit) return fields;
  const factor = fromUnit === 'metric' ? 1 / KG_PER_LB : KG_PER_LB;
  return {
    ...fields,
    weight: convertNumberText(fields.weight, factor),
    rates: convertRateList(fields.rates, factor),
  };
}

function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

export default function Tool251() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const isAr = locale === 'ar';
  const weightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const kgToDisplay = unitSystem === 'imperial' ? 1 / KG_PER_LB : 1;
  const displayToKg = unitSystem === 'imperial' ? KG_PER_LB : 1;
  const [draft, setDraft] = useState<{ fields: Fields; unit: 'metric' | 'imperial' }>(() => ({
    fields: { weight: '', current: '', target: '', rates: '' },
    unit: unitSystem,
  }));
  const fields = convertFields(draft.fields, draft.unit, unitSystem);
  const [result, setResult] = useState<ReturnType<typeof calculatePhysiqueTrajectoryV7> | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const text = (arabic: string, english: string) => isAr ? arabic : english;
  const update = (key: keyof Fields, value: string) => {
    setDraft((current) => ({
      unit: unitSystem,
      fields: { ...convertFields(current.fields, current.unit, unitSystem), [key]: value },
    }));
    setResult(null);
    setFeedback(null);
  };

  const parseDisplayedNumber = (value: string): number | '' => {
    if (!value.trim()) return '';
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed * displayToKg : Number.NaN;
  };

  const run = () => {
    const rates = fields.rates.trim()
      ? fields.rates.split(',').map((token) => {
          const trimmed = token.trim();
          if (!trimmed) return Number.NaN;
          const parsed = Number(trimmed);
          return Number.isFinite(parsed) ? parsed * displayToKg : Number.NaN;
        })
      : [];
    const draft = inspectPhysiqueTrajectoryV7({
      current_weight_kg: parseDisplayedNumber(fields.weight),
      current_body_fat_pct: fields.current.trim() ? Number(fields.current) : '',
      target_body_fat_pct: fields.target.trim() ? Number(fields.target) : '',
      weekly_rates_kg_per_week: rates,
    });

    if (draft.status === 'PARTIAL') {
      setResult(null);
      setFeedback(text('أكمل الوزن الحالي ونسب الدهون والمعدل الأسبوعي قبل الحساب.', 'Enter current weight, both body-fat values, and at least one weekly rate.'));
      return;
    }
    if (draft.status === 'INVALID_INPUT') {
      const invalidFields = [...new Set(draft.errors.map((error) => error.field))];
      const labels: Record<string, string> = {
        current_weight_kg: text('الوزن الحالي', 'current weight'),
        current_body_fat_pct: text('نسبة الدهون الحالية', 'current body-fat percentage'),
        target_body_fat_pct: text('نسبة الدهون المستهدفة', 'target body-fat percentage'),
        weekly_rates_kg_per_week: text('المعدلات الأسبوعية', 'weekly rates'),
      };
      setResult(null);
      setFeedback(text(
        `تحقق من القيم التالية: ${invalidFields.map((field) => labels[field] ?? field).join('، ')}.`,
        `Check these values: ${invalidFields.map((field) => labels[field] ?? field).join(', ')}.`,
      ));
      return;
    }

    setFeedback(null);
    setResult(calculatePhysiqueTrajectoryV7(draft.input));
  };

  const weightLabel = text('الوزن الحالي', 'Current weight');
  const currentFatLabel = text('نسبة الدهون الحالية', 'Current body-fat percentage');
  const targetFatLabel = text('نسبة الدهون المستهدفة', 'Target body-fat percentage');
  const rateLabel = text(`معدلات التغير الأسبوعية (${weightUnit}، افصل بينها بفواصل)`, `Weekly change rates (${weightUnit}, comma-separated)`);
  const resultDisclaimer = text(
    'CALCULATED: سيناريو حسابي حتمي فقط. المدة ليست توقعاً أو وعداً أو تقييماً صحياً أو توصية.',
    'CALCULATED: deterministic arithmetic scenario only. Duration is not a prediction, promise, health assessment, or recommendation.',
  );

  return (
    <section className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{text('محاكي سيناريوهات المسار الجسدي', 'Physique Scenario Simulator')}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {text('تستخدم الأداة كتلة الجسم الخالية من الدهون الثابتة ومعدلات تختارها أنت لحساب سيناريوهات رياضية.', 'The tool uses a constant lean-mass assumption and rates you choose to calculate arithmetic scenarios.')}
      </p>

      <label className="block text-sm">
        {weightLabel} ({weightUnit})
        <input data-r6-slider="true" aria-label={`${weightLabel} (${weightUnit})`} type="number" min={unitSystem === 'imperial' ? '0.22' : '0.1'} max={unitSystem === 'imperial' ? '1102.31' : '500'} step="any" inputMode="decimal" dir="ltr" value={fields.weight} onChange={(event) => update('weight', event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm">
        {currentFatLabel} (%)
        <input data-r6-slider="true" aria-label={`${currentFatLabel} (%)`} type="number" min="3" max="70" step="any" inputMode="decimal" dir="ltr" value={fields.current} onChange={(event) => update('current', event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm">
        {targetFatLabel} (%)
        <input data-r6-slider="true" aria-label={`${targetFatLabel} (%)`} type="number" min="3" max="70" step="any" inputMode="decimal" dir="ltr" value={fields.target} onChange={(event) => update('target', event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm">
        {rateLabel}
        <input aria-label={rateLabel} type="text" inputMode="decimal" dir="ltr" aria-describedby="tool-251-rates-help" value={fields.rates} onChange={(event) => update('rates', event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <p id="tool-251-rates-help" className="text-xs text-zinc-600 dark:text-zinc-300">
        {text('أدخل معدلاً واحداً إلى ثلاثة معدلات موجبة، بحد أقصى 2 كغ/أسبوع (4.4 رطل/أسبوع). لا تُحذف القيم غير الرقمية تلقائياً.', 'Enter one to three positive rates, up to 2 kg/week (4.4 lb/week). Non-numeric entries are never silently discarded.')}
      </p>

      <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white" onClick={run}>
        {text('احسب السيناريوهات', 'Calculate scenarios')}
      </button>

      {feedback && <p role="alert" className="rounded border border-amber-500 p-3">{feedback}</p>}
      {result && (
        <div role="status" className="space-y-3 rounded border p-3">
          {result.status === 'CALCULATED' ? (
            <>
              <h2 className="font-bold">{text('السيناريوهات المحسوبة', 'Calculated scenarios')}</h2>
              <ul className="list-inside list-disc space-y-1">
                {result.scenarios.map((scenario) => (
                  <li key={scenario.id}>
                    {formatNumber(scenario.weekly_weight_change_kg * kgToDisplay)} {weightUnit}/{text('أسبوع', 'week')} → {formatNumber(scenario.scenario_target_weight_kg * kgToDisplay)} {weightUnit}, {formatNumber(scenario.scenario_duration_weeks)} {text('أسبوع حسابي', 'arithmetic weeks')}
                  </li>
                ))}
              </ul>
              <p>{text(`الافتراضات: كتلة خالية من الدهون ثابتة؛ المعدلات التي أدخلتها ثابتة للحساب فقط؛ نسب الدهون من إدخالك.`, 'Assumptions: constant lean mass; your entered rates are held constant for arithmetic only; body-fat values are user-reported.')}</p>
            </>
          ) : (
            <p>{text('تعذر إنتاج سيناريو قابل للحساب ضمن النطاق المدعوم.', 'A calculable scenario could not be produced within the supported range.')}</p>
          )}
          <p className="text-xs text-zinc-600 dark:text-zinc-300">{resultDisclaimer}</p>
        </div>
      )}
    </section>
  );
}
