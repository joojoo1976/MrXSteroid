/**
 * Tool #047 — Fertility Preservation Guide (Educational)
 * Layer 47: spermatogenesis recovery likelihood & timeline education.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational only; never a fertility diagnosis.
 *  - Escalates to reproductive-specialist referral for low likelihood.
 *  - Does not recommend drug doses.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface FertilityInput {
  age: number;
  /** Cumulative weeks of suppressive androgen exposure. */
  suppressive_weeks: number;
  /** Whether hCG was used concurrently (supportive, not a guarantee). */
  used_hcg: boolean;
  /** Most recent semen analysis (optional). */
  sperm: {
    concentration_million_ml: number;
    motility_pct: number;
    morphology_pct: number;
  } | null;
}

export interface FertilityResult {
  likelihood: 'high' | 'moderate' | 'low';
  likelihood_score: number; // 0–100
  estimated_recovery_months: number;
  contributing_factors: string[];
  recommendations: string[];
  urgent_referral: boolean;
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/** WHO lower-reference sperm concentration (million/mL) for orientation. */
export const WHO_CONCENTRATION_REF = 15;
export const WHO_MOTILITY_REF = 40;

export function assessFertility(input: FertilityInput): FertilityResult {
  let score = 100;
  const factors: string[] = [];
  const recommendations: string[] = [];

  // Age effect (gentle, monotonic).
  if (input.age >= 40) {
    score -= 15;
    factors.push('Age ≥40 is associated with slower spermatogenic recovery.');
  } else if (input.age >= 35) {
    score -= 8;
    factors.push('Age 35–39 modestly affects recovery speed.');
  }

  // Duration of suppression.
  const weeks = Math.max(0, input.suppressive_weeks);
  const durationPenalty = clamp(weeks * 0.35, 0, 45);
  score -= durationPenalty;
  if (weeks >= 12) factors.push('Prolonged suppression (>12 weeks) reduces spontaneous recovery speed.');

  // hCG support.
  if (input.used_hcg) {
    score += 8;
    factors.push('Concurrent hCG support is associated with better preservation of intratesticular function.');
  } else if (weeks >= 8) {
    score -= 5;
    factors.push('No gonadotropin support recorded during a longer exposure window.');
  }

  // Semen analysis.
  if (input.sperm) {
    if (input.sperm.concentration_million_ml < WHO_CONCENTRATION_REF) {
      score -= 25;
      factors.push(`Sperm concentration below the WHO reference (${WHO_CONCENTRATION_REF} M/mL).`);
    } else {
      score += 5;
      factors.push('Sperm concentration at/above the WHO reference.');
    }
    if (input.sperm.motility_pct < WHO_MOTILITY_REF) {
      score -= 12;
      factors.push(`Motility below the WHO reference (${WHO_MOTILITY_REF}%).`);
    }
  } else {
    factors.push('No recent semen analysis on record — baseline testing is recommended.');
  }

  score = clamp(score, 0, 100);
  const likelihood: FertilityResult['likelihood'] = score >= 70 ? 'high' : score >= 45 ? 'moderate' : 'low';

  // Recovery timeline heuristic: months scale with suppression duration and age.
  const months = round(clamp(3 + weeks / 8 + (input.age >= 38 ? 2 : 0), 3, 24), 0);

  if (likelihood === 'low') {
    recommendations.push('Arrange an urgent referral to a reproductive endocrinologist / andrology service.');
    recommendations.push('Discuss fertility preservation (semen cryopreservation) before further exposure.');
  } else if (likelihood === 'moderate') {
    recommendations.push('Book a reproductive-medicine consultation and repeat semen analysis.');
    recommendations.push('Consider fertility preservation options while planning further therapy.');
  } else {
    recommendations.push('Maintain periodic semen analysis if planning conception.');
    recommendations.push('Discuss any planned suppressive therapy with a clinician first.');
  }
  recommendations.push('Avoid heat exposure, smoking and excess alcohol to support recovery.');
  recommendations.push('This tool is educational and does not diagnose infertility.');

  return {
    likelihood,
    likelihood_score: round(score, 0),
    estimated_recovery_months: months,
    contributing_factors: factors,
    recommendations,
    urgent_referral: likelihood === 'low',
    educational_notice:
      'Educational guidance only. Fertility assessment requires clinical evaluation and laboratory testing.',
  };
}
