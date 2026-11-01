import type { KeyFinding, Locale, ToolOutput } from '../contracts';
import { calculatePlateauDetectiveV6, type PlateauInput, type PlateauResult } from '../engines/tool-130-ai-plateau-detective.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

export function buildPlateauFindings(result: PlateauResult, locale: Locale = 'en'): KeyFinding[] {
  const metricLabels: Record<string, [string, string]> = { weight_kg: ['وزن الجسم', 'body weight'], lift_1rm_kg: ['1RM المقدر', 'estimated one-rep max'], measurement: ['قياس', 'measurement'] };
  const strengthLabels = { low: ['ضعيفة', 'weak'], moderate: ['متوسطة', 'moderate'], high: ['مرتفعة', 'strong'] };
  return [
    { code: 'PLATEAU_SIGNAL', labelAr: 'إشارة ثبات وفق قاعدة الميل', labelEn: 'Slope-rule plateau signal', value: result.isPlateau ? locale === 'ar' ? 'مرصودة' : 'detected' : locale === 'ar' ? 'غير مرصودة' : 'not detected', severity: result.isPlateau ? 'monitor' : 'info' },
    { code: 'RULE_SIGNAL_STRENGTH', labelAr: 'قوة إشارة القاعدة (ليست ثقة معايرة)', labelEn: 'Rule signal strength (not calibrated confidence)', value: strengthLabels[result.ruleSignalStrength][locale === 'ar' ? 0 : 1], severity: result.ruleSignalStrength === 'high' ? 'monitor' : 'info' },
    { code: 'AFFECTED_METRICS', labelAr: 'المقاييس المطابقة للقاعدة', labelEn: 'Metrics matching the rule', value: result.affectedMetrics.map((x) => metricLabels[x]?.[locale === 'ar' ? 0 : 1] ?? x).join('، ') || (locale === 'ar' ? 'لا يوجد' : 'none'), severity: result.affectedMetrics.length ? 'monitor' : 'info' },
    { code: 'POSSIBLE_CAUSES', labelAr: 'تفسيرات عامة محتملة وليست مستنتجة من القياس', labelEn: 'General possibilities; not inferred from measurements', value: result.possibleCauses.map((x) => locale === 'ar' ? 'فجوة في التحميل التدريجي أو الاستشفاء (احتمال عام)' : x.replaceAll('_', ' ')).join('، ') || (locale === 'ar' ? 'لا توجد' : 'none'), severity: 'monitor' },
    { code: 'RECOMMENDATIONS', labelAr: 'اقتراح القاعدة', labelEn: 'Rule suggestion', value: result.recommendations.map((x) => locale === 'ar' ? x === 'vary_stimulus' ? 'راجع تنويع المثير التدريبي' : 'استمر بالخطة الحالية' : x.replaceAll('_', ' ')).join('، '), severity: 'info' },
    scopeFinding(result.disclaimer),
  ];
}
export function buildPlateauOutput(input: PlateauInput, options: HeuristicOutputOptions): ToolOutput<PlateauResult> {
  const result = calculatePlateauDetectiveV6(input);
  return registeredHeuristicOutput('tool-130-ai-plateau-detective', result, buildPlateauFindings(result, options.locale), heuristicProvenance(options, 'mixed by metric', 'User-entered trend points inspected by a fixed slope threshold; no AI model is called'), options);
}
