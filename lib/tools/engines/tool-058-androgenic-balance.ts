/**
 * Tool #058 — Androgenic Balance Calculator (Educational)
 * Layer 58: anabolic:androgenic dissociation index (Q-ratio education).
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational comparison of user-supplied activity ratings only.
 *  - Does NOT recommend, rank or dose any compound.
 *  - Never advises starting, stopping or combining AAS.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface AndrogenicBalanceInput {
  /** User-supplied anabolic activity rating (1–100). */
  anabolic_activity: number;
  /** User-supplied androgenic activity rating (1–100). */
  androgenic_activity: number;
  /** Reported androgenic side effects (0–3 severity). */
  androgenic_side_effects: number;
  /** Family/personal history of male-pattern baldness. */
  mpb_history: boolean;
  /** Reported acne severity (0–3). */
  acne_severity: number;
}

export interface AndrogenicBalanceResult {
  /** Anabolic : androgenic ratio (anabolic ÷ androgenic). */
  anabolic_androgenic_ratio: number;
  /** 0–100 index; higher = more anabolic-dominant dissociation. */
  dissociation_index: number;
  band: 'androgenic-dominant' | 'balanced' | 'anabolic-dominant';
  side_effect_burden: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  education: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export function assessAndrogenicBalance(input: AndrogenicBalanceInput): AndrogenicBalanceResult {
  const anabolic = clamp(input.anabolic_activity, 1, 100);
  const androgenic = clamp(input.androgenic_activity, 1, 100);
  const ratio = anabolic / androgenic;

  // Dissociation index: 0 = strongly androgenic, 50 = balanced, 100 = strongly anabolic.
  const dissociation = clamp(50 + (ratio - 1) * 50, 0, 100);

  let band: AndrogenicBalanceResult['band'];
  if (ratio >= 1.25) band = 'anabolic-dominant';
  else if (ratio <= 0.8) band = 'androgenic-dominant';
  else band = 'balanced';

  const burdenScore = clamp(input.androgenic_side_effects, 0, 3) + clamp(input.acne_severity, 0, 3);
  const burden: AndrogenicBalanceResult['side_effect_burden'] =
    burdenScore >= 5 ? 'high' : burdenScore >= 2 ? 'moderate' : 'low';

  const factors: string[] = [
    `User-supplied anabolic rating ${round(anabolic, 0)} vs androgenic rating ${round(androgenic, 0)}.`,
    `Anabolic:androgenic ratio ≈ ${round(ratio, 2)}.`,
  ];
  if (input.mpb_history) {
    factors.push('Personal/family history of male-pattern baldness raises sensitivity to androgenic activity.');
  }
  if (burden === 'high') {
    factors.push('Reported androgenic side-effect burden is high.');
  }

  const education: string[] = [
    'The anabolic:androgenic ratio (Q-ratio) describes dissociation in a bioassay, not a clinical benefit.',
    'A higher ratio does not mean "safer" — individual sensitivity to androgens varies widely.',
    'Androgenic activity drives sebum, scalp hair miniaturisation and prostate tissue in sensitive individuals.',
  ];

  const flags: string[] = [];
  if (burden === 'high') {
    flags.push('high_androgenic_burden');
    education.push('Reported androgenic side effects warrant a clinician review — do not self-adjust anything.');
  }
  if (input.mpb_history && band === 'androgenic-dominant') {
    flags.push('mpb_risk_context');
  }

  return {
    anabolic_androgenic_ratio: round(ratio, 2),
    dissociation_index: round(dissociation, 0),
    band,
    side_effect_burden: burden,
    contributing_factors: factors,
    education,
    safety_flags: flags,
    educational_notice:
      'Educational comparison of user-entered activity ratings. It is not a pharmacological ranking and never recommends a compound or dose.',
  };
}
