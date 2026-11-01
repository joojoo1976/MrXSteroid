import type { KeyFinding, ToolOutput } from '../contracts';
import type { HeuristicOutputOptions } from './tool-126-130-common';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding } from './tool-126-130-common';
import { calculatePhysiqueTrajectoryScenarios, type PhysiqueTrajectoryInput, type PhysiqueTrajectoryResult } from '../engines/tool-149-physique-trajectory-simulator.v6';
import type { CrossToolResultEnvelopeV7 } from '../shared-data/cross-tool-result.v7';

export function buildPhysiqueTrajectoryOutput(input: PhysiqueTrajectoryInput, options: HeuristicOutputOptions): ToolOutput<PhysiqueTrajectoryResult> {
  const result = calculatePhysiqueTrajectoryScenarios(input);
  const ar = options.locale === 'ar';
  const mass = (value: number) => `${(options.unitSystem === 'imperial' ? value * 2.20462 : value).toFixed(1)} ${options.unitSystem === 'imperial' ? 'lb' : 'kg'}`;
  const rate = (valueKg: number) => {
    const value = options.unitSystem === 'imperial' ? valueKg * 2.20462 : valueKg;
    return Math.abs(value) < 0.000001 ? value.toExponential(3) : String(Number(value.toPrecision(6)));
  };
  const findings: KeyFinding[] = [
    scopeFinding(ar
      ? 'محاكاة حسابية حتمية فقط؛ لا تتنبأ بالنتيجة الواقعية ولا تقدم خطة تدريب أو تغذية أو دواء أو تقييمًا صحيًا.'
      : 'Deterministic arithmetic scenarios only; no real-world prediction, training or nutrition plan, medication advice, or health assessment.'),
  ];

  if (result.status === 'NOT_AVAILABLE') {
    findings.push({
      code: 'NOT_AVAILABLE', labelAr: 'النتيجة غير متاحة', labelEn: 'Result unavailable',
      value: ar ? `تعذر الحساب: ${result.reason}` : `Calculation unavailable: ${result.reason}`, severity: 'important',
    });
  } else {
    findings.push({
      code: 'CALCULATION_TYPE', labelAr: 'نوع النتيجة', labelEn: 'Result type',
      value: 'CALCULATED · deterministic arithmetic scenario', severity: 'info',
    });
    findings.push({
      code: 'SCENARIO_FORMULA', labelAr: 'طريقة الحساب', labelEn: 'Calculation method',
      value: ar
        ? 'الكتلة الخالية من الدهون = الوزن الحالي × (1 − الدهون الحالية ÷ 100)؛ الوزن الناتج = الكتلة الخالية من الدهون ÷ (1 − الدهون المستهدفة ÷ 100)؛ الأسابيع = فرق الوزن المطلق ÷ المعدل الذي حدده المستخدم.'
        : 'Lean mass = current weight × (1 − current body fat ÷ 100); target weight = lean mass ÷ (1 − target body fat ÷ 100); weeks = absolute weight change ÷ user-selected rate.',
      severity: 'info',
    });
    result.scenarios.forEach((scenario, index) => {
      findings.push({
        code: `SCENARIO_${index + 1}_TARGET`,
        labelAr: `الوزن الناتج — السيناريو ${index + 1}`,
        labelEn: `Scenario ${index + 1} target weight`,
        value: mass(scenario.scenario_target_weight_kg), severity: 'info',
      });
      findings.push({
        code: `SCENARIO_${index + 1}_DURATION`,
        labelAr: `المدة الحسابية — السيناريو ${index + 1}`,
        labelEn: `Scenario ${index + 1} arithmetic duration`,
        value: `${scenario.scenario_duration_weeks} ${ar ? 'أسبوعًا' : 'weeks'}`, severity: 'monitor',
      });
      findings.push({
        code: `SCENARIO_${index + 1}_RATE`,
        labelAr: `المعدل الذي حدده المستخدم — السيناريو ${index + 1}`,
        labelEn: `User-selected rate — scenario ${index + 1}`,
        value: `${rate(scenario.weekly_weight_change_kg)} ${options.unitSystem === 'imperial' ? 'lb' : 'kg'} / ${ar ? 'أسبوع' : 'week'}`, severity: 'info',
      });
      findings.push({
        code: `SCENARIO_${index + 1}_ASSUMPTIONS`,
        labelAr: `افتراضات السيناريو ${index + 1}`,
        labelEn: `Scenario ${index + 1} assumptions`,
        value: ar
          ? 'ثبات الكتلة الخالية من الدهون؛ ثبات المعدل الذي حدده المستخدم لأغراض الحساب؛ نسبة الدهون مدخلة من المستخدم.'
          : 'Constant lean mass; the user-selected rate is held constant for arithmetic; body-fat percentages are user-entered.',
        severity: 'important',
      });
    });
  }

  return registeredHeuristicOutput(
    'tool-149-physique-trajectory-simulator', result, findings,
    heuristicProvenance(options, options.unitSystem === 'imperial' ? 'lb display; kg canonical; body fat %' : 'kg; body fat %', 'CALCULATED deterministic constant-lean-mass scenario; shared pure arithmetic kernel with Tool 131; no external reference data or AI model'),
    options,
  );
}

/** Build a private, output-only envelope. The caller must obtain explicit user
 * consent for a named target before placing it in the shared session context. */
export function buildTool149ShareEnvelopeV7(
  result: PhysiqueTrajectoryResult,
  createdAt: string,
  resultId: string,
): CrossToolResultEnvelopeV7 | null {
  if (result.status !== 'CALCULATED') return null;
  return {
    schemaVersion: 1,
    resultId,
    sourceToolId: 'tool-149-physique-trajectory-simulator',
    sourceToolVersion: '6.0.0',
    createdAt,
    privacyClass: 'SENSITIVE',
    fields: result.scenarios.flatMap((scenario, index) => {
      const scenarioNumber = index + 1;
      return [
        { key: `scenario_${scenarioNumber}_target_weight`, value: scenario.scenario_target_weight_kg, unit: 'kg', origin: 'CALCULATED' as const, sourceLabel: `Tool 149 scenario ${scenarioNumber} target weight` },
        { key: `scenario_${scenarioNumber}_duration`, value: scenario.scenario_duration_weeks, unit: 'week', origin: 'CALCULATED' as const, sourceLabel: `Tool 149 scenario ${scenarioNumber} arithmetic duration` },
        { key: `scenario_${scenarioNumber}_weekly_rate`, value: scenario.weekly_weight_change_kg, unit: 'kg/week', origin: 'CALCULATED' as const, sourceLabel: `Tool 149 scenario ${scenarioNumber} user-selected rate` },
      ];
    }),
    consent: { grantedAt: createdAt, targetToolIds: [] },
  };
}
