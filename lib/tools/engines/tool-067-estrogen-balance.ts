/**
 * Tool #067 — Estrogen Balance Calculator (Educational)
 * Layer 67: E2:T ratio balance classification from lab values.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational interpretation aid; NOT a diagnosis.
 *  - Never recommends aromatase inhibitors, SERMs or any dose.
 *  - Extreme ratios escalate to clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Sex = 'male' | 'female';

export interface EstrogenBalanceInput {
  sex: Sex;
  /** Estradiol (pg/mL). */
  estradiol_pg_ml: number;
  /** Total testosterone (ng/dL). */
  total_testosterone_ng_dl: number;
  /** SHBG (nmol/L). */
  shbg_nmol_l: number;
  /** Reported high-estrogen symptoms (0–3 severity). */
  high_e2_symptoms: number;
  /** Reported low-estrogen symptoms (0–3 severity). */
  low_e2_symptoms: number;
}

export interface EstrogenBalanceResult {
  /** Estradiol : testosterone ratio (pg/mL per ng/dL). */
  e2_t_ratio: number;
  /** Normalised balance index: 50 = balanced, >50 = estrogen-dominant, <50 = estrogen-low. */
  balance_index: number;
  classification: 'estrogen-low' | 'balanced' | 'estrogen-dominant';
  symptom_discordance: boolean;
  contributing_factors: string[];
  education: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

/** Male reference E2:T ratio band (pg/mL ÷ ng/dL). */
export const MALE_RATIO_LOW = 0.02;
export const MALE_RATIO_HIGH = 0.08;
/** Female reference E2:T ratio band (pg/mL ÷ ng/dL) — much higher. */
export const FEMALE_RATIO_LOW = 0.3;
export const FEMALE_RATIO_HIGH = 3.0;

export function assessEstrogenBalance(input: EstrogenBalanceInput): EstrogenBalanceResult {
  const factors: string[] = [];
  const education: string[] = [];
  const flags: string[] = [];

  const total = clamp(input.total_testosterone_ng_dl, 0, 3000);
  const e2 = clamp(input.estradiol_pg_ml, 0, 1000);
  const ratio = total > 0 ? e2 / total : 0;

  const low = input.sex === 'female' ? FEMALE_RATIO_LOW : MALE_RATIO_LOW;
  const high = input.sex === 'female' ? FEMALE_RATIO_HIGH : MALE_RATIO_HIGH;
  const mid = (low + high) / 2;

  // Map the ratio onto a 0–100 scale centred at 50 = balanced mid-point.
  let balance = 50;
  if (ratio > mid) balance = 50 + clamp(((ratio - mid) / (high - mid)) * 50, 0, 50);
  else balance = 50 - clamp(((mid - ratio) / (mid - low)) * 50, 0, 50);
  balance = round(clamp(balance, 0, 100), 0);

  const classification: EstrogenBalanceResult['classification'] =
    ratio > high ? 'estrogen-dominant' : ratio < low ? 'estrogen-low' : 'balanced';

  factors.push(`E2:T ratio = ${round(ratio, 4)} (reference band ${low}–${high} for ${input.sex}).`);
  if (input.shbg_nmol_l > 60) factors.push('High SHBG may lower the free fraction of both hormones.');
  if (input.shbg_nmol_l < 15) factors.push('Low SHBG may raise the free fraction of both hormones.');
  if (total > 1500) factors.push('Total testosterone is supraphysiologic, inflating the denominator.');

  const hiSym = clamp(input.high_e2_symptoms, 0, 3);
  const loSym = clamp(input.low_e2_symptoms, 0, 3);
  const discordance =
    (classification === 'estrogen-dominant' && loSym > hiSym) ||
    (classification === 'estrogen-low' && hiSym > loSym);
  if (discordance) {
    flags.push('symptom_lab_discordance');
    education.push('Reported symptoms and the lab ratio point in opposite directions — clinical review is warranted.');
  }

  if (classification !== 'balanced') flags.push('outside_reference_ratio');
  if (classification === 'estrogen-dominant' && hiSym >= 3) flags.push('marked_estrogen_symptoms');
  if (classification === 'estrogen-low' && loSym >= 3) flags.push('marked_low_estrogen_symptoms');

  education.push('Estradiol is essential in both sexes (bone, libido, lipids) — balance matters more than suppression.');
  education.push('Reference bands differ substantially between sexes; the ratio alone is not diagnostic.');
  education.push('This tool never recommends an aromatase inhibitor, SERM or dose.');

  return {
    e2_t_ratio: round(ratio, 4),
    balance_index: balance,
    classification,
    symptom_discordance: discordance,
    contributing_factors: factors,
    education,
    safety_flags: flags,
    educational_notice:
      'Educational interpretation aid only. Estrogen balance requires clinical context and laboratory confirmation; this tool does not diagnose or prescribe.',
  };
}
