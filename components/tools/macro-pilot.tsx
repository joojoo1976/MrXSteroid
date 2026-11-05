'use client';

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import GeniusToolTemplateV4 from '@/lib/templates/genius-tool-template.v4';
import { calculateMacrosV6 } from '@/lib/tools/engines/macro.v6';
import {
  adaptMacroV6ToV4,
  adaptMacroV6UnavailableToV4,
  adaptMacroV6InvalidToV4,
} from '@/lib/engines/core/v4/adapter.macro.v4';
import type { ToolResultEnvelopeV4 } from '@/lib/engines/core/v4/contracts.v4';
import { Language, Theme } from '@/shared/types/types';
import styles from './macro-pilot.module.css';
import type {
  MacroInputV6,
  MacroOutputV6,
  SuperIntelligenceLayer,
  WhatIfScenarioV6,
} from '@/lib/tools/engines/macro.v6';

type DisplayUnitSystem = 'metric' | 'imperial';
type Field = 'age' | 'sex' | 'heightCm' | 'weightKg' | 'activityLevel' | 'phase';
type WhatIfKey = 'weightKg' | 'activityLevel' | 'tdee';
const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

function toDisplayValue(field: Field, canonicalValue: number | undefined, units: DisplayUnitSystem): number | '' {
  if (canonicalValue === undefined) return '';
  if (field === 'weightKg') return Math.round(((units === 'imperial' ? canonicalValue / KG_PER_LB : canonicalValue) * 10)) / 10;
  if (field === 'heightCm') return Math.round(((units === 'imperial' ? canonicalValue / CM_PER_IN : canonicalValue) * 10)) / 10;
  return canonicalValue;
}

function toCanonicalValue(field: Field, displayedValue: number, units: DisplayUnitSystem): number {
  if (units === 'imperial' && field === 'weightKg') return displayedValue * KG_PER_LB;
  if (units === 'imperial' && field === 'heightCm') return displayedValue * CM_PER_IN;
  return displayedValue;
}

const translations = {
  en: {
    title: 'Macro Calculator v6', description: 'Deterministic macro calculation using the documented SPEC v3 equations.',
    age: 'Age (years)', sex: 'Sex used by the BMR equation', male: 'Male', female: 'Female',
    height: 'Height (cm)', heightImperial: 'Height (in)', weight: 'Weight (kg)', weightImperial: 'Weight (lb)', activity: 'Activity factor (1.2–1.9)', phase: 'Calculation phase',
    cut: 'Cut (−15%)', maintenance: 'Maintenance', bulk: 'Bulk (+15%)',
    empty: 'Enter the required values to begin.', partial: 'Missing required fields', full: 'Calculated scenario',
    status: { idle: 'Waiting for inputs', partial: 'Inputs incomplete', ready: 'Calculation complete', error: 'Calculation unavailable' },
    calculate: 'Recalculate', required: 'Required inputs', calories: 'Target calories', protein: 'Protein', carbs: 'Carbohydrates', fat: 'Fat',
    calculatedType: 'Result type: CALCULATED',
    distribution: 'Macro energy distribution',
    distributionTotal: 'Macro energy total: {total} kcal · Target: {target} kcal · Difference: {difference} kcal',
    percentageRounding: 'Percentages are rounded independently and may not total exactly 100%.',
    assumptions: 'Formula and assumptions', scenarios: 'Calculated comparison scenarios', sensitivity: 'Local sensitivity (not causal)',
    whatIfMode: 'What-if dimension', whatIfWeight: 'Weight', whatIfActivity: 'Activity factor', whatIfTdee: 'TDEE (kcal/day)', whatIf: 'Weight what-if (kg)', whatIfImperial: 'Weight what-if (lb)', whatIfResult: 'Scenario result', error: 'Check the entered values. No result was produced.',
    invalidAge: 'Age must be between 19 and 100 years.', invalidHeight: 'Height is outside the supported range.', invalidWeight: 'Weight is outside the supported range.', invalidActivity: 'Activity factor must be between 1.2 and 1.9.', infeasibleResult: 'These inputs do not produce a feasible non-negative macro distribution.', invalidCalculation: 'These inputs do not produce a positive finite energy estimate.',
    scenarioUnavailable: 'Not available: the inputs cannot produce a non-negative macro distribution under this phase.',
    noPrediction: 'This is a deterministic calculation, not a prediction or medical assessment.',
    fieldNames: { age: 'Age', sex: 'Sex', heightCm: 'Height', weightKg: 'Weight', activityLevel: 'Activity factor', phase: 'Phase' },
    scenarioNames: { 'switch-to-cut': 'Switch to Cut phase', 'switch-to-bulk': 'Switch to Bulk phase', 'switch-to-maintenance': 'Switch to Maintenance phase' },
    scenarioWeightLower: 'Recalculate at {delta} lower weight', scenarioWeightHigher: 'Recalculate at {delta} higher weight',
    equationSource: 'Original Mifflin–St Jeor study (PubMed)',
    equationSourceLimits: 'The source study derived this resting-energy equation from 498 healthy adults aged 19–78. This page permits ages 19–100; ages above 78 are extrapolations, not validated by that study. The equation estimates resting energy expenditure; it is not a measurement.',
    assumptionLines: [
      'The sex-specific Mifflin-St Jeor equation is used as a resting-energy estimate; it is not a measurement.',
      'Bulk uses a 15% TDEE increase; cut uses a 15% decrease; maintenance uses TDEE.',
      'Recomposition is unsupported because SPEC v3 does not define an approved equation for this phase.',
      'Protein is 2.2 g/kg and fat is 0.9 g/kg; carbohydrate fills remaining target calories.',
      'Activity factor is user-selected within 1.2–1.9; the result is an arithmetic estimate, not a medical assessment.',
    ],
    sensitivityLine: 'Sensitivity describes the local arithmetic response and does not show causation.',
    sensitivityFactor: '{factor}: a local +1% input change changes target calories by {change}% in this calculation.',
    factorNames: { weightKg: 'Weight', heightCm: 'Height', age: 'Age', activityLevel: 'Activity factor' },
    belowBmrWarning: 'The arithmetic target is below estimated BMR; this comparison does not determine nutritional safety or individual needs.',
    ageRangeWarning: 'The Mifflin-St Jeor source study included healthy adults aged 19–78; applying it outside that range is extrapolation not validated by that study.',
  },
  ar: {
    title: 'حاسبة الماكروز V6', description: 'حساب حتمي للماكروز وفق معادلات SPEC V3 الموثقة.',
    age: 'العمر (سنة)', sex: 'الجنس المستخدم في معادلة الأيض الأساسي', male: 'ذكر', female: 'أنثى',
    height: 'الطول (سم)', heightImperial: 'الطول (بوصة)', weight: 'الوزن (كجم)', weightImperial: 'الوزن (رطل)', activity: 'معامل النشاط (1.2–1.9)', phase: 'مرحلة الحساب',
    cut: 'خفض (−15٪)', maintenance: 'ثبات', bulk: 'زيادة (+15٪)',
    empty: 'أدخل القيم المطلوبة للبدء.', partial: 'الحقول المطلوبة الناقصة', full: 'سيناريو محسوب',
    status: { idle: 'بانتظار المدخلات', partial: 'المدخلات غير مكتملة', ready: 'اكتمل الحساب', error: 'تعذر الحساب' },
    calculate: 'إعادة الحساب', required: 'المدخلات المطلوبة', calories: 'السعرات المستهدفة', protein: 'البروتين', carbs: 'الكربوهيدرات', fat: 'الدهون',
    calculatedType: 'نوع النتيجة: محسوبة حتميًا (CALCULATED)',
    distribution: 'توزيع الطاقة حسب المغذيات الكبرى',
    distributionTotal: 'مجموع طاقة الماكروز: {total} سعرة · الهدف: {target} سعرة · الفرق: {difference} سعرة',
    percentageRounding: 'تُقرّب النسب كلٌّ على حدة، لذلك قد لا يساوي مجموعها 100٪ تماماً.',
    assumptions: 'المعادلة والافتراضات', scenarios: 'سيناريوهات مقارنة محسوبة', sensitivity: 'حساسية محلية (لا تثبت السببية)',
    whatIfMode: 'بُعد السيناريو الافتراضي', whatIfWeight: 'الوزن', whatIfActivity: 'معامل النشاط', whatIfTdee: 'TDEE (سعرة/يوم)', whatIf: 'سيناريو وزن افتراضي (كجم)', whatIfImperial: 'سيناريو وزن افتراضي (رطل)', whatIfResult: 'نتيجة السيناريو', error: 'تحقق من القيم المدخلة. لم تُنتج نتيجة.',
    invalidAge: 'يجب أن يكون العمر بين 19 و100 سنة.', invalidHeight: 'الطول خارج النطاق المدعوم.', invalidWeight: 'الوزن خارج النطاق المدعوم.', invalidActivity: 'يجب أن يكون معامل النشاط بين 1.2 و1.9.', infeasibleResult: 'لا تنتج هذه المدخلات توزيعًا صالحًا غير سالب للماكروز.', invalidCalculation: 'لا تنتج هذه المدخلات تقديرًا موجبًا ومحدودًا للطاقة.',
    scenarioUnavailable: 'غير متاح: لا تنتج هذه المدخلات توزيعاً غير سالب للماكروز في هذه المرحلة.',
    noPrediction: 'هذا حساب حتمي، وليس تنبؤاً أو تقييماً طبياً.',
    fieldNames: { age: 'العمر', sex: 'الجنس', heightCm: 'الطول', weightKg: 'الوزن', activityLevel: 'معامل النشاط', phase: 'المرحلة' },
    scenarioNames: { 'switch-to-cut': 'التحويل إلى مرحلة الخفض', 'switch-to-bulk': 'التحويل إلى مرحلة الزيادة', 'switch-to-maintenance': 'التحويل إلى مرحلة الثبات' },
    scenarioWeightLower: 'إعادة الحساب بوزن أقل بمقدار {delta}', scenarioWeightHigher: 'إعادة الحساب بوزن أعلى بمقدار {delta}',
    equationSource: 'الدراسة الأصلية لمعادلة ميفلين–سانت جيور (PubMed)',
    equationSourceLimits: 'اشتُقت معادلة الطاقة أثناء الراحة في الدراسة من 498 بالغاً سليماً أعمارهم 19–78 سنة. تسمح هذه الصفحة بأعمار 19–100؛ والأعمار فوق 78 استقراء لم تتحقق منه تلك الدراسة. المعادلة تقدّر إنفاق الطاقة أثناء الراحة ولا تقيسه.',
    assumptionLines: [
      'تُستخدم معادلة ميفلين-سانت جيور الخاصة بالجنس لتقدير الطاقة أثناء الراحة؛ وهي ليست قياساً مباشراً.',
      'تزيد مرحلة الزيادة السعرات 15٪ من TDEE، وتخفضها مرحلة الخفض 15٪، وتستخدم مرحلة الثبات قيمة TDEE.',
      'إعادة تركيب الجسم غير مدعومة لأن SPEC V3 لا يحدد معادلة معتمدة لهذه المرحلة.',
      'يُحسب البروتين على أساس 2.2 جم/كجم والدهون 0.9 جم/كجم، وتملأ الكربوهيدرات السعرات المتبقية.',
      'يختار المستخدم معامل النشاط ضمن 1.2–1.9؛ والنتيجة حساب رياضي وليست تقييماً طبياً.',
    ],
    sensitivityLine: 'الحساسية تصف الاستجابة الحسابية المحلية ولا تثبت السببية.',
    sensitivityFactor: '{factor}: يؤدي تغير محلي مقداره 1٪ في المدخل إلى تغير السعرات المستهدفة بمقدار {change}٪ في هذا الحساب.',
    factorNames: { weightKg: 'الوزن', heightCm: 'الطول', age: 'العمر', activityLevel: 'معامل النشاط' },
    belowBmrWarning: 'السعرات الناتجة حسابياً أقل من تقدير الأيض الأساسي؛ ولا تحدد هذه المقارنة السلامة الغذائية أو الاحتياجات الفردية.',
    ageRangeWarning: 'اشتملت دراسة معادلة ميفلين-سانت جيور على بالغين أصحاء أعمارهم 19–78 سنة؛ تطبيقها خارج هذا النطاق استقراء لم تتحقق منه تلك الدراسة.',
  },
} as const;

const requiredFields: Field[] = ['age', 'sex', 'heightCm', 'weightKg', 'activityLevel', 'phase'];
type MacroTranslations = typeof translations[keyof typeof translations];

function getLocalizedCalculationError(error: unknown, text: MacroTranslations): string {
  const message = error instanceof Error ? error.message : '';
  const fieldErrors: string[] = [];
  if (/age must be between 19 and 100/i.test(message)) fieldErrors.push(text.invalidAge);
  if (/heightCm must be between/i.test(message)) fieldErrors.push(text.invalidHeight);
  if (/weightKg must be between/i.test(message)) fieldErrors.push(text.invalidWeight);
  if (/activityLevel must be between 1\.2 and 1\.9/i.test(message)) fieldErrors.push(text.invalidActivity);
  if (fieldErrors.length > 0) return fieldErrors.join(' ');
  if (/feasible non-negative macro distribution/i.test(message)) return text.infeasibleResult;
  if (/positive finite BMR/i.test(message)) return text.invalidCalculation;
  return text.error;
}

function formatOutput(output: MacroOutputV6, labels: { calories: string; protein: string; carbs: string; fat: string }) {
  return `${labels.calories}: ${output.targetCalories} kcal · ${labels.protein}: ${output.proteinGrams} g · ${labels.carbs}: ${output.carbsGrams} g · ${labels.fat}: ${output.fatGrams} g`;
}

export default function MacroPilotTool() {
  const { language: preferenceLanguage, unitSystem, theme: themePreference, isRTL } = usePreferences();
  const language: Language = preferenceLanguage;
  const subscribeToTheme = useCallback((onStoreChange: () => void) => {
    window.addEventListener('mrx_theme_change', onStoreChange);
    return () => window.removeEventListener('mrx_theme_change', onStoreChange);
  }, []);
  const getResolvedTheme = useCallback((): 'light' | 'dark' => {
    if (themePreference === Theme.SYSTEM) {
      return document.documentElement.getAttribute('data-resolved-theme') === 'dark' ? 'dark' : 'light';
    }
    return themePreference === Theme.DARK ? 'dark' : 'light';
  }, [themePreference]);
  const getServerTheme = useCallback((): 'light' | 'dark' => (
    themePreference === Theme.DARK ? 'dark' : 'light'
  ), [themePreference]);
  const resolvedTheme = useSyncExternalStore(subscribeToTheme, getResolvedTheme, getServerTheme);
  const [input, setInput] = useState<Partial<MacroInputV6>>({});
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [missing, setMissing] = useState<Field[]>(requiredFields);
  const [result, setResult] = useState<MacroOutputV6 | null>(null);
  const [intelligence, setIntelligence] = useState<SuperIntelligenceLayer | null>(null);
  const [whatIfResult, setWhatIfResult] = useState<WhatIfScenarioV6 | null>(null);
  const [whatIfKey, setWhatIfKey] = useState<WhatIfKey>('weightKg');
  const [error, setError] = useState('');
  const [resultEnvelope, setResultEnvelope] = useState<ToolResultEnvelopeV4<unknown, unknown> | null>(null);
  const text = translations[language];
  const direction = isRTL ? 'rtl' : 'ltr';
  const convertWeightToDisplay = (kg: number) => unitSystem === 'imperial' ? kg / KG_PER_LB : kg;
  const convertWeightToCanonical = (displayWeight: number) => unitSystem === 'imperial' ? displayWeight * KG_PER_LB : displayWeight;
  const displayWeightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const slider = useMemo(() => {
    if (!intelligence) return null;
    try { return intelligence.whatIf.getSliderConfig(whatIfKey); } catch { return null; }
  }, [intelligence, whatIfKey]);
  const whatIfLabels: Record<WhatIfKey, string> = {
    weightKg: unitSystem === 'imperial' ? text.whatIfImperial : text.whatIf,
    activityLevel: text.whatIfActivity,
    tdee: text.whatIfTdee,
  };
  const whatIfBaseValue = input && result
    ? whatIfKey === 'weightKg' ? input.weightKg!
      : whatIfKey === 'activityLevel' ? input.activityLevel!
        : result.tdee
    : 0;
  const whatIfCurrentValue = whatIfResult?.resultType === 'CALCULATED'
    ? whatIfBaseValue + Number(whatIfResult.inputDeltas[whatIfKey] ?? 0)
    : whatIfBaseValue;
  const whatIfDisplayValue = (value: number) => whatIfKey === 'weightKg'
    ? convertWeightToDisplay(value)
    : value;
  const whatIfDisplayUnit = whatIfKey === 'weightKg'
    ? displayWeightUnit
    : whatIfKey === 'activityLevel' ? '×' : 'kcal/day';
  const whatIfDisplayStep = slider && whatIfKey === 'weightKg' && unitSystem === 'imperial'
    ? slider.step / KG_PER_LB
    : slider?.step ?? 1;

  useEffect(() => {
    let active = true;
    const createdAt = new Date().toISOString();
    void calculateMacrosV6(input).then((response) => {
      if (!active) return;
      setError('');
      setWhatIfResult(null);
      setMissing(response.dynamic.missingRequiredFields);
      if (!('result' in response)) {
        const completeness = response.dynamic.completeness === 'full'
          ? 'partial'
          : response.dynamic.completeness;
        setResultEnvelope(adaptMacroV6UnavailableToV4(
          input,
          completeness,
          response.dynamic.missingRequiredFields,
          createdAt,
        ));
        setResult(null);
        setIntelligence(null);
        setStatus('partial');
        return;
      }
      setResultEnvelope(adaptMacroV6ToV4(
        input as MacroInputV6,
        response.result,
        createdAt,
        response.intelligence.warnings,
      ));
      setResult(response.result);
      setIntelligence(response.intelligence);
      setMissing([]);
      setStatus('ready');
    }).catch((caughtError: unknown) => {
      if (!active) return;
      const localizedError = getLocalizedCalculationError(caughtError, text);
      setError(localizedError);
      setResultEnvelope(adaptMacroV6InvalidToV4(input, localizedError, createdAt));
      setStatus('error');
    });

    return () => { active = false; };
  }, [input, text]);

  const updateField = (field: Field, rawValue: string, units = unitSystem) => {
    setError('');
    setResult(null);
    setIntelligence(null);
    setWhatIfResult(null);
    setResultEnvelope(null);
    setStatus('partial');
    setInput((previous) => {
      const next = { ...previous };
      if (rawValue === '') {
        delete next[field];
      } else if (field === 'sex' || field === 'phase') {
        Object.assign(next, { [field]: rawValue });
      } else {
        Object.assign(next, { [field]: toCanonicalValue(field, Number(rawValue), units) });
      }
      return next;
    });
  };

  const inputProps = (field: Exclude<Field, 'sex' | 'phase'>, label: string, min: number, max: number, step = 1) => ({
    'aria-label': label,
    type: 'number' as const,
    min,
    max,
    step,
    value: typeof input[field] === 'number' ? toDisplayValue(field, input[field] as number, unitSystem) : '',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => updateField(field, event.target.value, unitSystem),
  });

  const renderedInputs = (
    <div className="grid gap-4 md:grid-cols-2" dir={direction}>
      <label className="grid gap-1">{text.age}<input {...inputProps('age', text.age, 19, 100)} /></label>
      <label className="grid gap-1">{text.sex}
        <select aria-label={text.sex} value={input.sex ?? ''} onChange={(event) => updateField('sex', event.target.value)}>
          <option value="">—</option><option value="male">{text.male}</option><option value="female">{text.female}</option>
        </select>
      </label>
      <label className="grid gap-1">{unitSystem === 'metric' ? text.height : text.heightImperial}
        <input {...inputProps('heightCm', unitSystem === 'metric' ? text.height : text.heightImperial, unitSystem === 'metric' ? 100 : 100 / CM_PER_IN, unitSystem === 'metric' ? 250 : 250 / CM_PER_IN, unitSystem === 'metric' ? 1 : 0.1)} />
      </label>
      <label className="grid gap-1">{unitSystem === 'metric' ? text.weight : text.weightImperial}
        <input {...inputProps('weightKg', unitSystem === 'metric' ? text.weight : text.weightImperial, unitSystem === 'metric' ? 30 : 30 / KG_PER_LB, unitSystem === 'metric' ? 300 : 300 / KG_PER_LB, 0.1)} />
      </label>
      <label className="grid gap-1">{text.activity}<input {...inputProps('activityLevel', text.activity, 1.2, 1.9, 0.01)} /></label>
      <label className="grid gap-1">{text.phase}
        <select aria-label={text.phase} value={input.phase ?? ''} onChange={(event) => updateField('phase', event.target.value)}>
          <option value="">—</option><option value="cut">{text.cut}</option><option value="maintenance">{text.maintenance}</option><option value="bulk">{text.bulk}</option>
        </select>
      </label>
      <button type="button" onClick={() => setInput((previous) => ({ ...previous }))}>{text.calculate}</button>
    </div>
  );

  const results = (
    <div dir={direction}>
      <p data-testid="macro-status" role="status" aria-live="polite">{text.status[status]}</p>
      {!result && status !== 'error' ? <div>
        <p>{missing.length === requiredFields.length ? text.empty : text.partial}</p>
        {missing.length > 0 ? <ul aria-label={text.required}>{missing.map((field) => <li key={field}>{text.fieldNames[field]}</li>)}</ul> : null}
      </div> : null}
      {result ? <div aria-label={text.full}>
        <p data-testid="macro-result-type">{text.calculatedType}</p>
        <p data-testid="macro-result">{formatOutput(result, text)}</p>
        <p>{text.noPrediction}</p>
        <h2>{text.distribution}</h2>
        <ul data-testid="macro-distribution" aria-label={text.distribution}>
          <li>{text.protein}: {result.macros.protein.grams} g · {result.macros.protein.calories} kcal · {result.macros.protein.pct}%</li>
          <li>{text.carbs}: {result.macros.carbs.grams} g · {result.macros.carbs.calories} kcal · {result.macros.carbs.pct}%</li>
          <li>{text.fat}: {result.macros.fat.grams} g · {result.macros.fat.calories} kcal · {result.macros.fat.pct}%</li>
        </ul>
        <p data-testid="macro-energy-balance">
          {text.distributionTotal
            .replace('{total}', String(result.macros.protein.calories + result.macros.carbs.calories + result.macros.fat.calories))
            .replace('{target}', String(result.targetCalories))
            .replace('{difference}', String(result.macros.protein.calories + result.macros.carbs.calories + result.macros.fat.calories - result.targetCalories))}
        </p>
        <p>{text.percentageRounding}</p>
        <h2>{text.assumptions}</h2>
        <ul>{text.assumptionLines.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        <p>
          <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noreferrer" className="underline">{text.equationSource}</a>
          {' — '}{text.equationSourceLimits}
        </p>
        {intelligence ? <>
          <h2>{text.scenarios}</h2>
          <ul>{intelligence.scenarios.map((scenario) => {
            const delta = unitSystem === 'imperial' ? `${(10 / KG_PER_LB).toFixed(1)} lb` : '10 kg';
            const scenarioName = scenario.id === 'weight-minus-10kg'
              ? text.scenarioWeightLower.replace('{delta}', delta)
              : scenario.id === 'weight-plus-10kg'
                ? text.scenarioWeightHigher.replace('{delta}', delta)
                : text.scenarioNames[scenario.id as keyof typeof text.scenarioNames] ?? scenario.label;
            const scenarioDetails = scenario.resultType === 'CALCULATED'
              ? formatOutput(scenario.calculatedOutput, text)
              : text.scenarioUnavailable;
            return <li key={scenario.id}>{scenarioName}: {scenarioDetails} ({scenario.resultType})</li>;
          })}</ul>
          <h2>{text.sensitivity}</h2>
          <p>{text.sensitivityLine}</p>
          <ul>{intelligence.top3Reasoning.map((factor) => <li key={`${factor.rank}-${factor.factor}`}>{text.sensitivityFactor
            .replace('{factor}', text.factorNames[factor.factor as keyof typeof text.factorNames] ?? factor.factor)
            .replace('{change}', factor.localElasticity.toFixed(2))}</li>)}</ul>
          <label className="grid gap-1">{text.whatIfMode}
            <select aria-label={text.whatIfMode} value={whatIfKey} onChange={(event) => {
              setWhatIfKey(event.target.value as WhatIfKey);
              setWhatIfResult(null);
            }}>
              <option value="weightKg">{whatIfLabels.weightKg}</option>
              <option value="activityLevel">{whatIfLabels.activityLevel}</option>
              <option value="tdee">{whatIfLabels.tdee}</option>
            </select>
          </label>
          {slider ? <label className="grid gap-1">{whatIfLabels[whatIfKey]}: {whatIfDisplayValue(whatIfCurrentValue).toFixed(whatIfKey === 'activityLevel' ? 2 : 1)} {whatIfDisplayUnit}
            <input aria-label={whatIfLabels[whatIfKey]} type="range"
              min={whatIfDisplayValue(slider.min)} max={whatIfDisplayValue(slider.max)}
              step={whatIfDisplayStep}
              value={whatIfDisplayValue(whatIfCurrentValue)}
              onChange={(event) => {
                const displayedValue = Number(event.target.value);
                const canonicalValue = whatIfKey === 'weightKg' ? convertWeightToCanonical(displayedValue) : displayedValue;
                setWhatIfResult(intelligence.whatIf.adjustInput(whatIfKey, canonicalValue));
              }} />
          </label> : null}
          {whatIfResult ? <p data-testid="macro-what-if">{text.whatIfResult}: {whatIfResult.resultType === 'CALCULATED' ? formatOutput(whatIfResult.calculatedOutput, text) : text.scenarioUnavailable} ({whatIfResult.resultType})</p> : null}
          <ul>{intelligence.warnings.map((warning, index) => <li key={`${warning.level}-${index}`}>{warning.code === 'TARGET_BELOW_ESTIMATED_BMR' ? text.belowBmrWarning : warning.code === 'AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE' ? text.ageRangeWarning : warning.message}</li>)}</ul>
        </> : null}
      </div> : null}
    </div>
  );

  return (
    <div className={styles.shell}>
    <GeniusToolTemplateV4
      toolId="mrx.tool.macro"
      title={text.title}
      description={text.description}
      locale={language}
      direction={direction}
      unitSystem={unitSystem}
      theme={resolvedTheme}
      status={status}
      inputCompleteness={resultEnvelope?.inputSnapshot.completeness}
      resultEnvelope={resultEnvelope}
      inputs={renderedInputs}
      results={results}
      errors={error ? [error] : []}
      riskTier="MEDIUM"
      aiStatus="NOT_CONFIGURED"
    />
    </div>
  );
}
