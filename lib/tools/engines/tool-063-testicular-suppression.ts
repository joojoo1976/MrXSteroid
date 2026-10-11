/**
 * Tool #063 — Testicular Suppression Calculator (Educational)
 * Layer 63: gonadal-suppression index from exposure duration & potency proxy.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational model only; NOT a testicular ultrasound or diagnosis.
 *  - Never recommends hCG, SERMs, testosterone or any dose.
 *  - Sustained suppression + fertility intent escalates to clinical referral.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type SuppressionExposure = 'none' | 'exogenous_androgen' | 'serm' | 'hcg' | 'mixed';

/** Potency proxy (0–1) describing how strongly each exposure suppresses the HPG axis. */
export const EXPOSURE_POTENCY: Readonly<Record<SuppressionExposure, number>> = {
  none: 0,
  exogenous_androgen: 0.95,
  serm: 0.15,
  hcg: 0.1,
  mixed: 0.8,
};

export interface TesticularSuppressionInput {
  /** Baseline testicular volume per side (mL); typical adult 15–25 mL. */
  baseline_volume_ml: number;
  /** Weeks of continuous exposure. */
  exposure_weeks: number;
  exposure: SuppressionExposure;
  /** Currently trying to conceive. */
  fertility_intent: boolean;
  /** Reported testicular ache or pain. */
  testicular_pain: boolean;
  age: number;
}

export interface TesticularSuppressionResult {
  /** 0–100 suppression index (higher = more suppressed). */
  suppression_index: number;
  /** Estimated current testicular volume per side (mL, educational). */
  estimated_volume_ml: number;
  /** Fraction of baseline volume retained (0–1). */
  volume_retention_fraction: number;
  band: 'minimal' | 'partial' | 'marked' | 'severe';
  contributing_factors: string[];
  education: string[];
  clinical_referral_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Saturating suppression curve: 1 − e^(−k·weeks). */
export function suppressionFraction(exposure_weeks: number, potency: number, k = 0.28): number {
  const weeks = clamp(exposure_weeks, 0, 520);
  return (1 - Math.exp(-k * weeks)) * clamp(potency, 0, 1);
}

export function assessTesticularSuppression(input: TesticularSuppressionInput): TesticularSuppressionResult {
  const potency = EXPOSURE_POTENCY[input.exposure] ?? 0;
  const frac = clamp(suppressionFraction(input.exposure_weeks, potency), 0, 1);

  // Volume shrinks up to ~55% of baseline at maximal suppression.
  const retention = 1 - frac * 0.55;
  const baseline = clamp(input.baseline_volume_ml, 3, 40);
  const estimated = baseline * retention;

  const index = round(frac * 100, 0);
  const band: TesticularSuppressionResult['band'] =
    index >= 70 ? 'severe' : index >= 40 ? 'marked' : index >= 15 ? 'partial' : 'minimal';

  const factors: string[] = [
    `Exposure: ${input.exposure.replace('_', ' ')} for ${round(clamp(input.exposure_weeks, 0, 520), 0)} weeks.`,
    `Saturating suppression model gives ${index}/100.`,
    `Estimated volume retention ≈ ${round(retention * 100, 0)}% of baseline.`,
  ];

  const education: string[] = [
    'Exogenous androgens suppress LH/FSH, which shrinks the testes and reduces intratesticular testosterone.',
    'Suppression is dose- and duration-dependent and largely reversible, but recovery can take months.',
    'Testicular volume is best assessed clinically (Prader orchidometer or ultrasound).',
    'This tool never recommends hCG, SERMs, testosterone or any dose.',
  ];

  const flags: string[] = [];
  let referral = false;

  if (band === 'severe') {
    referral = true;
    flags.push('severe_suppression');
  }
  if (input.fertility_intent && index >= 40) {
    referral = true;
    flags.push('fertility_intent_with_suppression');
    education.push('If you are trying to conceive, arrange a clinical fertility review promptly.');
  }
  if (input.testicular_pain) {
    flags.push('testicular_pain');
    referral = true;
    education.push('New testicular pain warrants urgent clinical assessment to exclude torsion or infection.');
  }
  if (input.age >= 45 && index >= 40) {
    flags.push('age_related_recovery_risk');
  }

  return {
    suppression_index: index,
    estimated_volume_ml: round(estimated, 1),
    volume_retention_fraction: round(retention, 3),
    band,
    contributing_factors: factors,
    education,
    clinical_referral_advised: referral,
    safety_flags: flags,
    educational_notice:
      'Educational model only. It does not measure testicular size and never recommends hormone treatment or doses; see a clinician for real assessment.',
  };
}
