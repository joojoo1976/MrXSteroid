/**
 * Tool #062 — Prostate Health Manager (Educational)
 * Layer 62: IPSS-style symptom scoring with mandatory red-flag escalation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Screening aid only; NOT a diagnosis and NOT a substitute for DRE/PSA review.
 *  - Acute retention, haematuria or fever+pain escalate to emergency care.
 *  - No drug, alpha-blocker or 5-AR inhibitor dose is ever recommended.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface ProstateInput {
  /** Each IPSS item is scored 0–5. */
  incomplete_emptying: number;
  frequency: number;
  intermittency: number;
  urgency: number;
  weak_stream: number;
  straining: number;
  nocturia: number;
  /** Quality-of-life question (0–6). */
  quality_of_life: number;
  /** Cannot urinate at all / acute retention. */
  acute_retention: boolean;
  /** Visible blood in urine. */
  hematuria: boolean;
  /** Fever with pelvic/perineal pain. */
  fever_pelvic_pain: boolean;
}

export interface ProstateResult {
  /** IPSS total (0–35). */
  ipss_total: number;
  severity: 'mild' | 'moderate' | 'severe';
  quality_of_life: number;
  emergency: boolean;
  emergency_message: string | null;
  contributing_factors: string[];
  recommendations: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clampItem = (v: number) => Math.min(5, Math.max(0, Math.round(v)));
const clampQol = (v: number) => Math.min(6, Math.max(0, Math.round(v)));

export const EMERGENCY_MESSAGE =
  'You reported a red-flag urinary symptom (inability to urinate, blood in the urine, or fever with pelvic pain). Seek emergency/urgent medical care now. Do not wait, and do not try to self-treat. This tool cannot provide emergency care.';

export function assessProstateHealth(input: ProstateInput): ProstateResult {
  const items = [
    input.incomplete_emptying,
    input.frequency,
    input.intermittency,
    input.urgency,
    input.weak_stream,
    input.straining,
    input.nocturia,
  ].map(clampItem);

  const total = items.reduce((a, b) => a + b, 0);
  const severity: ProstateResult['severity'] = total <= 7 ? 'mild' : total <= 19 ? 'moderate' : 'severe';
  const qol = clampQol(input.quality_of_life);

  const emergency = Boolean(input.acute_retention || input.hematuria || input.fever_pelvic_pain);

  const factors: string[] = [`IPSS-style total: ${total}/35 (${severity}).`];
  if (qol >= 4) factors.push('Quality-of-life impact is significant.');
  if (clampItem(input.nocturia) >= 3) factors.push('Frequent night-time urination is reported.');

  const recommendations: string[] = [];
  const flags: string[] = [];

  if (emergency) {
    flags.push('prostate_red_flag');
    recommendations.push('Seek emergency/urgent care immediately for the red-flag symptom.');
  } else if (severity === 'severe') {
    recommendations.push('Arrange a prompt clinical assessment of urinary symptoms.');
    flags.push('severe_symptoms');
  } else if (severity === 'moderate') {
    recommendations.push('Discuss these symptoms with a clinician at your next visit.');
  } else {
    recommendations.push('Symptoms are mild — keep monitoring and report any change.');
  }

  if (qol >= 4) flags.push('high_bother_score');
  recommendations.push('Do not start or stop any prostate medication without a clinician.');
  recommendations.push('This screening tool is educational and is not a diagnosis.');

  return {
    ipss_total: total,
    severity,
    quality_of_life: qol,
    emergency,
    emergency_message: emergency ? EMERGENCY_MESSAGE : null,
    contributing_factors: factors,
    recommendations,
    safety_flags: flags,
    educational_notice:
      'IPSS-style screening aid only. Prostate disease requires clinical evaluation (including DRE/PSA where indicated) by a qualified clinician.',
  };
}
