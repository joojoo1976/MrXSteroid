/**
 * Tool #050 — Mental Health Monitor (Educational)
 * Layer 50: PHQ-9-style self-check with mandatory red-flag escalation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Screening aid only; NOT a diagnosis.
 *  - Any suicidal/self-harm ideation triggers an immediate crisis message.
 *  - Escalates to emergency/crisis services. Never minimises risk.
 * ════════════════════════════════════════════════════════════════════════════
 */

/** Each item is scored 0–3 (PHQ-9 convention). */
export interface MentalHealthInput {
  little_interest: number;
  feeling_down: number;
  sleep_problems: number;
  low_energy: number;
  appetite_change: number;
  low_self_worth: number;
  poor_concentration: number;
  psychomotor_change: number;
  suicidal_ideation: number;
  /** Optional: difficulty functioning at work/home. */
  functional_impairment: boolean;
}

export interface MentalHealthResult {
  total_score: number; // 0–27
  severity: 'none' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  crisis: boolean;
  crisis_message: string | null;
  recommendations: string[];
  educational_notice: string;
}

const clampItem = (v: number) => Math.min(3, Math.max(0, Math.round(v)));

export const CRISIS_MESSAGE =
  'You indicated thoughts of self-harm or suicide. This is urgent. Please contact your local emergency number or a crisis line right now, and reach out to someone you trust. If you are in immediate danger, call emergency services immediately. This tool cannot provide emergency care.';

export function assessMentalHealth(input: MentalHealthInput): MentalHealthResult {
  const items = [
    input.little_interest,
    input.feeling_down,
    input.sleep_problems,
    input.low_energy,
    input.appetite_change,
    input.low_self_worth,
    input.poor_concentration,
    input.psychomotor_change,
    input.suicidal_ideation,
  ].map(clampItem);

  const total = items.reduce((a, b) => a + b, 0);

  let severity: MentalHealthResult['severity'];
  if (total <= 4) severity = 'none';
  else if (total <= 9) severity = 'mild';
  else if (total <= 14) severity = 'moderate';
  else if (total <= 19) severity = 'moderately-severe';
  else severity = 'severe';

  const crisis = clampItem(input.suicidal_ideation) > 0;

  const recommendations: string[] = [];
  if (crisis) {
    recommendations.push('Contact a crisis line or emergency services immediately.');
    recommendations.push('Tell a trusted person how you are feeling right now.');
  } else if (severity === 'none') {
    recommendations.push('No significant depressive symptoms detected. Keep monitoring your wellbeing.');
  } else if (severity === 'mild') {
    recommendations.push('Discuss these symptoms with a clinician if they persist beyond two weeks.');
    recommendations.push('Prioritise sleep, activity, daylight exposure and social connection.');
  } else {
    recommendations.push('Arrange a clinical assessment with a mental-health professional.');
    recommendations.push('Do not start or stop any medication without a clinician.');
  }
  if (input.functional_impairment) {
    recommendations.push('Functional impairment is reported — this warrants a timely clinical review.');
  }
  recommendations.push('This screening tool is educational and is not a diagnosis.');

  return {
    total_score: total,
    severity,
    crisis,
    crisis_message: crisis ? CRISIS_MESSAGE : null,
    recommendations,
    educational_notice:
      'Screening aid only (PHQ-9-style). A qualified clinician must interpret and diagnose.',
  };
}
