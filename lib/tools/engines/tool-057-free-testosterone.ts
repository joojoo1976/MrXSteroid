/**
 * Tool #057 — Free Testosterone Manager (Educational)
 * Layer 57: SHBG/albumin binding maths & free-hormone orientation.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational estimation only; NOT a laboratory assay or a diagnosis.
 *  - Never recommends or computes a hormone dose.
 *  - Severe hypogonadism values escalate to "seek clinician review".
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Sex = 'male' | 'female';

export interface FreeTestosteroneInput {
  /** Total testosterone (ng/dL). */
  total_testosterone_ng_dl: number;
  /** Sex-hormone-binding globulin (nmol/L). */
  shbg_nmol_l: number;
  /** Serum albumin (g/L). Physiological default ≈ 43 g/L. */
  albumin_g_l: number;
  age: number;
  sex: Sex;
}

export interface FreeTestosteroneResult {
  /** Estimated free testosterone (ng/dL). */
  free_testosterone_ng_dl: number;
  /** Free fraction as a percentage of total testosterone. */
  free_fraction_pct: number;
  /** Bioavailable (free + albumin-bound) testosterone (ng/dL). */
  bioavailable_ng_dl: number;
  /** SHBG-bound (inactive) testosterone (ng/dL). */
  shbg_bound_ng_dl: number;
  band: 'low' | 'normal' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  clinical_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Conversion factor ng/dL ← nmol/L (testosterone, MW 288.4). */
export const NMOL_L_TO_NG_DL = 28.842;

/** Association constants (L/mol) — Vermeulen et al. 1999. */
export const K_SHBG_TESTOSTERONE = 1.0e9;
export const K_ALBUMIN_TESTOSTERONE = 3.6e4;
/** Albumin molar mass (g/mol). */
export const ALBUMIN_MOLAR_MASS = 66500;

/**
 * Solves the Vermeulen binding equation for the free testosterone fraction.
 * All concentrations are converted to mol/L; returns free T in nmol/L.
 */
export function solveFreeTestosteroneNmol(
  total_nmol_l: number,
  shbg_nmol_l: number,
  albumin_g_l: number,
): number {
  const T = Math.max(total_nmol_l, 0) * 1e-9;
  const S = Math.max(shbg_nmol_l, 0) * 1e-9;
  const A = Math.max(albumin_g_l, 0) / ALBUMIN_MOLAR_MASS;
  const kAlb = 1 + K_ALBUMIN_TESTOSTERONE * A;

  const a = K_SHBG_TESTOSTERONE * kAlb;
  const b = kAlb + K_SHBG_TESTOSTERONE * S - K_SHBG_TESTOSTERONE * T;
  const c = -T;

  const disc = b * b - 4 * a * c;
  if (disc <= 0 || a === 0) return 0;
  const x = (-b + Math.sqrt(disc)) / (2 * a); // free T in mol/L
  return x * 1e9;
}

export function assessFreeTestosterone(input: FreeTestosteroneInput): FreeTestosteroneResult {
  const total_nmol = clamp(input.total_testosterone_ng_dl, 0, 3000) / NMOL_L_TO_NG_DL;
  const free_nmol = solveFreeTestosteroneNmol(total_nmol, input.shbg_nmol_l, input.albumin_g_l);
  const free_ng_dl = free_nmol * NMOL_L_TO_NG_DL;

  const free_fraction = input.total_testosterone_ng_dl > 0
    ? (free_ng_dl / input.total_testosterone_ng_dl) * 100
    : 0;

  // Albumin-bound ≈ free × Ka·A ; SHBG-bound = total − free − albumin-bound.
  const kAlb = 1 + K_ALBUMIN_TESTOSTERONE * (input.albumin_g_l / ALBUMIN_MOLAR_MASS);
  const albuminBound = free_ng_dl * (kAlb - 1);
  const bioavailable = free_ng_dl + albuminBound;
  const shbgBound = Math.max(0, input.total_testosterone_ng_dl - bioavailable);

  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  // Age-adjusted lower reference bounds for free testosterone (ng/dL).
  const lower = input.sex === 'female' ? 0.2 : input.age >= 60 ? 6.5 : input.age >= 40 ? 8 : 9;
  const upper = input.sex === 'female' ? 1.4 : 30;

  let band: FreeTestosteroneResult['band'] = 'normal';
  if (free_ng_dl < lower) band = 'low';
  else if (free_ng_dl > upper) band = 'high';

  if (input.shbg_nmol_l > 60) {
    factors.push('High SHBG binds a larger share of total testosterone, lowering the free fraction.');
  } else if (input.shbg_nmol_l < 15) {
    factors.push('Low SHBG leaves a larger free fraction, even at the same total testosterone.');
  } else {
    factors.push('SHBG is within a common reference range.');
  }
  factors.push(`Estimated free fraction is ${round(free_fraction, 2)}% of total testosterone.`);

  if (band === 'low') {
    recommendations.push('Discuss the result with a clinician, who may repeat the assay with a validated method.');
    recommendations.push('Review sleep, energy and libido with your clinician; sample timing matters.');
  } else if (band === 'high') {
    recommendations.push('A high free fraction is not automatically beneficial; ask a clinician to interpret it.');
  } else {
    recommendations.push('Values fall in a common reference band — keep monitoring trends over time.');
  }

  // Red-flag escalation: severe hypogonadism range.
  let clinical_review_advised = band === 'low';
  if (input.sex === 'male' && input.total_testosterone_ng_dl > 0 && input.total_testosterone_ng_dl < 100) {
    clinical_review_advised = true;
    flags.push('severe_hypogonadism_range');
    recommendations.push(
      'Total testosterone is very low. Seek prompt clinical evaluation — do not self-treat with hormones.',
    );
  }
  if (free_ng_dl <= 0 && input.total_testosterone_ng_dl > 0) {
    flags.push('implausible_result');
    recommendations.push('Inputs produce an implausible result; re-check the units entered.');
  }
  if (clinical_review_advised) flags.push('clinical_review_advised');

  recommendations.push('This tool never computes or recommends a hormone dose.');

  return {
    free_testosterone_ng_dl: round(free_ng_dl, 2),
    free_fraction_pct: round(free_fraction, 2),
    bioavailable_ng_dl: round(bioavailable, 1),
    shbg_bound_ng_dl: round(shbgBound, 1),
    band,
    contributing_factors: factors,
    recommendations,
    clinical_review_advised,
    safety_flags: flags,
    educational_notice:
      'Educational estimate using the Vermeulen-style binding approximation. Free testosterone must be measured and interpreted by a clinical laboratory; this is not a diagnosis.',
  };
}
