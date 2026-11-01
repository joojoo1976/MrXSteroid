import type { KeyFinding, Locale, ToolOutput } from '../contracts';
import { calculateAdaptivePlannerV6, type AdaptivePlannerInput, type AdaptivePlannerResult } from '../engines/tool-129-ai-adaptive-training-planner.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

export function buildPlannerFindings(result: AdaptivePlannerResult, locale: Locale = 'en'): KeyFinding[] {
  const focusLabels: Record<AdaptivePlannerResult['weeklyPlan'][number]['focus'], [string, string]> = {
    foundational: ['تركيز تأسيسي', 'Foundational focus'], progressive: ['تركيز تقدمي', 'Progressive focus'], specialized: ['تركيز تخصصي', 'Specialized focus'],
  };
  const planSummary = result.weeklyPlan.map((day) => `${locale === 'ar' ? 'اليوم' : 'Day'} ${day.day}: ${day.exerciseType}, ${day.volume} ${locale === 'ar' ? 'دقيقة' : 'min'}, ${day.intensity}, ${focusLabels[day.focus][locale === 'ar' ? 0 : 1]}`).join(' | ') || (locale === 'ar' ? 'لا توجد جلسات' : 'No sessions');
  return [
    { code: 'WEEKLY_OUTLINE', labelAr: 'مخطط أسبوعي استدلالي', labelEn: 'Heuristic weekly outline', value: planSummary, severity: 'info' },
    { code: 'SESSION_COUNT', labelAr: 'عدد الجلسات', labelEn: 'Planned sessions', value: result.weeklyPlan.length, severity: 'info' },
    scopeFinding(result.disclaimer),
  ];
}
export function buildPlannerOutput(input: AdaptivePlannerInput, options: HeuristicOutputOptions): ToolOutput<AdaptivePlannerResult> {
  const result = calculateAdaptivePlannerV6(input);
  return registeredHeuristicOutput('tool-129-ai-adaptive-training-planner', result, buildPlannerFindings(result, options.locale), heuristicProvenance(options, 'minutes per session', 'User-selected program parameters mapped to a deterministic heuristic outline; no AI model is called'), options);
}
