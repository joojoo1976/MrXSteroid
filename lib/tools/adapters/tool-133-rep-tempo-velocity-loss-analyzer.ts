import type { KeyFinding, ToolOutput } from '../contracts';
import { calculateVelocityV6, type VelocityInput, type VelocityResult } from '../engines/tool-133-rep-tempo-velocity-loss-analyzer.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

export function buildVelocityOutput(input: VelocityInput, options: HeuristicOutputOptions): ToolOutput<VelocityResult> {
  const result = calculateVelocityV6(input);
  const ar = options.locale === 'ar';
  const fatigueLabels = { insufficient_data: ['بيانات السرعة غير كافية', 'Insufficient velocity data'], low: ['منخفضة حسب القاعدة', 'Low under rule'], moderate: ['متوسطة حسب القاعدة', 'Moderate under rule'], high: ['مرتفعة حسب القاعدة', 'High under rule'] };
  const findings: KeyFinding[] = [
    { code: 'VELOCITY_LOSS', labelAr: 'تغير السرعة بين أول وآخر مجموعة مسجلة', labelEn: 'Velocity change from first to last recorded set', value: result.velocityLossPercent === null ? (ar ? 'غير متاح · أدخل سرعتين على الأقل' : 'Unavailable · enter at least two velocities') : `${result.velocityLossPercent}%`, severity: result.fatigueIndicator === 'high' ? 'monitor' : result.velocityLossPercent === null ? 'important' : 'info' },
    { code: 'TEMPO_VARIATION', labelAr: 'تباين الإيقاع المسجل (انحراف معياري)', labelEn: 'Recorded tempo variation (standard deviation)', value: result.tempoConsistency === null ? (ar ? 'غير متاح · يلزم إيقاعان' : 'Unavailable · two tempo readings required') : result.tempoConsistency, severity: 'info' },
    { code: 'FATIGUE_RULE', labelAr: 'إشارة القاعدة للإجهاد', labelEn: 'Rule-based fatigue signal', value: fatigueLabels[result.fatigueIndicator][ar ? 0 : 1], severity: result.fatigueIndicator === 'high' ? 'important' : result.fatigueIndicator === 'moderate' ? 'monitor' : 'info' },
    { code: 'DATA_COVERAGE', labelAr: 'اكتمال حقول السرعة والإيقاع', labelEn: 'Velocity and tempo field coverage', value: `${result.dataCoveragePct}%`, severity: result.dataCoveragePct < 100 ? 'monitor' : 'info' },
    scopeFinding(ar ? 'السرعة بين المجموعات ليست فقدان السرعة داخل المجموعة، ولا تشخّص الإجهاد أو تحدد سلامة الاستمرار.' : 'Between-set velocity change is not within-set velocity loss, and does not diagnose fatigue or determine whether continuing is safe.'),
  ];
  return registeredHeuristicOutput('tool-133-rep-tempo-velocity-loss-analyzer', result, findings, heuristicProvenance(options, 'kg, m/s, seconds', 'User-recorded set readings sorted by set number and compared with fixed rules; no sensor or AI model is used'), options);
}
