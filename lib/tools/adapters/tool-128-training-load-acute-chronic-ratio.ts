import type { KeyFinding, Locale, ToolOutput } from '../contracts';
import { calculateTrainingLoadAcwrV6, type AcwrInput, type AcwrResult } from '../engines/tool-128-training-load-acute-chronic-ratio.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

export function buildAcwrFindings(result: AcwrResult, locale: Locale = 'en'): KeyFinding[] {
  const bandLabels: Record<AcwrResult['band'], [string, string]> = {
    insufficient_data: ['بيانات المدى غير كافية', 'Insufficient history'], undertraining: ['أقل من النطاق المرجعي للنموذج', 'Below model reference band'],
    optimal: ['ضمن النطاق المرجعي للنموذج', 'Within model reference band'], spike: ['قفزة حسب النطاق المرجعي للنموذج', 'Spike under model reference band'],
  };
  return [
    { code: 'ACUTE_LOAD', labelAr: 'الحمل الحاد (7 أيام)', labelEn: 'Acute load (7 days)', value: result.acuteLoad, severity: 'info' },
    { code: 'CHRONIC_LOAD', labelAr: 'متوسط الحمل المزمن (28 يومًا)', labelEn: 'Chronic load average (28 days)', value: result.chronicLoad === null ? (locale === 'ar' ? 'غير متاح · يلزم سجل 28 يومًا' : 'Unavailable · 28-day history required') : result.chronicLoad, severity: result.chronicLoad === null ? 'monitor' : 'info' },
    { code: 'ACWR', labelAr: 'نسبة الحاد إلى المزمن', labelEn: 'Acute-to-chronic ratio', value: result.acwr === null ? (locale === 'ar' ? 'غير متاحة · يلزم سجل ممتد وخط أساس غير صفري' : 'Unavailable · requires history and a non-zero baseline') : result.acwr.toFixed(2), severity: result.acwr === null ? 'important' : result.band === 'spike' ? 'monitor' : 'info' },
    { code: 'HISTORY_COVERAGE', labelAr: 'أيام التدريب المسجلة ضمن النافذة', labelEn: 'Recorded training days in window', value: result.recordedDays, severity: result.sufficientData ? 'info' : 'monitor' },
    { code: 'LOAD_BAND', labelAr: 'تصنيف المؤشر النسبي', labelEn: 'Relative indicator band', value: `${bandLabels[result.band][locale === 'ar' ? 0 : 1]}${result.sufficientData ? '' : locale === 'ar' ? ' · أولي' : ' · provisional'}`, severity: result.band === 'spike' ? 'monitor' : result.band === 'insufficient_data' ? 'important' : 'info' },
    scopeFinding(result.disclaimer),
  ];
}
export function buildAcwrOutput(input: AcwrInput, options: HeuristicOutputOptions): ToolOutput<AcwrResult> {
  const result = calculateTrainingLoadAcwrV6(input);
  return registeredHeuristicOutput('tool-128-training-load-acute-chronic-ratio', result, buildAcwrFindings(result, options.locale), heuristicProvenance(options, 'user-defined load units', 'User-recorded training-session loads aggregated over fixed calendar windows'), options);
}
