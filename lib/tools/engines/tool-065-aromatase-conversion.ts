/**
 * Tool #065 — Aromatase Conversion Calculator (Educational)
 * Layer 65: aromatisation-rate estimation from body-fat/age + E2:T ratio.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational estimate only; NOT an aromatase assay or diagnosis.
 *  - Never recommends aromatase inhibitors, doses or any drug.
 *  - Extreme E2:T ratios escalate to clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface AromataseInput {
  /** Body-fat percentage. */
  body_fat_pct: number;
  age: number;
  /** Total testosterone (ng/dL). */
  total_testosterone_ng_dl: number;
  /** Estradiol (pg/mL). */
  estradiol_pg_ml: number;
}

export interface AromataseResult {
  /** 0–100 aromatisation-rate index (higher = more aromatisation expected). */
  aromatization_index: number;
  /** Estradiol : testosterone ratio (pg/mL per ng/dL). */
  e2_t_ratio: number;
  /** Educational estradiol reference band for the ratio (low/typical/high). */
  ratio_band: 'low' | 'typical' | 'high';
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  education: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Typical male E2:T ratio band (pg/mL ÷ ng/dL). */
export const RATIO_LOW = 0.02;
export const RATIO_HIGH = 0.08;

export function assessAromatase(input: AromataseInput): AromataseResult {
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  const bf = clamp(input.body_fat_pct, 3, 60);
  const age = clamp(input.age, 16, 100);

  // Adipose tissue is the main extra-gonadal aromatase site.
  let index = 40 + clamp((bf - 15) * 2.2, -20, 45);
  factors.push(`Body fat (${round(bf, 1)}%) is the dominant aromatase driver in this model.`);

  if (age >= 50) {
    index += clamp((age - 50) * 0.3, 0, 10);
    factors.push('Age is included as a weak positive modifier.');
  }

  const total = clamp(input.total_testosterone_ng_dl, 0, 3000);
  const e2 = clamp(input.estradiol_pg_ml, 0, 500);
  const ratio = total > 0 ? e2 / total : 0;

  let ratioBand: AromataseResult['ratio_band'] = 'typical';
  if (ratio < RATIO_LOW) ratioBand = 'low';
  else if (ratio > RATIO_HIGH) ratioBand = 'high';

  if (ratioBand === 'high') {
    index += 12;
    factors.push('Estradiol is high relative to testosterone for a male reference band.');
  } else if (ratioBand === 'low') {
    index -= 8;
    factors.push('Estradiol is low relative to testosterone for a male reference band.');
  }

  if (total > 1500) {
    factors.push('A very high total testosterone provides more substrate for aromatisation.');
    flags.push('supraphysiologic_testosterone');
  }
  if (ratioBand === 'high' && bf > 30) {
    flags.push('high_aromatisation_context');
  }

  const finalIndex = round(clamp(index, 0, 100), 0);
  const band: AromataseResult['band'] = finalIndex >= 65 ? 'high' : finalIndex >= 40 ? 'moderate' : 'low';

  education.push('Aromatase converts androgens to estrogens; adipose tissue is a major extra-gonadal source.');
  education.push('Estradiol is physiologically necessary in men (bone, libido, lipids) — lower is not automatically better.');
  education.push('This estimate is not an aromatase assay; it never recommends an aromatase inhibitor or dose.');

  if (ratioBand === 'high' && e2 > 60) {
    flags.push('clinical_review_suggested');
    education.push('Discuss persistently high estradiol with a clinician — do not self-treat.');
  }

  return {
    aromatization_index: finalIndex,
    e2_t_ratio: round(ratio, 4),
    ratio_band: ratioBand,
    band,
    contributing_factors: factors,
    education,
    safety_flags: flags,
    educational_notice:
      'Educational estimate only. Aromatase activity and estradiol require laboratory measurement and clinical interpretation; no drug or dose is recommended.',
  };
}
