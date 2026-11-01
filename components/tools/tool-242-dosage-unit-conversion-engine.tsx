'use client';

import { useMemo, useState } from 'react';
import {
  type AnalysisUnitV7,
} from '@/lib/tools/schemas/tool-242-dosage-unit-conversion-engine.v7';
import { convertAnalysisUnit } from '@/lib/tools/engines/tool-242-unit-conversion.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const UNIT_GROUPS = {
  mass: ['mg', 'g', 'kg', 'lb'],
  volume: ['mL', 'L', 'fl_oz', 'cup'],
  length: ['mm', 'cm', 'm', 'in', 'ft'],
  pressure: ['Pa', 'kPa', 'bar', 'mmHg'],
  temperature: ['C', 'F'],
} as const satisfies Record<string, readonly AnalysisUnitV7[]>;

type UnitDimension = keyof typeof UNIT_GROUPS;

const UNIT_LABELS: Record<AnalysisUnitV7, { ar: string; en: string }> = {
  mg: { ar: 'ملغ', en: 'mg' }, g: { ar: 'غ', en: 'g' }, kg: { ar: 'كغ', en: 'kg' }, lb: { ar: 'رطل (lb)', en: 'lb' },
  mL: { ar: 'مل', en: 'mL' }, L: { ar: 'لتر (L)', en: 'L' }, fl_oz: { ar: 'أونصة سائلة أمريكية', en: 'US fl oz' }, cup: { ar: 'كوب أمريكي', en: 'US cup' },
  mm: { ar: 'مم', en: 'mm' }, cm: { ar: 'سم', en: 'cm' }, m: { ar: 'م', en: 'm' }, in: { ar: 'بوصة', en: 'in' }, ft: { ar: 'قدم', en: 'ft' },
  Pa: { ar: 'باسكال (Pa)', en: 'Pa' }, kPa: { ar: 'كيلوباسكال (kPa)', en: 'kPa' }, bar: { ar: 'بار', en: 'bar' }, mmHg: { ar: 'ملم زئبق', en: 'mmHg' },
  C: { ar: 'درجة مئوية', en: '°C' }, F: { ar: 'درجة فهرنهايت', en: '°F' },
};

const DIMENSION_LABELS: Record<UnitDimension, { ar: string; en: string }> = {
  mass: { ar: 'الكتلة', en: 'Mass' }, volume: { ar: 'الحجم', en: 'Volume' }, length: { ar: 'الطول', en: 'Length' },
  pressure: { ar: 'الضغط', en: 'Pressure' }, temperature: { ar: 'درجة الحرارة', en: 'Temperature' },
};

export default function Tool242AnalysisUnitConverter() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const initial = unitSystem === 'imperial'
    ? { dimension: 'mass' as const, from: 'lb' as const, to: 'kg' as const }
    : { dimension: 'mass' as const, from: 'g' as const, to: 'mg' as const };
  const [dimension, setDimension] = useState<UnitDimension>(initial.dimension);
  const [fromUnit, setFromUnit] = useState<AnalysisUnitV7>(initial.from);
  const [toUnit, setToUnit] = useState<AnalysisUnitV7>(initial.to);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const units = UNIT_GROUPS[dimension];
  const unitOptions = useMemo(() => units.map((unit) => ({ value: unit, label: UNIT_LABELS[unit][ar ? 'ar' : 'en'] })), [units, ar]);
  const tr = (arabic: string, english: string) => ar ? arabic : english;

  const changeDimension = (next: UnitDimension) => {
    const nextUnits = UNIT_GROUPS[next];
    setDimension(next);
    setFromUnit(nextUnits[0]);
    setToUnit(nextUnits[1] ?? nextUnits[0]);
    setResult(null);
    setError('');
  };

  const calculate = () => {
    setResult(null);
    setError('');
    if (value.trim() === '') {
      setError(tr('أدخل قيمة للتحويل.', 'Enter a value to convert.'));
      return;
    }
    try {
      const output = convertAnalysisUnit({ value: Number(value), fromUnit, toUnit });
      setResult(output.value);
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : '';
      if (reason.includes('absolute zero')) setError(tr('درجة الحرارة أقل من الصفر المطلق.', 'Temperature is below absolute zero.'));
      else if (reason.includes('Negative values')) setError(tr('القيمة السالبة غير صالحة لهذه الكمية.', 'Negative values are invalid for this quantity.'));
      else setError(tr('تحقق من القيمة والوحدات المحددة.', 'Check the value and selected units.'));
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-black">{tr('محول وحدات القياس العامة', 'General Measurement Unit Converter')}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {tr('تحويلات محددة بين وحدات من البعد نفسه. لا يحول الجرعات أو الوحدات الخاصة بتحليل بعينه.', 'Explicit conversions between units of the same dimension. No dose or analyte-specific conversions.')}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          {tr('نوع القياس', 'Measurement dimension')}
          <select aria-label={tr('نوع القياس', 'Measurement dimension')} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={dimension} onChange={(event) => changeDimension(event.target.value as UnitDimension)}>
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => <option key={key} value={key}>{label[ar ? 'ar' : 'en']}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {tr('القيمة', 'Value')}
          <input aria-label={tr('القيمة', 'Value')} type="number" step="any" className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">
          {tr('من وحدة', 'From unit')}
          <select aria-label={tr('من وحدة', 'From unit')} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={fromUnit} onChange={(event) => setFromUnit(event.target.value as AnalysisUnitV7)}>
            {unitOptions.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {tr('إلى وحدة', 'To unit')}
          <select aria-label={tr('إلى وحدة', 'To unit')} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-white" value={toUnit} onChange={(event) => setToUnit(event.target.value as AnalysisUnitV7)}>
            {unitOptions.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
          </select>
        </label>
      </div>
      <button type="button" className="mt-4 rounded bg-blue-600 px-4 py-2 font-bold text-white" onClick={calculate}>{tr('حوّل القيمة', 'Convert value')}</button>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
      {result !== null && <p role="status" className="mt-3 rounded border border-emerald-700 p-3 font-mono">{value} {UNIT_LABELS[fromUnit][ar ? 'ar' : 'en']} = {result} {UNIT_LABELS[toUnit][ar ? 'ar' : 'en']}</p>}
      <p className="mt-4 text-xs text-zinc-500">{tr('اختيرت الوحدة الافتراضية وفق تفضيل القياس العام. لا يقدم هذا المحول تفسيراً طبياً أو إرشادات جرعات.', 'The initial units follow the global measurement preference. This converter provides no medical interpretation or dosage guidance.')}</p>
    </section>
  );
}
