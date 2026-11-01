import type { KeyFinding, ToolOutput } from '../contracts';
import { calculatePhysiqueV6, type PhysiqueInput, type PhysiqueResult } from '../engines/tool-136-physique-golden-ratio-score.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

const ratioLabels: Record<string, [string, string]> = { shoulder_waist: ['الكتف إلى الخصر', 'Shoulder to waist'], chest_waist: ['الصدر إلى الخصر', 'Chest to waist'], arm_waist: ['الذراع إلى الخصر', 'Arm to waist'] };
export function buildPhysiqueOutput(input: PhysiqueInput, options: HeuristicOutputOptions): ToolOutput<PhysiqueResult> {
  const result = calculatePhysiqueV6(input);
  const ar = options.locale === 'ar';
  const findings: KeyFinding[] = [
    { code: 'PROPORTION_SCORE', labelAr: 'مؤشر تناسب تجميلي استدلالي (غير معتمد)', labelEn: 'Heuristic aesthetic proportion indicator (unvalidated)', value: result.proportionScore === null ? (ar ? 'غير متاح · يلزم الخصر وقياس واحد قابل للمقارنة' : 'Unavailable · waist plus one comparable measurement required') : `${result.proportionScore}/100`, severity: result.proportionScore === null ? 'important' : 'monitor' },
    { code: 'RATIOS', labelAr: 'النسب المحسوبة', labelEn: 'Calculated ratios', value: Object.entries(result.ratios).map(([key, value]) => `${ratioLabels[key]?.[ar ? 0 : 1] ?? key}: ${value}`).join('؛ ') || (ar ? 'لا توجد نسب مكتملة' : 'No complete ratios'), severity: 'info' },
    { code: 'DATA_STATUS', labelAr: 'حالة البيانات', labelEn: 'Data status', value: result.status === 'ok' ? (ar ? 'مكتملة لحساب النسبة المختارة' : 'Sufficient for the selected ratios') : (ar ? 'بيانات غير كافية' : 'Insufficient data'), severity: result.status === 'ok' ? 'info' : 'monitor' },
    scopeFinding(ar ? 'مؤشر جمالي استدلالي غير معتمد صحيًا، ولا يحدد الصحة أو القيمة البدنية.' : 'Unvalidated aesthetic heuristic; it does not measure health or personal worth.'),
  ];
  return registeredHeuristicOutput('tool-136-physique-golden-ratio-score', result, findings, heuristicProvenance(options, options.unitSystem === 'imperial' ? 'in display; cm canonical' : 'cm', 'User-entered circumference ratios compared with fixed aesthetic heuristics; not a health standard'), options);
}
