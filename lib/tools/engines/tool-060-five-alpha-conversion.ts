/**
 * Tool #060 — 5-Alpha Conversion Calculator (Educational)
 * Layer 60: 5-alpha-reductase activity index & DHT-conversion education.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational estimate only; NOT a DHT assay or a diagnosis.
 *  - Never recommends 5-AR inhibitors, doses or any drug.
 *  - Flags plausible red-flag scenarios for clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface FiveAlphaInput {
  /** Total testosterone (ng/dL). */
  total_testosterone_ng_dl: number;
  age: number;
  /** Body-fat percentage. */
  body_fat_pct: number;
  /** Self-reported scalp androgen sensitivity (1 = low, 10 = very high). */
  scalp_sensitivity: number;
  /** Family history of male-pattern baldness. */
  mpb_family_history: boolean;
  /** Reported oily skin / acne severity (0–3). */
  sebum_activity: number;
}

export interface FiveAlphaResult {
  /** 0–100 index of estimated 5-alpha-reductase activity (educational). */
  five_ar_activity_index: number;
  /** Educational DHT conversion fraction of total testosterone (%). */
  dht_conversion_fraction_pct: number;
  /** Educational estimated DHT (ng/dL). */
  estimated_dht_ng_dl: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  education: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Reference 5-AR conversion fraction used as the educational mid-point (%). */
export const REFERENCE_CONVERSION_FRACTION = 5;

export function assessFiveAlphaConversion(input: FiveAlphaInput): FiveAlphaResult {
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  let activity = 55;

  // Age: 5-AR activity tends to be higher in younger adults.
  const age = clamp(input.age, 16, 100);
  if (age <= 30) activity += 10;
  else if (age <= 45) activity += 4;
  else if (age <= 60) activity -= 2;
  else activity -= 8;
  factors.push(`Age ${round(age, 0)} is used as a weak proxy for 5-AR activity.`);

  // Body fat: higher adiposity is loosely associated with altered androgen metabolism.
  const bf = clamp(input.body_fat_pct, 3, 60);
  if (bf > 25) {
    activity += clamp((bf - 25) * 0.6, 0, 10);
    factors.push('Higher body fat is included as a weak modifier of androgen metabolism.');
  } else if (bf < 10) {
    activity -= 4;
  }

  // Sebum activity proxy.
  const sebum = clamp(input.sebum_activity, 0, 3);
  activity += sebum * 5;
  if (sebum >= 2) factors.push('Reported oily skin/acne raises the estimated 5-AR activity proxy.');

  // Scalp sensitivity (symptom context, not enzyme activity).
  const scalp = clamp(input.scalp_sensitivity, 1, 10);
  activity += (scalp - 5) * 2;
  if (scalp >= 8) {
    factors.push('High self-reported scalp androgen sensitivity.');
    flags.push('high_scalp_sensitivity');
  }
  if (input.mpb_family_history) {
    factors.push('Family history of male-pattern baldness increases DHT sensitivity of scalp follicles.');
    flags.push('mpb_family_history');
  }

  const index = round(clamp(activity, 0, 100), 0);
  const band: FiveAlphaResult['band'] = index >= 65 ? 'high' : index >= 40 ? 'moderate' : 'low';

  // Educational conversion estimate: fraction scales with the activity index.
  const fraction = clamp((index / 55) * REFERENCE_CONVERSION_FRACTION, 0.5, 15);
  const total = clamp(input.total_testosterone_ng_dl, 0, 3000);
  const estimatedDht = (total * fraction) / 100;

  education.push('5-alpha-reductase converts testosterone to DHT, a far more potent androgen at the receptor.');
  education.push('DHT drives scalp follicle miniaturisation and prostate growth in genetically susceptible people.');
  education.push('This is an educational estimate only — DHT requires a laboratory assay.');
  education.push('No 5-AR inhibitor, dose or treatment is recommended by this tool.');

  if (index >= 65 && (input.mpb_family_history || scalp >= 8)) {
    flags.push('clinical_review_suggested');
    education.push('Discuss hair and prostate concerns with a clinician; treatment decisions are clinical.');
  }
  if (total > 1500) {
    flags.push('supraphysiologic_total_testosterone');
    education.push('A very high total testosterone increases the substrate available for DHT conversion.');
  }

  return {
    five_ar_activity_index: index,
    dht_conversion_fraction_pct: round(fraction, 2),
    estimated_dht_ng_dl: round(estimatedDht, 1),
    band,
    contributing_factors: factors,
    education,
    safety_flags: flags,
    educational_notice:
      'Educational estimate only. 5-alpha-reductase activity and DHT require laboratory measurement and clinical interpretation; this tool never prescribes treatment.',
  };
}
