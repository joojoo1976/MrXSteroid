import type { KeyFinding, ToolOutput } from '../contracts';
import { calculateTransformationScenario, type TransformationScenarioInput, type TransformationScenarioResult } from '../engines/tool-131-transformation-forecast-trajectory-engine.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

export function buildTransformationScenarioOutput(input: TransformationScenarioInput, options: HeuristicOutputOptions): ToolOutput<TransformationScenarioResult> {
  const result = calculateTransformationScenario(input);
  const ar = options.locale === 'ar';
  const mass = (value: number) => `${(options.unitSystem === 'imperial' ? value * 2.20462 : value).toFixed(1)} ${options.unitSystem === 'imperial' ? 'lb' : 'kg'}`;
  const direction = result.direction === 'loss' ? (ar ? 'خفض كتلة ضمن السيناريو' : 'loss scenario') : result.direction === 'gain' ? (ar ? 'زيادة كتلة ضمن السيناريو' : 'gain scenario') : (ar ? 'لا تغير يُذكر' : 'no material change');
  const findings: KeyFinding[] = [
    { code: 'SCENARIO_TARGET', labelAr: 'وزن الهدف الحسابي', labelEn: 'Arithmetic scenario target weight', value: mass(result.scenario_target_weight_kg), severity: 'info' },
    { code: 'SCENARIO_DURATION', labelAr: 'مدة السيناريو بمعدل ثابت مختار', labelEn: 'Scenario duration at selected constant rate', value: `${result.estimated_scenario_weeks} ${ar ? 'أسبوعًا' : 'weeks'}`, severity: 'monitor' },
    { code: 'SCENARIO_DIRECTION', labelAr: 'نوع السيناريو', labelEn: 'Scenario direction', value: direction, severity: 'info' },
    { code: 'ASSUMPTIONS', labelAr: 'الافتراضات', labelEn: 'Assumptions', value: result.assumptions.map((item) => ar ? ({ 'constant lean mass': 'ثبات الكتلة الخالية من الدهون', 'constant user-selected weekly rate': 'ثبات المعدل الأسبوعي الذي حدده المستخدم', 'body-fat measurements are user-reported': 'قياسات الدهون مدخلة من المستخدم' }[item] ?? item) : item).join('؛ '), severity: 'important' },
    scopeFinding(ar ? 'هذا سيناريو حسابي، وليس توقعًا للنتيجة الفعلية.' : 'This is an arithmetic scenario, not a prediction of actual outcomes.'),
  ];
  return registeredHeuristicOutput('tool-131-transformation-forecast-trajectory-engine', result, findings, heuristicProvenance(options, options.unitSystem === 'imperial' ? 'lb display; kg canonical' : 'kg', 'Lean-mass-constant arithmetic scenario using a user-selected weekly rate; no AI model is called'), options);
}
