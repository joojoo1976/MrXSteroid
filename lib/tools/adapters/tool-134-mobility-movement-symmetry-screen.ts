import type { KeyFinding, ToolOutput } from '../contracts';
import { calculateMobilityScreen, type MobilityScreenInput, type MobilityScreenResult } from '../engines/tool-134-mobility-movement-symmetry-screen.v6';
import { heuristicProvenance, registeredHeuristicOutput, scopeFinding, type HeuristicOutputOptions } from './tool-126-130-common';

const movementLabels: Record<MobilityScreenInput['movement'], [string, string]> = {
  ankle_dorsiflexion: ['ثني الكاحل للأعلى', 'Ankle dorsiflexion'], shoulder_flexion: ['رفع الكتف للأعلى', 'Shoulder flexion'],
  hip_rotation: ['دوران الورك', 'Hip rotation'], single_leg_balance: ['اتزان على قدم واحدة', 'Single-leg balance'],
};
export function buildMobilityScreenOutput(input: MobilityScreenInput, options: HeuristicOutputOptions): ToolOutput<MobilityScreenResult> {
  const result = calculateMobilityScreen(input);
  const ar = options.locale === 'ar';
  const finding: KeyFinding[] = [
    { code: 'MOVEMENT', labelAr: 'الحركة المسجلة', labelEn: 'Recorded movement', value: movementLabels[input.movement][ar ? 0 : 1], severity: 'info' },
    { code: 'SIDE_DIFFERENCE', labelAr: 'الفرق بين الجانبين', labelEn: 'Side-to-side difference', value: `${result.absolute_difference} ${input.unit === 'degrees' ? '°' : (ar ? 'ثانية' : 's')}`, severity: result.rule_flag === 'review_difference' ? 'monitor' : 'info' },
    { code: 'RULE_FLAG', labelAr: 'إشارة قاعدة الفحص', labelEn: 'Screening rule flag', value: result.rule_flag === 'review_difference' ? (ar ? 'راجع الفرق المسجل' : 'Review recorded difference') : (ar ? 'دون حد المراجعة المحدد' : 'Below the app review threshold'), severity: result.rule_flag === 'review_difference' ? 'monitor' : 'info' },
    scopeFinding(ar ? 'مقارنة فحصية بقواعد بسيطة وليست تشخيصًا أو تقييمًا سريريًا للحركة.' : 'Simple screening comparison only, not a diagnosis or clinical movement assessment.'),
  ];
  return registeredHeuristicOutput('tool-134-mobility-movement-symmetry-screen', result, finding, heuristicProvenance(options, input.unit, 'User-entered side-to-side values compared with a fixed app threshold; not a clinical assessment'), options);
}
