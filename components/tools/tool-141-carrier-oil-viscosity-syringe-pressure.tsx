'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateNewtonianTubePressureV6,
  NewtonianTubeFlowInputSchema,
  type NewtonianTubeFlowResult,
} from '@/lib/tools/engines/tool-141-carrier-oil-viscosity-syringe-pressure.v6';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Draft = Record<'viscosity' | 'density' | 'diameter' | 'length' | 'flow' | 'temperature' | 'viscositySource' | 'densitySource', string>;
const emptyDraft: Draft = { viscosity: '', density: '', diameter: '', length: '', flow: '', temperature: '', viscositySource: '', densitySource: '' };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const PA_S_PER_CP = 0.001;
const KG_M3_PER_LB_FT3 = 16.01846337396;
const M_PER_IN = 0.0254;
const M3_S_PER_ML_MIN = 1e-6 / 60;
const M3_S_PER_US_FL_OZ_MIN = 29.5735295625e-6 / 60;
const PA_PER_PSI = 6894.757293168;

function format(value: number, locale: 'ar' | 'en') {
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 7 }).format(value);
}

export default function Tool141IdealTubeFlowCalculator() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [acknowledged, setAcknowledged] = useState(false);
  const [result, setResult] = useState<NewtonianTubeFlowResult | null>(null);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const imperial = unitSystem === 'imperial';
  const previousImperial = useRef(imperial);
  useEffect(() => {
    if (previousImperial.current === imperial) return;
    const wasImperial = previousImperial.current;
    previousImperial.current = imperial;
    const convert = (value: string, factor: number) => value.trim() === '' ? '' : String(Number((Number(value) * factor).toPrecision(10)));
    setDraft((old) => ({
      ...old,
      density: convert(old.density, wasImperial ? KG_M3_PER_LB_FT3 : 1 / KG_M3_PER_LB_FT3),
      diameter: convert(old.diameter, wasImperial ? M_PER_IN / 0.001 : 0.001 / M_PER_IN),
      length: convert(old.length, wasImperial ? M_PER_IN / 0.001 : 0.001 / M_PER_IN),
      flow: convert(old.flow, wasImperial ? M3_S_PER_US_FL_OZ_MIN / M3_S_PER_ML_MIN : M3_S_PER_ML_MIN / M3_S_PER_US_FL_OZ_MIN),
      temperature: old.temperature.trim() === '' ? '' : String(Number((wasImperial ? (Number(old.temperature) - 32) * 5 / 9 : Number(old.temperature) * 9 / 5 + 32).toPrecision(10))),
    }));
    setResult(null);
  }, [imperial]);
  const units = {
    viscosity: imperial ? 'cP' : 'mPa·s', density: imperial ? 'lb/ft³' : 'kg/m³',
    diameter: imperial ? 'in' : 'mm', length: imperial ? 'in' : 'mm',
    flow: imperial ? 'US fl oz/min' : 'mL/min', temperature: imperial ? '°F' : '°C',
  };

  const parsedInput = useMemo(() => {
    const num = (key: keyof Draft) => draft[key].trim() === '' ? undefined : Number(draft[key]);
    const viscosity = num('viscosity');
    const density = num('density');
    const diameter = num('diameter');
    const length = num('length');
    const flow = num('flow');
    const temperature = num('temperature');
    const candidate = {
      dynamicViscosityPaS: viscosity === undefined ? undefined : viscosity * PA_S_PER_CP,
      densityKgM3: density === undefined ? undefined : density * (imperial ? KG_M3_PER_LB_FT3 : 1),
      innerDiameterM: diameter === undefined ? undefined : diameter * (imperial ? M_PER_IN : 0.001),
      tubeLengthM: length === undefined ? undefined : length * (imperial ? M_PER_IN : 0.001),
      volumetricFlowM3S: flow === undefined ? undefined : flow * (imperial ? M3_S_PER_US_FL_OZ_MIN : M3_S_PER_ML_MIN),
      measurementTemperatureC: temperature === undefined ? undefined : imperial ? (temperature - 32) * 5 / 9 : temperature,
      viscositySource: draft.viscositySource,
      densitySource: draft.densitySource,
      assumptionsAcknowledged: acknowledged,
    };
    const parsed = NewtonianTubeFlowInputSchema.safeParse(candidate);
    const numericOnlyCheck = NewtonianTubeFlowInputSchema.safeParse({
      ...candidate,
      viscositySource: 'numeric validation only',
      densitySource: 'numeric validation only',
      assumptionsAcknowledged: true,
    });
    return { input: parsed.success ? parsed.data : null, numericValid: numericOnlyCheck.success };
  }, [draft, acknowledged, imperial]);

  const allNumbersProvided = ['viscosity', 'density', 'diameter', 'length', 'flow', 'temperature'].every((key) => draft[key as keyof Draft].trim() !== '');
  const sourcesProvided = draft.viscositySource.trim() !== '' && draft.densitySource.trim() !== '';
  const state = parsedInput.input ? 'READY' : !allNumbersProvided ? 'PARTIAL' : !parsedInput.numericValid ? 'INVALID' : !sourcesProvided || !acknowledged ? 'NOT_AVAILABLE' : 'INVALID';
  const update = (key: keyof Draft, value: string) => { setResult(null); setDraft((old) => ({ ...old, [key]: value })); };
  const numberField = (key: keyof Draft, label: string, unit: string) => <label className="block text-sm text-zinc-200">{label} ({unit})
    <input className={inputClass} type="number" min={key === 'temperature' ? (imperial ? '-459.67' : '-273.15') : '0'} step="any" inputMode="decimal" value={draft[key]} onChange={(event) => update(key, event.target.value)} />
  </label>;

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header><h1 className="text-2xl font-black text-white">{t('حاسبة هبوط الضغط النظري في أنبوب دائري', 'Ideal Circular-Tube Pressure Drop Calculator')}</h1></header>
    <p className="rounded-xl border border-amber-700/60 bg-amber-950/30 p-3 text-sm text-amber-100">{t(
      'هذه أداة تعليمية لنموذج تدفق مثالي داخل أنبوب مستقيم فقط. لا تحسب قوة مكبس السرنجة الفعلية، ولا تقيم أمان الحقن أو ملاءمة زيت أو إبرة أو منتج. أدخل خصائص مقاسة من مصدر محدد؛ الأداة لا توفر قاعدة بيانات للزيوت.',
      'Educational ideal-flow model for one straight tube only. It does not calculate actual syringe plunger force or assess injection safety or suitability of any oil, needle or product. Enter measured properties with specific sources; no oil database is provided.',
    )}</p>
    <section className="grid gap-4 sm:grid-cols-2">
      {numberField('viscosity', t('اللزوجة الديناميكية', 'Dynamic viscosity'), units.viscosity)}
      <label className="block text-sm text-zinc-200">{t('مصدر قياس اللزوجة', 'Viscosity measurement source')}<input className={inputClass} maxLength={400} value={draft.viscositySource} onChange={(e) => update('viscositySource', e.target.value)} /></label>
      {numberField('density', t('الكثافة', 'Density'), units.density)}
      <label className="block text-sm text-zinc-200">{t('مصدر قياس الكثافة', 'Density measurement source')}<input className={inputClass} maxLength={400} value={draft.densitySource} onChange={(e) => update('densitySource', e.target.value)} /></label>
      {numberField('diameter', t('القطر الداخلي للأنبوب', 'Tube inner diameter'), units.diameter)}
      {numberField('length', t('طول الأنبوب المستقيم', 'Straight tube length'), units.length)}
      {numberField('flow', t('معدل التدفق الحجمي المفترض', 'Assumed volumetric flow rate'), units.flow)}
      {numberField('temperature', t('درجة قياس خصائص السائل', 'Temperature at property measurement'), units.temperature)}
    </section>
    <label className="flex items-start gap-3 text-sm text-zinc-200"><input type="checkbox" checked={acknowledged} onChange={(e) => { setAcknowledged(e.target.checked); setResult(null); }} />
      <span>{t('أقر بأن النموذج يفترض تدفقاً ثابتاً، وسائلًا غير قابل للانضغاط ونيوتونيًا، وتدفقاً صفحياً متطوراً بالكامل داخل أنبوب صلب مستقيم دائري بقطر ثابت. لا تمثل النتيجة جهازاً حقيقياً.', 'I acknowledge the model assumes steady, incompressible Newtonian fluid and fully developed laminar flow in a rigid straight circular tube of constant diameter. It does not represent a real device.')}</span>
    </label>
    {!parsedInput.input && <p role="status" data-testid="tool-141-input-state" className="text-sm text-amber-300">{state}: {state === 'PARTIAL' ? t('أكمل جميع القياسات ودرجات الحرارة.', 'Complete all measurements and the temperature.') : state === 'NOT_AVAILABLE' ? t('يلزم توثيق مصدر اللزوجة والكثافة والإقرار بافتراضات النموذج.', 'Provide viscosity and density sources and acknowledge the model assumptions.') : t('مدخل غير صالح أو خارج النطاق المدعوم.', 'An input is invalid or outside the supported range.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!parsedInput.input} onClick={() => parsedInput.input && setResult(calculateNewtonianTubePressureV6(parsedInput.input))} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('احسب هبوط الضغط النظري', 'Calculate ideal pressure drop')}</button><button type="button" onClick={() => { setDraft(emptyDraft); setAcknowledged(false); setResult(null); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button></div>
    {result && <section aria-live="polite" className="space-y-2 rounded-xl border border-zinc-700 p-4 text-white" data-testid="tool-141-result">
      <h2 className="text-lg font-bold">{result.status}</h2>
      <p>{t('رقم رينولدز', 'Reynolds number')}: <strong>{format(result.reynoldsNumber, locale)}</strong></p>
      {result.status === 'CALCULATED' ? <><p>{t('هبوط الضغط النظري عبر الأنبوب', 'Ideal pressure drop across tube')}: <strong>{format(result.idealTubePressureDropPa / (imperial ? PA_PER_PSI : 1000), locale)} {imperial ? 'psi' : 'kPa'}</strong></p><p>{t('المعادلة: ΔP = 128 μ L Q / (π d⁴)', 'Equation: ΔP = 128 μ L Q / (π d⁴)')}</p></> : <p>{t('تعذر الحساب بهذا النموذج بسبب عدم تحقق شرط الجريان الصفحي.', 'This model cannot calculate because the laminar-flow condition is not met.')}: {result.reason}</p>}
      <p className="text-sm text-amber-200">{t('هذه قيمة نظرية لهبوط الضغط في أنبوب مثالي، وليست ضغطاً أو قوة مكبس فعلية ولا تقديراً للزمن أو الأمان أو صلاحية الاستخدام.', 'This is theoretical pressure drop in an ideal tube, not actual syringe pressure or plunger force, nor an estimate of time, safety or suitability.')}</p>
    </section>}
  </main>;
}
