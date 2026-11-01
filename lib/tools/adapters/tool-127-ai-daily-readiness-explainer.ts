import type { KeyFinding, Locale, ToolOutput } from '../contracts';
import { calculateDailyReadinessV6, type DailyReadinessInput, type DailyReadinessResult } from '../engines/tool-127-ai-daily-readiness-explainer.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

const factorLabels: Record<string, [string, string]> = {
  low_sleep: ['قلة النوم', 'Low sleep'], high_stress: ['ارتفاع الضغط المبلغ عنه', 'High reported stress'],
  high_soreness: ['ارتفاع الألم العضلي المبلغ عنه', 'High reported soreness'], high_previous_load: ['حمل سابق مرتفع', 'High previous load'],
  low_hydration: ['ترطيب منخفض مُبلغ عنه', 'Low reported hydration'], balanced_inputs: ['لا توجد إشارة ضمن القواعد الحالية', 'No alert under current rules'],
};
export function buildReadinessFindings(result: DailyReadinessResult, locale: Locale = 'en'): KeyFinding[] {
  const bandLabels: Record<DailyReadinessResult['band'], [string, string]> = {
    low: ['منخفضة', 'Low'], moderate: ['متوسطة', 'Moderate'], high: ['مرتفعة', 'High'],
  };
  const findings: KeyFinding[] = [
    { code: 'READINESS_SCORE', labelAr: 'درجة الجاهزية التقديرية', labelEn: 'Heuristic readiness score', value: `${result.readinessScore}/100 · ${bandLabels[result.band][locale === 'ar' ? 0 : 1]}`, severity: result.band === 'low' ? 'important' : result.band === 'moderate' ? 'monitor' : 'info' },
    { code: 'DATA_COVERAGE', labelAr: 'اكتمال المؤشرات المدخلة', labelEn: 'Reported marker coverage', value: `${result.dataCoveragePct}%`, severity: result.dataCoveragePct < 100 ? 'monitor' : 'info' },
    { code: 'RULE_FACTORS', labelAr: 'العوامل التي فعّلتها القواعد', labelEn: 'Rule-triggered factors', value: result.factors.map((x) => factorLabels[x]?.[locale === 'ar' ? 0 : 1] ?? x).join('، '), severity: result.factors.some((x) => x !== 'balanced_inputs') ? 'monitor' : 'info' },
    { code: 'ASSUMPTIONS', labelAr: 'افتراضات المؤشرات الناقصة', labelEn: 'Missing-marker assumptions', value: result.assumptions.map((x) => locale === 'ar' ? (x.includes('not_reported') ? 'المؤشر غير مُدخل واستُخدم له افتراض محايد' : 'المؤشر مُدخل') : x.replaceAll('_', ' ')).join('؛ '), severity: 'monitor' },
    scopeFinding(result.disclaimer),
  ];
  return findings;
}
export function buildReadinessOutput(input: DailyReadinessInput, options: HeuristicOutputOptions): ToolOutput<DailyReadinessResult> {
  const result = calculateDailyReadinessV6(input);
  return registeredHeuristicOutput('tool-127-ai-daily-readiness-explainer', result, buildReadinessFindings(result, options.locale), heuristicProvenance(options, 'score', 'Self-reported readiness markers scored by deterministic weighted rules; no AI model is called'), options);
}
