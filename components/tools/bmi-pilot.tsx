'use client';

import React, { useEffect, useState } from 'react';
import GeniusToolTemplateV4 from '@/lib/templates/genius-tool-template.v4';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { calculateBmi } from '@/lib/tools/engines/bmi.v6';
import type { BmiInput, BmiOutput } from '@/lib/tools/engines/bmi.v6';
import {
  adaptBmiV6InvalidToV4,
  adaptBmiV6ToV4,
  adaptBmiV6UnavailableToV4,
} from '@/lib/engines/core/v4/adapter.bmi.v4';
import type { ToolResultEnvelopeV4 } from '@/lib/engines/core/v4/contracts.v4';
import {
  countProvidedBmiFields,
} from '@/lib/engines/core/v4/profiles/bmi-input-profile.v4';
import {
  resolveToolPilotPresentationStateV4,
} from '@/lib/engines/core/v4/profiles/tool-pilot-state.v4';
import {
  canonicalToDisplay,
  DynamicSliderField,
  type SliderBoundsSet,
} from './dynamic-slider-field';
import {
  bmiBoundaryGap,
  buildBmiScenarios,
} from '@/lib/tools/r5/bmi-insights';
import styles from './tool-pilot-v4.module.css';


type Field = 'weightKg' | 'heightCm';
const requiredFields: Field[] = ['weightKg', 'heightCm'];

const WEIGHT_BOUNDS: SliderBoundsSet = {
  metric: { min: 30, max: 300, step: 0.5, precision: 1, unit: 'kg' },
  // 66.2 lb = 30.03 kg and 661.3 lb = 299.96 kg: both stops convert inside
  // the canonical 30-300 kg range, so the slider can never emit an invalid
  // canonical value from its own endpoints.
  imperial: { min: 66.2, max: 661.3, step: 0.1, precision: 1, unit: 'lb' },
};

const HEIGHT_BOUNDS: SliderBoundsSet = {
  metric: { min: 100, max: 250, step: 0.5, precision: 1, unit: 'cm' },
  // 39.4 in = 100.08 cm and 98.4 in = 249.94 cm: same canonical alignment.
  imperial: { min: 39.4, max: 98.4, step: 0.1, precision: 1, unit: 'in' },
};

const translations = {
  en: {
    title: 'Body Mass Index (BMI)',
    description: 'Deterministic BMI calculation: screening, not diagnosis.',
    weight: 'Weight',
    weightImperial: 'Weight (lb)',
    weightMetric: 'Weight (kg)',
    height: 'Height',
    heightImperial: 'Height (in)',
    heightMetric: 'Height (cm)',
    calculate: 'Calculate',
    empty: 'Enter your weight and height to begin.',
    partial: 'Missing required fields',
    required: 'Required inputs',
    status: { idle: 'Waiting for inputs', partial: 'Inputs incomplete', ready: 'Calculation complete', error: 'Calculation unavailable' },
    calculatedType: 'Result type: CALCULATED',
    requiredProgress: '{provided} of {required} required inputs provided.',
    bmi: 'BMI',
    error: 'Check the entered values. No result was produced.',
    errorGuidance: 'Enter a positive weight between 30 and 300 kg (66.2-661.3 lb) and a height between 100 and 250 cm (39.4-98.4 in), then recalculate.',
    meaningH2: 'What this result means',
    meaningBody: 'It is a deterministic screening estimate based on the height and weight you entered. It is not a measurement, a diagnosis, a treatment plan, or a prediction of any health outcome.',
    doesNotH2: 'What this result does not mean',
    doesNotBody: 'It does not diagnose, treat or prescribe anything, and it does not replace a qualified professional. BMI does not distinguish fat from muscle, ignores age, sex, body composition and clinical conditions, and it is not a personal assessment of your health.',
    formulaSummary: 'Formula, evidence and categories',
    interpretationSummary: 'Interpreting your number',
    unitsSummary: 'Units and rounding',
    formulaLines: [
      'BMI = weight (kg) ÷ height squared (m), rounded to one decimal.',
      'Categories: below 18.5 underweight, 18.5-24.9 normal, 25-29.9 overweight, 30 and above obesity.',
    ],
    interpretationLines: [
      'BMI is a population screening measure, not a personal assessment.',
      'It does not account for body composition, so a muscular athlete can read as overweight.',
      'Muscle gain, age, sex and clinical conditions change what a single BMI value means to you.',
    ],
    unitsLines: [
      'Metric: weight in kilograms and height in centimetres.',
      'Imperial: weight in pounds and height in inches. The engine receives kg/cm only; conversions are display-boundary only.',
      'Displayed values are rounded to one decimal; switching systems never converts the stored canonical value twice.',
    ],
    evidenceLink: 'CDC BMI categories (official guidance)',
    evidenceScopeLimits: 'The CDC guidance describes adult BMI as a screening measure; it does not turn this number into a diagnosis or a measurement.',
    warningNotADiagnosis: 'BMI screens for weight status at population level; it is not a personal diagnosis, a treatment, or a measurement, and it does not distinguish fat from muscle.',
    categoryNames: { underweight: 'underweight', normal: 'normal weight', overweight: 'overweight', obese: 'obesity' },
    insightHeading: 'Interpretation for your category',
    insights: {
      underweight: 'Your result is in the underweight screening range. This can reflect low body weight, but it does not identify the cause and is not a diagnosis.',
      normal: 'Your result is in the normal-weight screening range. This means your weight is inside the population screening band for your height; it does not confirm body composition or health.',
      overweight: 'Your result is in the overweight screening range. BMI cannot tell whether the extra weight is muscle, fat or fluid, so this is not a diagnosis.',
      obese: 'Your result is in the obesity screening range. This is a screening signal, not a diagnosis; a professional assessment would be needed to interpret it.',
    },
    adviceHeading: 'General next steps',
    advice: {
      underweight: 'Consider discussing gradual weight gain, nutrition and any underlying causes with a qualified professional. Do not use this number to self-diagnose.',
      normal: 'Maintaining current habits is reasonable for many people. Use BMI as one screening signal alongside how you feel and other health measures.',
      overweight: 'Consider sustainable activity and nutrition changes, and discuss them with a qualified professional if you want personal guidance. BMI alone does not determine what to change.',
      obese: 'Consider a professional assessment and a gradual, sustainable plan. This result does not prescribe treatment or diagnose a condition.',
    },
    adultApplicability: 'Adult screening only (18+): the formula and cut-offs are not validated for children, pregnancy or clinical populations.',
    boundaryHeading: 'Distance to category boundaries',
    boundaryBetween: 'Your BMI is {below} points above the lower boundary ({lower}) and {above} points below the upper boundary ({upper}).',
    boundaryUpperOnly: 'Your BMI is {above} points below the {upper} boundary.',
    boundaryAboveOnly: 'Your BMI is at or above the {lower} boundary.',
    whatIfHeading: 'What-If: same height, different weight',
    whatIfNote: 'Each row is recalculated by the same BMI engine. This is a deterministic comparison, not a forecast.',
    whatIfWeight: 'Weight',
    whatIfBmi: 'BMI',
    whatIfCategory: 'Category',
    currentLabel: 'Current',
  },
  ar: {
    title: 'مؤشر كتلة الجسم (BMI)',
    description: 'حساب حتمي لمؤشر كتلة الجسم: فحص، وليس تشخيصًا.',
    weight: 'الوزن',
    weightImperial: 'الوزن (رطل)',
    weightMetric: 'الوزن (كجم)',
    height: 'الطول',
    heightImperial: 'الطول (بوصة)',
    heightMetric: 'الطول (سم)',
    calculate: 'احسب',
    empty: 'أدخل وزنك وطولك للبدء.',
    partial: 'الحقول المطلوبة الناقصة',
    required: 'المدخلات المطلوبة',
    status: { idle: 'بانتظار المدخلات', partial: 'المدخلات غير مكتملة', ready: 'اكتمل الحساب', error: 'تعذر الحساب' },
    calculatedType: 'نوع النتيجة: محسوبة (CALCULATED)',
    requiredProgress: 'تم إدخال {provided} من أصل {required} مدخلات مطلوبة.',
    bmi: 'مؤشر كتلة الجسم',
    error: 'تحقق من القيم المدخلة. لم تُنتج نتيجة.',
    errorGuidance: 'أدخل وزنًا إيجابيًا بين 30 و300 كجم (66.2–661.3 رطل) وطولًا بين 100 و250 سم (39.4–98.4 بوصة) ثم أعد الحساب.',
    meaningH2: 'ماذا تعني هذه النتيجة',
    meaningBody: 'هي تقدير فحص حتمي بناءً على الوزن والطول اللذين أدخلتهما. وهي ليست قياسًا ولا تشخيصًا ولا خطة علاج ولا تنبؤًا بأي نتيجة صحية.',
    doesNotH2: 'ما لا تعنيه هذه النتيجة',
    doesNotBody: 'لا تشخّص ولا تعالج ولا تصف دواءً ولا تستبدل مختصًا مؤهلًا. لا يميز مؤشر كتلة الجسم بين الدهون والعضلات، ويتجاهل العمر والجنس وتكوين الجسم والحالات السريرية، وليس تقييمًا شخصيًا لصحتك.',
    formulaSummary: 'المعادلة والأدلة والفئات',
    interpretationSummary: 'تفسير رقمك',
    unitsSummary: 'الوحدات والتقريب',
    formulaLines: [
      'مؤشر كتلة الجسم = الوزن (كجم) ÷ مربع الطول (م)، مع تقريب الخانة العشرية الواحدة.',
      'الفئات: أقل من 18.5 نحافة، 18.5-24.9 وزن طبيعي، 25-29.9 زيادة في الوزن، 30 فأعلى سمنة.',
    ],
    interpretationLines: [
      'مؤشر كتلة الجسم مقياس فحص للسكان، وليس تقييمًا شخصيًا.',
      'لا يميز بين الدهون والعضلات، لذلك قد يظهر الرياضي العضلي كمن يعاني زيادة الوزن.',
      'تغيّر اكتساب العضلات والعمر والجنس والحالات السريرية معنى رقم واحد بالنسبة لك.',
    ],
    unitsLines: [
      'متري: الوزن بالكيلوجرام والطول بالسنتيمتر.',
      'إمبراطوري: الوزن بالرطل والطول بالبوصة. يستلم المحرك كيلوجرام/سنتيمتر فقط؛ التحويل حدود عرض فقط.',
      'تُقرب القيم المعروضة إلى منزلة عشرية واحدة؛ تبديل النظام لا يحول القيمة الكانونية مرتين.',
    ],
    evidenceLink: 'فئات مؤشر كتلة الجسم من CDC (إرشاد رسمي)',
    evidenceScopeLimits: 'يصف إرشاد CDC مؤشر كتلة الجسم للبالغين بأنه مقياس فحص؛ ولا يحوّل هذا الرقم إلى تشخيص أو قياس.',
    warningNotADiagnosis: 'يفحص مؤشر كتلة الجسم حالة الوزن على مستوى السكان؛ وليس تشخيصًا شخصيًا أو علاجًا أو قياسًا، ولا يميز بين الدهون والعضلات.',
    categoryNames: { underweight: 'نحافة', normal: 'وزن طبيعي', overweight: 'زيادة في الوزن', obese: 'سمنة' },
    insightHeading: 'تفسير فئتك',
    insights: {
      underweight: 'نتيجتك ضمن نطاق نقص الوزن الفحصي. قد تعكس انخفاض وزن الجسم، لكنها لا تحدد السبب وليست تشخيصًا.',
      normal: 'نتيجتك ضمن نطاق الوزن الطبيعي الفحصي. هذا يعني أن وزنك داخل نطاق الفحص السكاني لطولك، ولا يؤكد تكوين الجسم أو الحالة الصحية.',
      overweight: 'نتيجتك ضمن نطاق زيادة الوزن الفحصي. لا يستطيع مؤشر كتلة الجسم تحديد ما إذا كانت الزيادة عضلات أم دهونًا أم سوائل، لذا ليست تشخيصًا.',
      obese: 'نتيجتك ضمن نطاق السمنة الفحصي. هذه إشارة فحص وليست تشخيصًا؛ يلزم تقييم مختص لتفسيرها.',
    },
    adviceHeading: 'خطوات عامة تالية',
    advice: {
      underweight: 'فكر في مناقشة زيادة الوزن التدريجية والتغذية وأي أسباب كامنة مع مختص مؤهل. لا تستخدم هذا الرقم لتشخيص نفسك.',
      normal: 'الحفاظ على عاداتك الحالية منطقي لكثير من الناس. استخدم مؤشر كتلة الجسم كإشارة فحص واحدة إلى جانب شعورك ومؤشرات صحية أخرى.',
      overweight: 'فكر في تغييرات مستدامة في النشاط والتغذية، وناقشها مع مختص مؤهل إذا أردت إرشادًا شخصيًا. مؤشر كتلة الجسم وحده لا يحدد ما يجب تغييره.',
      obese: 'فكر في تقييم مختص وخطة تدريجية مستدامة. هذه النتيجة لا تصف علاجًا ولا تشخص حالة.',
    },
    adultApplicability: 'فحص للبالغين فقط (18+): المعادلة والفئات غير محققة للأطفال أو الحمل أو الفئات السريرية.',
    boundaryHeading: 'المسافة إلى حدود الفئات',
    boundaryBetween: 'مؤشر كتلة جسمك أعلى من الحد الأدنى ({lower}) بمقدار {below} نقاط، وأقل من الحد الأعلى ({upper}) بمقدار {above} نقاط.',
    boundaryUpperOnly: 'مؤشر كتلة جسمك أقل من حد {upper} بمقدار {above} نقاط.',
    boundaryAboveOnly: 'مؤشر كتلة جسمك عند حد {lower} أو أعلى.',
    whatIfHeading: 'ماذا لو: نفس الطول ووزن مختلف',
    whatIfNote: 'كل صف يُعاد حسابه بالمحرك نفسه لمؤشر كتلة الجسم. هذه مقارنة حتمية وليست تنبؤًا.',
    whatIfWeight: 'الوزن',
    whatIfBmi: 'مؤشر كتلة الجسم',
    whatIfCategory: 'الفئة',
    currentLabel: 'الحالي',
  },
} as const;

export default function BmiPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const text = translations[locale];
  const direction = isRtl ? 'rtl' : 'ltr';

  // Kept at the recommended calculator defaults (70 kg / 175 cm) to preserve
  // the currently published live behavior and its retained test contract.
  const [input, setInput] = useState<Partial<BmiInput>>({ weightKg: 70, heightCm: 175 });
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<BmiOutput | null>(null);
  const [resultEnvelope, setResultEnvelope] = useState<ToolResultEnvelopeV4<unknown, unknown> | null>(null);

  const progress = countProvidedBmiFields(input);
  const requiredProgressText = text.requiredProgress
    .replace('{provided}', String(progress.provided))
    .replace('{required}', String(progress.required));
  const presentationState = resolveToolPilotPresentationStateV4({
    hasError: status === 'error',
    hasEnvelope: resultEnvelope !== null,
    status: resultEnvelope?.status ?? null,
    completeness: resultEnvelope?.inputSnapshot.completeness ?? null,
    hasResult: result !== null,
  });

  const RECALC_WEIGHT_MIN = 30;
  const RECALC_WEIGHT_MAX = 300;
  const RECALC_HEIGHT_MIN = 100;
  const RECALC_HEIGHT_MAX = 250;

  const isWithinLegalBounds = (values: Partial<BmiInput>): boolean => {
    if (values.weightKg !== undefined && (values.weightKg < RECALC_WEIGHT_MIN || values.weightKg > RECALC_WEIGHT_MAX)) {
      return false;
    }
    if (values.heightCm !== undefined && (values.heightCm < RECALC_HEIGHT_MIN || values.heightCm > RECALC_HEIGHT_MAX)) {
      return false;
    }
    return true;
  };

  const recalculate = (values: Partial<BmiInput>) => {
    const createdAt = new Date().toISOString();
    const both = values.weightKg !== undefined && values.heightCm !== undefined;
    if (!both) {
      const missing = requiredFields.filter((field) => values[field] === undefined);
      setResultEnvelope(adaptBmiV6UnavailableToV4(
        values,
        missing.length === requiredFields.length ? 'empty' : 'partial',
        missing,
        createdAt,
      ));
      setResult(null);
      setStatus('partial');
      setError('');
      return;
    }
    if (!isWithinLegalBounds(values)) {
      setError(text.error);
      setResult(null);
      setResultEnvelope(adaptBmiV6InvalidToV4(values, text.error, createdAt));
      setStatus('error');
      return;
    }
    try {
      const calculated = calculateBmi({
        weightKg: values.weightKg as number,
        heightCm: values.heightCm as number,
      });
      setResultEnvelope(adaptBmiV6ToV4(values as BmiInput, calculated, createdAt));
      setResult(calculated);
      setStatus('ready');
      setError('');
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : '';
      setError(/positive finite numbers/i.test(message) ? text.error : text.error);
      setResultEnvelope(adaptBmiV6InvalidToV4(values, text.error, createdAt));
      setResult(null);
      setStatus('error');
    }
  };

  useEffect(() => {
    recalculate(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const updateField = (field: Field, rawValue: number | undefined) => {
    setError('');
    setResult(null);
    setResultEnvelope(null);
    setStatus('partial');
    setInput((previous) => {
      const next = { ...previous };
      if (rawValue === undefined) {
        delete next[field];
      } else {
        next[field] = rawValue;
      }
      return next;
    });
  };

  const missing = requiredFields.filter((field) => input[field] === undefined);
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lb';
  const formatGap = (value: number) => (Math.round(value * 10) / 10).toFixed(1);
  const boundary = result ? bmiBoundaryGap(result.bmi) : null;
  let boundaryText = '';
  if (result && boundary) {
    if (boundary.lower !== null && boundary.upper !== null) {
      boundaryText = text.boundaryBetween
        .replace('{below}', formatGap(result.bmi - boundary.lower))
        .replace('{above}', formatGap(boundary.upper - result.bmi))
        .replace('{lower}', formatGap(boundary.lower))
        .replace('{upper}', formatGap(boundary.upper));
    } else if (boundary.upper !== null) {
      boundaryText = text.boundaryUpperOnly
        .replace('{above}', formatGap(boundary.upper - result.bmi))
        .replace('{upper}', formatGap(boundary.upper));
    } else if (boundary.lower !== null) {
      boundaryText = text.boundaryAboveOnly.replace('{lower}', formatGap(boundary.lower));
    }
  }
  const scenarios = result && input.weightKg !== undefined && input.heightCm !== undefined
    ? buildBmiScenarios(input.weightKg, input.heightCm)
    : [];
  const results = (
    <div dir={direction}>
      <p data-testid="bmi-status" role="status" aria-live="polite">{text.status[status]}</p>
      <p data-testid="bmi-required-progress">{requiredProgressText}</p>
      {status === 'error' ? <p>{text.errorGuidance}</p> : null}
      {!result && status !== 'error' ? <div>
        <p>{missing.length === requiredFields.length ? text.empty : text.partial}</p>
        {presentationState === 'UNAVAILABLE' ? <p>{text.error}</p> : null}
        {missing.length > 0 ? <ul aria-label={text.required}>{missing.map((field) => <li key={field}>{field === 'weightKg' ? text.weight : text.height}</li>)}</ul> : null}
      </div> : null}
      {result ? <div>
        <p data-testid="bmi-result-type">{text.calculatedType}</p>
        <p data-testid="bmi-result">{text.bmi}: {result.bmi} ({text.categoryNames[result.category]})</p>

        <section aria-labelledby="bmi-insight-heading">
          <h2 id="bmi-insight-heading">{text.insightHeading}</h2>
          <p data-testid="bmi-category-interpretation">{text.insights[result.category]}</p>
          <p data-testid="bmi-adult-applicability">{text.adultApplicability}</p>
          <h3>{text.boundaryHeading}</h3>
          <p data-testid="bmi-boundary-gap">{boundaryText}</p>
        </section>

        <section aria-labelledby="bmi-what-if-heading">
          <h2 id="bmi-what-if-heading">{text.whatIfHeading}</h2>
          <p>{text.whatIfNote}</p>
          <table data-testid="bmi-what-if">
            <thead>
              <tr>
                <th scope="col">{text.whatIfWeight}</th>
                <th scope="col">{text.whatIfBmi}</th>
                <th scope="col">{text.whatIfCategory}</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={scenario.weightKg} data-testid={`bmi-what-if-row-${scenario.weightKg}`}>
                  <td>
                    {canonicalToDisplay(scenario.weightKg, 'kg', unitSystem, 1)} {weightUnit}
                    {scenario.weightKg === input.weightKg ? ` (${text.currentLabel})` : ''}
                  </td>
                  <td>{scenario.bmi}</td>
                  <td>{text.categoryNames[scenario.category]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="bmi-advice-heading">
          <h2 id="bmi-advice-heading">{text.adviceHeading}</h2>
          <p data-testid="bmi-category-advice">{text.advice[result.category]}</p>
        </section>

        <h2>{text.meaningH2}</h2>
        <p>{text.meaningBody}</p>
        <h2>{text.doesNotH2}</h2>
        <p>{text.doesNotBody}</p>

        <details data-testid="bmi-details-formula">
          <summary>{text.formulaSummary}</summary>
          <ul>{text.formulaLines.map((line) => <li key={line}>{line}</li>)}</ul>
          <p>
            <a href="https://www.cdc.gov/bmi/" target="_blank" rel="noreferrer" className="underline">{text.evidenceLink}</a>
            {' — '}{text.evidenceScopeLimits}
          </p>
        </details>
        <details data-testid="bmi-details-interpretation">
          <summary>{text.interpretationSummary}</summary>
          <ul>{text.interpretationLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
        <details data-testid="bmi-details-units">
          <summary>{text.unitsSummary}</summary>
          <ul>{text.unitsLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>

        <ul><li data-testid="bmi-not-diagnosis-warning">{text.warningNotADiagnosis}</li></ul>
      </div> : null}
    </div>
  );

  return (
    <main className={styles.shell}>
    <GeniusToolTemplateV4
      toolId="mrx.tool.bmi"
      title={text.title}
      description={text.description}
      locale={locale}
      direction={direction}
      unitSystem={unitSystem}
      status={status}
      inputCompleteness={resultEnvelope?.inputSnapshot.completeness}
      resultEnvelope={resultEnvelope}
      inputs={
        <div dir={direction}>
          <DynamicSliderField
            id="weightKg"
            label={unitSystem === 'metric' ? text.weightMetric : text.weightImperial}
            unitSystem={unitSystem}
            dir={direction}
            locale={locale}
            value={input.weightKg}
            canonicalUnit="kg"
            bounds={WEIGHT_BOUNDS}
            onChange={(v) => updateField('weightKg', v)}
          />
          <DynamicSliderField
            id="heightCm"
            label={unitSystem === 'metric' ? text.heightMetric : text.heightImperial}
            unitSystem={unitSystem}
            dir={direction}
            locale={locale}
            value={input.heightCm}
            canonicalUnit="cm"
            bounds={HEIGHT_BOUNDS}
            onChange={(v) => updateField('heightCm', v)}
          />
          <button type="button" onClick={() => recalculate({ ...input })}>{text.calculate}</button>
        </div>
      }
      results={results}
      errors={status === 'error' && error ? [error] : []}
      riskTier="LOW"
      aiStatus="NOT_CONFIGURED"
    />
    </main>
  );
}

