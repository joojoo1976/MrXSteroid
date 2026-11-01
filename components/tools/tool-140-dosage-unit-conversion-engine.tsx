'use client';

import { useMemo, useState } from 'react';
import { LAB_CONVERSIONS, type LabAnalyte, type LabResultConversionInput, type LabResultConversionResult } from '@/lib/tools/engines/tool-140-dosage-unit-conversion-engine.v6';
import { LabResultConversionInputSchema } from '@/lib/tools/schemas/tool-140-dosage-unit-conversion-engine';
import { buildLabResultConversionOutput } from '@/lib/tools/adapters/tool-140-dosage-unit-conversion-engine';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
export default function Tool140LabResultUnitConverter() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const [analyte, setAnalyte] = useState<LabAnalyte>('glucose_blood');
  const [direction, setDirection] = useState<'to_si' | 'to_conventional'>('to_si');
  const [value, setValue] = useState('');
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const mapping = LAB_CONVERSIONS[analyte];
  const fromUnit = direction === 'to_si' ? mapping.conventionalUnit : mapping.siUnit;
  const toUnit = direction === 'to_si' ? mapping.siUnit : mapping.conventionalUnit;
  const input = useMemo(() => {
    if (value.trim() === '') return null;
    const parsed = LabResultConversionInputSchema.safeParse({ analyte, value: Number(value), fromUnit, toUnit });
    return parsed.success ? parsed.data : null;
  }, [analyte, value, fromUnit, toUnit]);
  const { output, calculate, reset } = useExplicitToolOutput<LabResultConversionInput, LabResultConversionResult>(input);
  const clearResult = () => reset();
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('محول وحدات نتائج المختبر', 'Lab Result Unit Converter')}</h1></header>
    <p className="text-sm text-zinc-300">{tr('تحويل حسابي باستخدام عوامل منشورة خاصة بكل تحليل. لا يقدم تفسيرًا طبيًا أو نطاقًا مرجعيًا، ولا يحول جرعات الأدوية.', 'Arithmetic conversion using published factors specific to each analyte. No clinical interpretation, reference range, or medication-dose conversion.')}</p>
    <section className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-zinc-200">{tr('التحليل والعينة', 'Analyte and specimen')}<select className={inputClass} value={analyte} onChange={(e) => { clearResult(); setAnalyte(e.target.value as LabAnalyte); }}>
        {(Object.entries(LAB_CONVERSIONS) as Array<[LabAnalyte, (typeof LAB_CONVERSIONS)[LabAnalyte]]>).map(([id, item]) => <option key={id} value={id}>{locale === 'ar' ? ({ glucose_blood: 'الجلوكوز، الدم', cholesterol_total: 'الكوليسترول الكلي، المصل', cholesterol_hdl: 'كوليسترول HDL، المصل', cholesterol_ldl: 'كوليسترول LDL، المصل', triglycerides_serum: 'الدهون الثلاثية، المصل', creatinine_serum: 'الكرياتينين، المصل', bilirubin_total_serum: 'البيليروبين الكلي، المصل', calcium_total_serum: 'الكالسيوم الكلي، المصل', bun_blood: 'نيتروجين اليوريا BUN، الدم', uric_acid_serum: 'حمض اليوريك، المصل', albumin_serum: 'الألبومين، المصل', testosterone_total: 'التستوستيرون الكلي', estradiol_ms_serum: 'الإستراديول، المصل بقياس مطياف الكتلة', tsh: 'الهرمون المنبه للدرقية TSH', vitamin_d_25_total: 'فيتامين د 25-هيدروكسي الكلي' } as Record<LabAnalyte, string>)[id] : item.label}</option>)}
      </select></label>
      <label className="text-sm text-zinc-200">{tr('اتجاه التحويل', 'Conversion direction')}<select className={inputClass} value={direction} onChange={(e) => { clearResult(); setDirection(e.target.value as typeof direction); }}><option value="to_si">{mapping.conventionalUnit} → {mapping.siUnit}</option><option value="to_conventional">{mapping.siUnit} → {mapping.conventionalUnit}</option></select></label>
      <label className="text-sm text-zinc-200 sm:col-span-2">{tr(`النتيجة (${fromUnit})`, `Result (${fromUnit})`)}<input className={inputClass} type="number" inputMode="decimal" min="0" max="1000000000" step="any" value={value} onChange={(e) => { clearResult(); setValue(e.target.value); }} aria-label={`${tr('النتيجة', 'Result')} (${fromUnit})`} /></label>
    </section>
    <p className="text-xs text-zinc-400">{tr('المعادلة:', 'Formula:')} {direction === 'to_si' ? `القيمة × ${mapping.factor}` : `القيمة ÷ ${mapping.factor}`} · {tr('المصدر:', 'Source:')} {mapping.source}</p>
    {value !== '' && !input && <p role="alert" className="text-sm text-amber-300">{tr('أدخل قيمة رقمية غير سالبة ضمن الحد، وتأكد من زوج الوحدات المحدد.', 'Enter a finite, nonnegative value within the limit and verify the selected unit pair.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildLabResultConversionOutput, locale)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('حوّل النتيجة', 'Convert result')}</button><button type="button" onClick={() => { clearResult(); setValue(''); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
    <nav aria-label={tr('مصادر عوامل التحويل', 'Conversion-factor sources')} className="text-xs text-sky-300"><a href="https://www.labcorp.com/test-menu/resources/si-unit-conversion-table" target="_blank" rel="noreferrer">Labcorp SI Unit Conversion Table</a> · <a href="https://www.mayocliniclabs.com/order-tests/si-unit-conversion.html" target="_blank" rel="noreferrer">Mayo Clinic Laboratories SI Conversion</a></nav>
  </main>;
}
