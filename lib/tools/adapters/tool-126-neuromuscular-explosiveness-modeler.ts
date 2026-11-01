import type { KeyFinding, Locale, ToolOutput } from '../contracts';
import { calculateNeuromuscularV6, type NeuromuscularInput, type NeuromuscularResult } from '../engines/tool-126-neuromuscular-explosiveness-modeler.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

const labels: Record<string, [string, string]> = {
  vertical_jump: ['القفز العمودي', 'Vertical jump'], broad_jump: ['القفز العريض', 'Broad jump'],
  sprint_10m: ['عدو 10 أمتار', '10 m sprint'], sprint_20m: ['عدو 20 مترًا', '20 m sprint'],
  strength_ratio: ['نسبة القوة إلى وزن الجسم', 'Strength-to-body-mass ratio'], none: ['لا توجد اختبارات كافية', 'No test markers'],
};
export function buildNeuromuscularFindings(result: NeuromuscularResult, locale: Locale = 'en'): KeyFinding[] {
  const findings: KeyFinding[] = [
    { code: 'EXPLOSIVENESS_SCORE', labelAr: 'مؤشر الانفجارية الاستدلالي', labelEn: 'Heuristic explosiveness score', value: result.explosivenessScore === null ? (locale === 'ar' ? 'غير متاح · أدخل اختبارًا واحدًا على الأقل' : 'Unavailable · enter at least one test') : `${result.explosivenessScore}/100`, severity: result.explosivenessScore === null ? 'important' : 'monitor' },
    { code: 'TESTS_REPORTED', labelAr: 'اختبارات مدخلة', labelEn: 'Test markers reported', value: result.testsReported, severity: result.testsReported === 0 ? 'important' : 'info' },
    { code: 'STRENGTHS', labelAr: 'مؤشرات أعلى وفق قواعد النموذج', labelEn: 'Markers above model rule threshold', value: result.strengths.map((x) => labels[x]?.[locale === 'ar' ? 0 : 1] ?? x).join('، '), severity: 'info' },
    { code: 'WEAKNESS_MARKERS', labelAr: 'مؤشرات أدنى وفق قواعد النموذج', labelEn: 'Markers below model rule threshold', value: result.weaknesses.map((x) => labels[x]?.[locale === 'ar' ? 0 : 1] ?? x).join('، '), severity: 'monitor' },
    scopeFinding(result.disclaimer),
  ];
  return findings;
}
export function buildNeuromuscularOutput(input: NeuromuscularInput, options: HeuristicOutputOptions): ToolOutput<NeuromuscularResult> {
  const result = calculateNeuromuscularV6(input);
  return registeredHeuristicOutput('tool-126-neuromuscular-explosiveness-modeler', result, buildNeuromuscularFindings(result, options.locale), heuristicProvenance(options, 'kg, cm, seconds', 'Self-reported performance tests scored by fixed deterministic reference ratios'), options);
}
