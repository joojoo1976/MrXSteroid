'use client';

import React, { useEffect, useState } from 'react';
import GeniusToolTemplateV4 from '@/lib/templates/genius-tool-template.v4';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { calculateWaterIntakeV6 } from '@/lib/tools/engines/water-intake.v6';
import type { WaterIntakeInput, WaterIntakeOutput } from '@/lib/tools/engines/water-intake.v6';
import {
  adaptWaterIntakeV6InvalidToV4,
  adaptWaterIntakeV6ToV4,
  adaptWaterIntakeV6UnavailableToV4,
} from '@/lib/engines/core/v4/adapter.water-intake.v4';
import type { ToolResultEnvelopeV4 } from '@/lib/engines/core/v4/contracts.v4';
import {
  countProvidedWaterIntakeFields,
} from '@/lib/engines/core/v4/profiles/water-intake-input-profile.v4';
import {
  canonicalToDisplay,
  DynamicSliderField,
  type SliderBoundsSet,
} from './dynamic-slider-field';
import {
  buildWaterScenarios,
  litersToUsFlOz,
} from '@/lib/tools/r5/water-insights';
import styles from './tool-pilot-v4.module.css';

const activities = [1, 1.1, 1.2, 1.3, 1.4] as const;

const WEIGHT_BOUNDS: SliderBoundsSet = {
  metric: { min: 30, max: 300, step: 0.5, precision: 1, unit: 'kg' },
  // 66.2 lb = 30.03 kg and 661.3 lb = 299.96 kg: both stops convert inside
  // the canonical 30-300 kg range, so the slider can never emit an invalid
  // canonical value from its own endpoints.
  imperial: { min: 66.2, max: 661.3, step: 0.1, precision: 1, unit: 'lb' },
};

const RECALC_WEIGHT_MIN = 30;
const RECALC_WEIGHT_MAX = 300;

const translations = {
  en: {
    title: 'Daily Water Intake Estimate',
    description: 'Deterministic starting water estimate from weight and activity. Not medical advice.',
    weight: 'Weight',
    weightImperial: 'Weight (lb)',
    weightMetric: 'Weight (kg)',
    activity: 'Activity level',
    activities: ['Baseline', 'Light', 'Moderate', 'Active', 'Very active'],
    calculate: 'Calculate',
    empty: 'Enter your weight to begin.',
    partial: 'Missing required fields',
    required: 'Required inputs',
    status: { idle: 'Waiting for inputs', partial: 'Inputs incomplete', ready: 'Calculation complete', error: 'Calculation unavailable' },
    result: 'Estimated daily intake',
    invalid: 'Enter a valid positive body weight.',
    errorGuidance: 'Enter a positive weight between 30 and 300 kg (66.2-661.3 lb), then recalculate.',
    disclaimer: 'This estimate does not account for climate, health conditions or fluids from food; it is not medical advice.',
    calculatedType: 'Result type: CALCULATED',
    requiredProgress: '{provided} of {required} required inputs provided.',
    meaningH2: 'What this result means',
    meaningBody: 'It is a deterministic starting estimate of your daily fluid intake from your weight and your activity level. It is not a medical target, a treatment plan, or a guarantee about any health outcome.',
    doesNotH2: 'What this result does not mean',
    doesNotBody: 'It does not diagnose or prescribe anything for your conditions, and it does not replace a qualified professional. Water needs vary with climate, diet, activity intensity, pregnancy and conditions beyond what this estimate captures.',
    formulaSummary: 'Formula, evidence and assumptions',
    interpretationSummary: 'Interpreting your number',
    unitsSummary: 'Units and rounding',
    formulaLines: [
      'Heuristic: 35 mL per kilogram.',
      'Activity factor = 1 + (activityLevel − 1) × 0.1 (coarse, user-selected, not measured).',
      'Application-designed SPEC v3 convention; it is not externally validated or clinically reviewed.',
    ],
    interpretationLines: [
      'Use this as a starting reference; climate and diet can move it substantially in either direction.',
      'Water comes from drinks and food; this estimate counts neither automatically.',
      'Medical conditions, pregnancy and exercise that sweat heavily change your actual needs.',
    ],
    unitsLines: [
      'Metric: weight in kilograms. Imperial: weight in pounds. The engine receives kg only; conversions are display-boundary only.',
      'Displayed weight is rounded to one decimal; imperial entries convert back before calculation.',
      'The estimate is rounded to two decimals for litres; millilitres are shown rounded.',
    ],
    warningNotMedical: 'This is a deterministic starting estimate, not medical advice and not a prescription. Increase or decrease based on climate, thirst and professional guidance.',
    scenariosHeading: 'Activity comparison at your current weight',
    scenariosNote: 'Every value is recalculated by the same engine with your current weight. Changing the activity level below changes only the selected estimate.',
    selectedLabel: 'Selected',
    interpretation: 'At {weight}, the same engine estimates {low} L/day at baseline, {mid} L/day at moderate and {high} L/day at very active. This is a starting reference, not an individual requirement.',
    weightUnitMetric: 'kg',
    weightUnitImperial: 'lb',
    adviceHeading: 'Using this estimate',
    advice: 'Treat it as a starting point and adjust for climate, sweat, thirst and any professional guidance. Food and other drinks also contribute to daily fluid.',
    caution: 'If you are pregnant or breastfeeding, have kidney or heart disease, or take diuretics, ask a qualified professional before changing fluid intake.',
    usFlOz: 'US fl oz',
  },
  ar: {
    title: 'تقدير احتياج الماء اليومي',
    description: 'تقدير حتمي أولي للماء حسب الوزن والنشاط. ليس استشارة طبية.',
    weight: 'الوزن',
    weightImperial: 'الوزن (رطل)',
    weightMetric: 'الوزن (كجم)',
    activity: 'مستوى النشاط',
    activities: ['أساسي', 'خفيف', 'متوسط', 'نشط', 'نشط جدًا'],
    calculate: 'احسب',
    empty: 'أدخل وزنك للبدء.',
    partial: 'الحقول المطلوبة الناقصة',
    required: 'المدخلات المطلوبة',
    status: { idle: 'بانتظار المدخلات', partial: 'المدخلات غير مكتملة', ready: 'اكتمل الحساب', error: 'تعذر الحساب' },
    result: 'التقدير اليومي للماء',
    invalid: 'أدخل وزنًا إيجابيًا صالحًا.',
    errorGuidance: 'أدخل وزنًا إيجابيًا بين 30 و300 كجم (66.2–661.3 رطل) ثم أعد الحساب.',
    disclaimer: 'لا يأخذ هذا التقدير المناخ أو كل الحالات الصحية أو الماء الموجود في الطعام؛ وليس استشارة طبية.',
    calculatedType: 'نوع النتيجة: محسوبة (CALCULATED)',
    requiredProgress: 'تم إدخال {provided} من أصل {required} مدخلات مطلوبة.',
    meaningH2: 'ماذا تعني هذه النتيجة',
    meaningBody: 'هي تقدير حتمي أولي للماء اليومي بناءً على وزنك ونشاطك. وهي ليست هدفًا طبيًا ولا خطة علاج ولا ضمانًا لأي نتيجة صحية.',
    doesNotH2: 'ما لا تعنيه هذه النتيجة',
    doesNotBody: 'لا تشخّص ولا تصف دواءً لحالتك، ولا تستبدل مختصًا مؤهلًا. تختلف احتياجات الماء مع المناخ والنظام وشدة النشاط والحمل والحالات بما لا يغطيه هذا التقدير.',
    formulaSummary: 'المعادلة والأدلة والافتراضات',
    interpretationSummary: 'تفسير رقمك',
    unitsSummary: 'الوحدات والتقريب',
    formulaLines: [
      'افتراض حسابي: 35 مل لكل كيلوجرام.',
      'معامل النشاط = 1 + (معامل النشاط − 1) × 0.1 (تقريب خشن، يختاره المستخدم، غير مقاس).',
      'افتراض محدد صُمم في التطبيق (SPEC v3) ولا يخضع لمراجعة سريرية أو تحقق خارجي.',
    ],
    interpretationLines: [
      'استخدمه كمرجع أولي؛ المناخ والنظام قد يحركانه كثيرًا في الاتجاهين.',
      'يأتي الماء من المشروبات والطعام؛ لا يحسب هذا التقدير أيًا منهما تلقائيًا.',
      'الحالات الصحية والحمل وشدة التعرق تغير احتياجك الفعلي.',
    ],
    unitsLines: [
      'متري: الوزن بالكيلوجرام. إمبراطوري: الوزن بالرطل. الوزن الذي يستلمه المحرك هو كجم فقط؛ التحويل حدود عرض فقط.',
      'يُقرّب الوزن المعروض إلى منزلة عشرية واحدة؛ عند الإدخال بالرطل يُحوَّل قبل الحساب.',
      'يُقرّب التقدير إلى منزلتين عشريتين للتر؛ وتُعرض المليلترات مقربة.',
    ],
    warningNotMedical: 'هذا تقدير حتمي أولي، وليس استشارة طبية ولا وصفة. زِد أو أنقص حسب المناخ والعطش وإرشاد مختص.',
    scenariosHeading: 'مقارنة مستويات النشاط عند وزنك الحالي',
    scenariosNote: 'كل قيمة يُعاد حسابها بالمحرك نفسه بوزنك الحالي. تغيير مستوى النشاط أدناه يغيّر التقدير المحدد فقط.',
    selectedLabel: 'المحدد',
    interpretation: 'عند وزن {weight}، يقدّر المحرك نفسه {low} لتر/يوم عند المستوى الأساسي، و{mid} لتر/يوم عند المستوى المتوسط، و{high} لتر/يوم عند النشاط العالي جدًا. هذا مرجع أولي وليس احتياجًا فرديًا.',
    weightUnitMetric: 'كجم',
    weightUnitImperial: 'رطل',
    adviceHeading: 'استخدام هذا التقدير',
    advice: 'اعتبره نقطة بداية وعدّله حسب المناخ والتعرق والعطش وأي إرشاد مختص. الطعام والمشروبات الأخرى تساهم أيضًا في سوائل اليوم.',
    caution: 'إذا كنت حاملًا أو مرضعًا، أو تعاني من مرض كلوي أو قلبي، أو تتناول مدرات البول، فاستشر مختصًا مؤهلًا قبل تغيير تناول السوائل.',
    usFlOz: 'أونصة سائلة أمريكية',
  },
} as const;

export default function WaterIntakePilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const text = translations[locale];
  const direction = isRtl ? 'rtl' : 'ltr';

  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
  const [activityLevel, setActivityLevel] = useState<(typeof activities)[number]>(1.2);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<WaterIntakeOutput | null>(null);
  const [resultEnvelope, setResultEnvelope] = useState<ToolResultEnvelopeV4<unknown, unknown> | null>(null);

  const values: Partial<WaterIntakeInput> = {
    weightKg: weightKg === undefined || !Number.isFinite(weightKg) ? undefined : weightKg,
    activityLevel,
  };
  const progress = countProvidedWaterIntakeFields({ weightKg: values.weightKg, activityLevel: values.activityLevel });
  const requiredProgressText = text.requiredProgress
    .replace('{provided}', String(progress.provided))
    .replace('{required}', String(progress.required));
  const recalculate = (announceErrors: boolean, nextWeightKg: number | undefined = weightKg) => {
    const createdAt = new Date().toISOString();
    const resolved = nextWeightKg === undefined || !Number.isFinite(nextWeightKg)
      ? undefined
      : nextWeightKg;
    if (resolved === undefined) {
      setResult(null);
      if (announceErrors) {
        setError(text.invalid);
        setResultEnvelope(adaptWaterIntakeV6InvalidToV4({ ...values, weightKg: undefined }, text.invalid, createdAt));
        setStatus('error');
      } else {
        setError('');
        setResultEnvelope(adaptWaterIntakeV6UnavailableToV4({ ...values, weightKg: undefined }, 'partial', ['weightKg'], createdAt));
        setStatus('partial');
      }
      return;
    }
    if (resolved < RECALC_WEIGHT_MIN || resolved > RECALC_WEIGHT_MAX) {
      setResult(null);
      setError(text.errorGuidance);
      setResultEnvelope(adaptWaterIntakeV6InvalidToV4({ ...values, weightKg: resolved }, text.errorGuidance, createdAt));
      setStatus('error');
      return;
    }
    try {
      const calculated = calculateWaterIntakeV6({
        weightKg: resolved,
        activityLevel,
      });
      setResultEnvelope(adaptWaterIntakeV6ToV4(
        { weightKg: resolved, activityLevel },
        calculated,
        createdAt,
      ));
      setResult(calculated);
      setStatus('ready');
      setError('');
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : '';
      const localized = /weight must be positive/i.test(message) ? text.invalid : text.errorGuidance;
      setError(localized);
      setResult(null);
      setResultEnvelope(adaptWaterIntakeV6InvalidToV4({ ...values, weightKg: resolved }, localized, createdAt));
      setStatus('error');
    }
  };

  useEffect(() => {
    recalculate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightKg, activityLevel]);

  const scenarioData = result && values.weightKg !== undefined
    ? buildWaterScenarios(values.weightKg)
    : [];
  const scenarioLiters = Object.fromEntries(
    scenarioData.map((scenario) => [String(scenario.activityLevel), scenario.liters])
  ) as Record<string, number>;
  const displayWeight = values.weightKg !== undefined
    ? `${canonicalToDisplay(values.weightKg, 'kg', unitSystem, 1)} ${
      unitSystem === 'metric' ? text.weightUnitMetric : text.weightUnitImperial
    }`
    : '';
  const interpretationText = result && values.weightKg !== undefined
    ? text.interpretation
      .replace('{weight}', displayWeight)
      .replace('{low}', String(scenarioLiters['1'] ?? ''))
      .replace('{mid}', String(scenarioLiters['1.2'] ?? ''))
      .replace('{high}', String(scenarioLiters['1.4'] ?? ''))
    : '';
  const resultText = result
    ? `${text.result}: ${result.dailyWaterLiters} L/day (${Math.round(result.dailyWaterLiters * 1000)} mL)${
      unitSystem === 'imperial'
        ? ` (${litersToUsFlOz(result.dailyWaterLiters)} ${text.usFlOz})`
        : ''
    }`
    : '';

  const results = (
    <div dir={direction}>
      <p data-testid="water-status" role="status" aria-live="polite">{text.status[status]}</p>
      <p data-testid="water-required-progress">{requiredProgressText}</p>
      {status === 'error' ? <p>{text.errorGuidance}</p> : null}
      <p data-testid="water-caution">{text.caution}</p>
      {!result && status !== 'error' && values.weightKg === undefined ? <div>
        <p>{text.empty}</p>
        <ul aria-label={text.required}><li>{text.weight}</li></ul>
      </div> : null}
      {result ? <div>
        <p data-testid="water-result-type">{text.calculatedType}</p>
        <p data-testid="water-result" aria-live="polite">{resultText}</p>

        <section aria-labelledby="water-scenarios-heading">
          <h2 id="water-scenarios-heading">{text.scenariosHeading}</h2>
          <p>{text.scenariosNote}</p>
          <ul data-testid="water-scenarios">
            {scenarioData.map((scenario) => {
              const selected = scenario.activityLevel === activityLevel;
              return (
                <li
                  key={scenario.activityLevel}
                  data-testid={`water-scenario-${scenario.activityLevel}`}
                  data-selected={selected ? 'true' : 'false'}
                >
                  {scenario.liters} L/day ({Math.round(scenario.liters * 1000)} mL)
                  {selected ? ` (${text.selectedLabel})` : ''}
                </li>
              );
            })}
          </ul>
          <p data-testid="water-interpretation">{interpretationText}</p>
          <h3>{text.adviceHeading}</h3>
          <p data-testid="water-advice">{text.advice}</p>
        </section>

        <h2>{text.meaningH2}</h2>
        <p>{text.meaningBody}</p>
        <h2>{text.doesNotH2}</h2>
        <p>{text.doesNotBody}</p>

        <details data-testid="water-details-formula">
          <summary>{text.formulaSummary}</summary>
          <ul>{text.formulaLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
        <details data-testid="water-details-interpretation">
          <summary>{text.interpretationSummary}</summary>
          <ul>{text.interpretationLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
        <details data-testid="water-details-units">
          <summary>{text.unitsSummary}</summary>
          <ul>{text.unitsLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>

        <ul><li data-testid="water-not-medical-warning">{text.warningNotMedical}</li></ul>
      </div> : null}
    </div>
  );

  const activityOptions = activities.map((value, index) => (
    <option key={value} value={value}>{text.activities[index]} ({value})</option>
  ));

  const renderedInputs = (
    <div dir={direction}>
      <DynamicSliderField
        id="water-weight"
        label={unitSystem === 'metric' ? text.weightMetric : text.weightImperial}
        unitSystem={unitSystem}
        dir={direction}
        locale={locale}
        value={weightKg}
        canonicalUnit="kg"
        bounds={WEIGHT_BOUNDS}
        onChange={(v) => { setWeightKg(v); setStatus('partial'); setError(''); setResult(null); setResultEnvelope(null); }}
        dataTestId="water-weight"
      />
      <label className="grid gap-1">{text.activity}
        <select data-testid="water-activity" aria-label={text.activity} value={activityLevel} onChange={(event) => { setActivityLevel(Number(event.target.value) as (typeof activities)[number]); setError(''); setResult(null); setResultEnvelope(null); setStatus('partial'); }}>
          {activityOptions}
        </select>
      </label>
      <button data-testid="water-calculate" type="button" onClick={() => recalculate(true)}>{text.calculate}</button>
    </div>
  );

  return (
    <main className={styles.shell}>
    <GeniusToolTemplateV4
      toolId="mrx.tool.water-intake"
      title={text.title}
      description={text.description}
      locale={locale}
      direction={direction}
      unitSystem={unitSystem}
      status={status}
      inputCompleteness={resultEnvelope?.inputSnapshot.completeness}
      resultEnvelope={resultEnvelope}
      inputs={renderedInputs}
      results={results}
      errors={status === 'error' && error ? [error] : []}
      riskTier="LOW"
      aiStatus="NOT_CONFIGURED"
    />
    </main>
  );
}
