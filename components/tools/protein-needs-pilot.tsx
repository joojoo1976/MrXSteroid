'use client';

import React, { useEffect, useState } from 'react';
import GeniusToolTemplateV4 from '@/lib/templates/genius-tool-template.v4';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { calculateProteinNeedsV6 } from '@/lib/tools/engines/protein-needs.v6';
import type { ProteinNeedsInput, ProteinNeedsOutput } from '@/lib/tools/engines/protein-needs.v6';
import {
  adaptProteinNeedsV6InvalidToV4,
  adaptProteinNeedsV6ToV4,
  adaptProteinNeedsV6UnavailableToV4,
} from '@/lib/engines/core/v4/adapter.protein-needs.v4';
import type { ToolResultEnvelopeV4 } from '@/lib/engines/core/v4/contracts.v4';
import {
  countProvidedProteinNeedsFields,
} from '@/lib/engines/core/v4/profiles/protein-needs-input-profile.v4';
import {
  canonicalToDisplay,
  DynamicSliderField,
  type SliderBoundsSet,
} from './dynamic-slider-field';
import {
  buildProteinScenarios,
  proteinGoalAdviceKey,
} from '@/lib/tools/r5/protein-insights';
import styles from './tool-pilot-v4.module.css';


const activities = [1, 1.1, 1.2, 1.3, 1.4] as const;
type Goal = 'maintain' | 'bulk' | 'cut';

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
    title: 'Protein Needs Estimate',
    description: 'Deterministic protein estimate from weight, goal and activity. Not medical advice.',
    weight: 'Weight',
    weightImperial: 'Weight (lb)',
    weightMetric: 'Weight (kg)',
    goal: 'Goal',
    maintain: 'Maintain',
    bulk: 'Build muscle',
    cut: 'Weight loss',
    activity: 'Activity level',
    activities: ['Baseline', 'Light', 'Moderate', 'Active', 'Very active'],
    calculate: 'Calculate',
    empty: 'Enter your weight to begin.',
    partial: 'Missing required fields',
    required: 'Required inputs',
    status: { idle: 'Waiting for inputs', partial: 'Inputs incomplete', ready: 'Calculation complete', error: 'Calculation unavailable' },
    result: 'Estimated daily protein',
    formula: 'Heuristic: 1.6 g/kg maintenance, 2.0 g/kg muscle gain, 2.2 g/kg weight loss, plus a small activity adjustment.',
    invalid: 'Enter a valid positive body weight.',
    errorGuidance: 'Enter a positive weight between 30 and 300 kg (66.2-661.3 lb), then recalculate.',
    disclaimer: 'General estimate; it may not fit every health condition or individual need. Not medical advice.',
    calculatedType: 'Result type: CALCULATED',
    requiredProgress: '{provided} of {required} required inputs provided.',
    meaningH2: 'What this result means',
    meaningBody: 'It is a deterministic estimate of your daily protein intake from your weight, goal and activity level. It is not a medical target, a prescription, or a guarantee about any health outcome.',
    doesNotH2: 'What this result does not mean',
    doesNotBody: 'It does not diagnose, prescribe or personalize nutrition for your conditions, and it does not replace a qualified professional. Protein needs vary with conditions, diet, age, sex and body composition beyond what this heuristic captures.',
    formulaSummary: 'Formula, evidence and assumptions',
    interpretationSummary: 'Interpreting your number',
    unitsSummary: 'Units and rounding',
    formulaLines: [
      'Heuristic: 1.6 g/kg (maintain), 2.0 g/kg (bulk), 2.2 g/kg (cut).',
      'Activity factor = 1 + (activityLevel − 1) × 0.05 (coarse, user-selected, not measured).',
      'Application-designed SPEC v3 convention; it is not externally validated or clinically reviewed.',
    ],
    interpretationLines: [
      'Use this as a general reference, not as a prescription.',
      'Goal and activity are coarse inputs; they do not capture conditions, age, sex, diet or body composition.',
      'Protein is protein: food sources, dietary pattern and kidney health all matter to individuals.',
    ],
    unitsLines: [
      'Metric: weight in kilograms. Imperial: weight in pounds. The engine receives kg only; conversions are display-boundary only.',
      'Displayed weight is rounded to one decimal; imperial entries convert back before calculation.',
      'The estimate is rounded to a whole gram.',
    ],
    warningNotMedical: 'This is a deterministic general estimate, not medical advice and not a prescription. Use it as a reference, not a target set by a clinician.',
    scenariosHeading: 'Goal comparison at your current weight and activity',
    scenariosNote: 'Every value is recalculated by the same engine with your current weight and activity level. Changing the goal below changes only the selected target.',
    selectedLabel: 'Selected',
    interpretation: 'At {weight} with activity {activity}, the same engine estimates {maintain} g/day to maintain, {bulk} g/day to build muscle and {cut} g/day for weight loss. Your selected goal is {selected} g/day.',
    weightUnitMetric: 'kg',
    weightUnitImperial: 'lb',
    adviceHeading: 'What this means for your selected goal',
    advice: {
      maintain: 'Spread your daily protein across meals. Total intake and overall diet quality matter more than counting exact timing.',
      bulk: 'A muscle-building target only helps when it supports a small calorie surplus and consistent resistance training; protein alone does not build muscle.',
      cut: 'During a calorie deficit, a higher protein target can help preserve lean mass. Pair it with resistance training and a sustainable rate of loss.',
    },
    caution: 'If you have kidney disease, are pregnant or breastfeeding, or manage a medical condition, ask a qualified professional before changing protein intake.',
  },
  ar: {
    title: 'تقدير احتياج البروتين',
    description: 'تقدير حتمي للبروتين اليومي حسب الوزن والهدف والنشاط. ليس استشارة طبية.',
    weight: 'الوزن',
    weightImperial: 'الوزن (رطل)',
    weightMetric: 'الوزن (كجم)',
    goal: 'الهدف',
    maintain: 'المحافظة',
    bulk: 'زيادة العضلات',
    cut: 'خفض الوزن',
    activity: 'مستوى النشاط',
    activities: ['أساسي', 'خفيف', 'متوسط', 'نشط', 'نشط جدًا'],
    calculate: 'احسب',
    empty: 'أدخل وزنك للبدء.',
    partial: 'الحقول المطلوبة الناقصة',
    required: 'المدخلات المطلوبة',
    status: { idle: 'بانتظار المدخلات', partial: 'المدخلات غير مكتملة', ready: 'اكتمل الحساب', error: 'تعذر الحساب' },
    result: 'التقدير اليومي للبروتين',
    formula: 'افتراض حسابي: 1.6 جم/كجم للمحافظة، 2.0 للزيادة، و2.2 لخفض الوزن، مع تعديل بسيط حسب النشاط.',
    invalid: 'أدخل وزنًا إيجابيًا صالحًا.',
    errorGuidance: 'أدخل وزنًا إيجابيًا بين 30 و300 كجم (66.2–661.3 رطل) ثم أعد الحساب.',
    disclaimer: 'تقدير عام؛ قد لا يناسب كل حالة صحية أو احتياج فردي. ليس استشارة طبية.',
    calculatedType: 'نوع النتيجة: محسوبة (CALCULATED)',
    requiredProgress: 'تم إدخال {provided} من أصل {required} مدخلات مطلوبة.',
    meaningH2: 'ماذا تعني هذه النتيجة',
    meaningBody: 'هي تقدير حتمي للبروتين اليومي بناءً على وزنك وهدفك ونشاطك. وهي ليست هدفًا طبيًا أو وصفًا أو ضمانًا لأي نتيجة صحية.',
    doesNotH2: 'ما لا تعنيه هذه النتيجة',
    doesNotBody: 'لا تشخّص ولا تصف ولا تخصّص التغذية لحالتك، ولا تستبدل مختصًا مؤهلًا. تختلف احتياجات البروتين مع الحالات والنظام والعمر والجنس وتكوين الجسم بما لا يغطيه هذا الافتراض.',
    formulaSummary: 'المعادلة والأدلة والافتراضات',
    interpretationSummary: 'تفسير رقمك',
    unitsSummary: 'الوحدات والتقريب',
    formulaLines: [
      'افتراض حسابي: 1.6 جم/كجم (محافظة)، 2.0 جم/كجم (زيادة)، 2.2 جم/كجم (خفض).',
      'معامل النشاط = 1 + (معامل النشاط − 1) × 0.05 (تقريب خشن، يختاره المستخدم، غير مقاس).',
      'افتراض محدد صُمم في التطبيق (SPEC v3) ولا يخضع لمراجعة سريرية أو تحقق خارجي.',
    ],
    interpretationLines: [
      'استخدم هذا كمرجع عام وليس وصفًا.',
      'الهدف والنشاط مدخلات خشنة؛ لا تلتقط الحالات والعمر والجنس والنظام وتكوين الجسم.',
      'البروتين بروتين: مصادر الغذاء ونمط النظام وصحة الكلى كلها تخص الأفراد.',
    ],
    unitsLines: [
      'متري: الوزن بالكيلوجرام. إمبراطوري: الوزن بالرطل. الوزن الذي يستلمه المحرك هو كجم فقط؛ التحويل حدود عرض فقط.',
      'يُقرّب الوزن المعروض إلى منزلة عشرية واحدة؛ عند الإدخال بالرطل يُحوَّل قبل الحساب.',
      'يُقرّب التقدير إلى جرام كامل.',
    ],
    warningNotMedical: 'هذا تقدير عام حتمي، وليس استشارة طبية ولا وصفة. استخدمه كمرجع، لا كهدف يحدده مختص.',
    scenariosHeading: 'مقارنة الأهداف عند وزنك ونشاطك الحاليين',
    scenariosNote: 'كل قيمة يُعاد حسابها بالمحرك نفسه بوزنك ومستوى نشاطك الحاليين. تغيير الهدف أدناه يغيّر الهدف المحدد فقط.',
    selectedLabel: 'المحدد',
    interpretation: 'عند وزن {weight} ومستوى نشاط {activity}، يقدّر المحرك نفسه {maintain} جم/يوم للمحافظة، و{bulk} جم/يوم لزيادة العضلات، و{cut} جم/يوم لخفض الوزن. هدفك المحدد هو {selected} جم/يوم.',
    weightUnitMetric: 'كجم',
    weightUnitImperial: 'رطل',
    adviceHeading: 'ماذا يعني ذلك لهدفك المحدد',
    advice: {
      maintain: 'وزّع البروتين اليومي على وجباتك. إجمالي المتناول وجودة النظام الغذائي أهم من حساب التوقيت بدقة.',
      bulk: 'هدف زيادة العضلات يفيد فقط مع فائض سعرات صغير وتدريب مقاومة منتظم؛ البروتين وحده لا يبني العضلات.',
      cut: 'خلال عجز السعرات، قد يساعد هدف البروتين الأعلى في الحفاظ على الكتلة الخالية من الدهن. اقرنه بتدريب المقاومة وبمعدل خسارة مستدام.',
    },
    caution: 'إذا كنت تعاني من مرض كلوي، أو كنت حاملًا أو مرضعًا، أو تتابع حالة طبية، فاستشر مختصًا مؤهلًا قبل تغيير تناول البروتين.',
  },
} as const;

export default function ProteinNeedsPilotTool() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const text = translations[locale];
  const direction = isRtl ? 'rtl' : 'ltr';

  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [activityLevel, setActivityLevel] = useState<(typeof activities)[number]>(1.2);
  const [status, setStatus] = useState<'idle' | 'partial' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ProteinNeedsOutput | null>(null);
  const [resultEnvelope, setResultEnvelope] = useState<ToolResultEnvelopeV4<unknown, unknown> | null>(null);

  const values: Partial<ProteinNeedsInput> = {
    weightKg: weightKg === undefined || !Number.isFinite(weightKg) ? undefined : weightKg,
    goal,
    activityLevel,
  };
  const progress = countProvidedProteinNeedsFields({
    weightKg: values.weightKg,
    goal: values.goal,
    activityLevel: values.activityLevel,
  });
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
        setResultEnvelope(adaptProteinNeedsV6InvalidToV4({ ...values, weightKg: undefined }, text.invalid, createdAt));
        setStatus('error');
      } else {
        setError('');
        setResultEnvelope(adaptProteinNeedsV6UnavailableToV4({ ...values, weightKg: undefined }, 'partial', ['weightKg'], createdAt));
        setStatus('partial');
      }
      return;
    }
    if (resolved < RECALC_WEIGHT_MIN || resolved > RECALC_WEIGHT_MAX) {
      setResult(null);
      setError(text.errorGuidance);
      setResultEnvelope(adaptProteinNeedsV6InvalidToV4({ ...values, weightKg: resolved }, text.errorGuidance, createdAt));
      setStatus('error');
      return;
    }
    try {
      const calculated = calculateProteinNeedsV6({
        weightKg: resolved,
        goal,
        activityLevel,
      });
      setResultEnvelope(adaptProteinNeedsV6ToV4(
        { weightKg: resolved, goal, activityLevel },
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
      setResultEnvelope(adaptProteinNeedsV6InvalidToV4({ ...values, weightKg: resolved }, localized, createdAt));
      setStatus('error');
    }
  };

  useEffect(() => {
    recalculate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightKg, goal, activityLevel]);

  const scenarioData = result && values.weightKg !== undefined
    ? buildProteinScenarios({ weightKg: values.weightKg, activityLevel })
    : [];
  const scenarioGrams = Object.fromEntries(
    scenarioData.map((scenario) => [scenario.goal, scenario.grams])
  ) as Partial<Record<Goal, number>>;
  const displayWeight = values.weightKg !== undefined
    ? `${canonicalToDisplay(values.weightKg, 'kg', unitSystem, 1)} ${
      unitSystem === 'metric' ? text.weightUnitMetric : text.weightUnitImperial
    }`
    : '';
  const interpretationText = result && values.weightKg !== undefined
    ? text.interpretation
      .replace('{weight}', displayWeight)
      .replace('{activity}', String(activityLevel))
      .replace('{maintain}', String(scenarioGrams.maintain ?? ''))
      .replace('{bulk}', String(scenarioGrams.bulk ?? ''))
      .replace('{cut}', String(scenarioGrams.cut ?? ''))
      .replace('{selected}', String(result.dailyProteinGrams))
    : '';
  const adviceKey = proteinGoalAdviceKey(goal);

  const results = (
    <div dir={direction}>
      <p data-testid="protein-status" role="status" aria-live="polite">{text.status[status]}</p>
      <p data-testid="protein-required-progress">{requiredProgressText}</p>
      {status === 'error' ? <p>{text.errorGuidance}</p> : null}
      <p data-testid="protein-caution">{text.caution}</p>
      {!result && status !== 'error' && values.weightKg === undefined ? <div>
        <p>{text.empty}</p>
        <ul aria-label={text.required}><li>{text.weight}</li></ul>
      </div> : null}
      {result ? <div>
        <p data-testid="protein-result-type">{text.calculatedType}</p>
        <p data-testid="protein-result" aria-live="polite">{text.result}: {result.dailyProteinGrams} g/day</p>

        <section aria-labelledby="protein-scenarios-heading">
          <h2 id="protein-scenarios-heading">{text.scenariosHeading}</h2>
          <p>{text.scenariosNote}</p>
          <ul data-testid="protein-scenarios">
            {scenarioData.map((scenario) => {
              const selected = scenario.goal === goal;
              return (
                <li
                  key={scenario.goal}
                  data-testid={`protein-scenario-${scenario.goal}`}
                  data-selected={selected ? 'true' : 'false'}
                >
                  {text[scenario.goal]}: {scenario.grams} g/day{selected ? ` (${text.selectedLabel})` : ''}
                </li>
              );
            })}
          </ul>
          <p data-testid="protein-interpretation">{interpretationText}</p>
          <h3>{text.adviceHeading}</h3>
          <p data-testid="protein-advice">{text.advice[adviceKey]}</p>
        </section>

        <h2>{text.meaningH2}</h2>
        <p>{text.meaningBody}</p>
        <h2>{text.doesNotH2}</h2>
        <p>{text.doesNotBody}</p>

        <details data-testid="protein-details-formula">
          <summary>{text.formulaSummary}</summary>
          <ul>{text.formulaLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
        <details data-testid="protein-details-interpretation">
          <summary>{text.interpretationSummary}</summary>
          <ul>{text.interpretationLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
        <details data-testid="protein-details-units">
          <summary>{text.unitsSummary}</summary>
          <ul>{text.unitsLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>

        <ul><li data-testid="protein-not-medical-warning">{text.warningNotMedical}</li></ul>
      </div> : null}
    </div>
  );

  const activityOptions = activities.map((value, index) => (
    <option key={value} value={value}>{text.activities[index]} ({value})</option>
  ));

  const renderedInputs = (
    <div dir={direction}>
      <DynamicSliderField
        id="protein-weight"
        label={unitSystem === 'metric' ? text.weightMetric : text.weightImperial}
        unitSystem={unitSystem}
        dir={direction}
        locale={locale}
        value={weightKg}
        canonicalUnit="kg"
        bounds={WEIGHT_BOUNDS}
        onChange={(v) => { setWeightKg(v); setStatus('partial'); setError(''); setResult(null); setResultEnvelope(null); }}
        dataTestId="protein-weight"
      />
      <label className="grid gap-1">{text.goal}
        <select data-testid="protein-goal" aria-label={text.goal} value={goal} onChange={(event) => { setGoal(event.target.value as Goal); setError(''); setResult(null); setResultEnvelope(null); setStatus('partial'); }}>
          <option value="maintain">{text.maintain}</option>
          <option value="bulk">{text.bulk}</option>
          <option value="cut">{text.cut}</option>
        </select>
      </label>
      <label className="grid gap-1">{text.activity}
        <select data-testid="protein-activity" aria-label={text.activity} value={activityLevel} onChange={(event) => { setActivityLevel(Number(event.target.value) as (typeof activities)[number]); setError(''); setResult(null); setResultEnvelope(null); setStatus('partial'); }}>
          {activityOptions}
        </select>
      </label>
      <button data-testid="protein-calculate" type="button" onClick={() => recalculate(true)}>{text.calculate}</button>
    </div>
  );

  return (
    <main className={styles.shell}>
    <GeniusToolTemplateV4
      toolId="mrx.tool.protein-needs"
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
      riskTier="MEDIUM"
      aiStatus="NOT_CONFIGURED"
    />
    </main>
  );
}
