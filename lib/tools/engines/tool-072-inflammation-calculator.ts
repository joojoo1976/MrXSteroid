/**
 * Tool #072 — Systemic Inflammation Calculator (Educational)
 * Layer 72: lifestyle inflammation index with optional hs-CRP/ESR context.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a diagnosis of any inflammatory condition.
 *  - Optional hs-CRP/ESR are interpreted only as orientation bands; very high
 *    values are flagged for prompt clinical review.
 *  - Never recommends an anti-inflammatory drug, biologic or dose.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface InflammationInput {
  /** Optional high-sensitivity CRP (mg/L); null when unknown. */
  hs_crp_mg_l: number | null;
  /** Optional erythrocyte sedimentation rate (mm/hr); null when unknown. */
  esr_mm_hr: number | null;
  age: number;
  bmi: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Moderate activity days per week. */
  exercise_days: number;
  /** Standard alcoholic drinks per week. */
  alcohol_units_week: number;
  /** Fruit + vegetable servings per day. */
  produce_servings: number;
  /** Oily-fish servings per week (omega-3). */
  oily_fish_servings: number;
  /** Added-sugar servings per day. */
  sugar_servings: number;
  /** Perceived stress 1 (low) – 10 (high). */
  stress_level: number;
  smoker: boolean;
}

export interface InflammationResult {
  /** 0–100, higher = greater estimated inflammatory load. */
  inflammation_index: number;
  band: 'low' | 'moderate' | 'high';
  hs_crp_band: 'normal' | 'moderate' | 'high' | 'very-high' | 'unknown';
  contributing_factors: string[];
  recommendations: string[];
  urgent_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function hsCrpBand(v: number | null): InflammationResult['hs_crp_band'] {
  if (v === null || Number.isNaN(v)) return 'unknown';
  if (v < 1) return 'normal';
  if (v < 3) return 'moderate';
  if (v < 10) return 'high';
  return 'very-high';
}

export function assessInflammation(input: InflammationInput): InflammationResult {
  let score = 25;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const band = hsCrpBand(input.hs_crp_mg_l);
  if (band !== 'unknown') {
    factors.push(`hs-CRP ${input.hs_crp_mg_l} mg/L (${band}).`);
    if (band === 'very-high') {
      score += 30;
      flags.push('very_high_hs_crp');
      recommendations.push('A very high hs-CRP requires prompt clinical review to find the cause.');
    } else if (band === 'high') {
      score += 18;
      flags.push('high_hs_crp');
    } else if (band === 'moderate') {
      score += 6;
    }
  }

  if (input.esr_mm_hr !== null) {
    if (input.esr_mm_hr >= 40) {
      score += 12;
      flags.push('high_esr');
      factors.push(`Elevated ESR (${input.esr_mm_hr} mm/hr).`);
    } else {
      factors.push(`ESR ${input.esr_mm_hr} mm/hr.`);
    }
  }

  const bmi = clamp(input.bmi, 10, 70);
  if (bmi >= 30) {
    score += 12;
    factors.push('Obesity is associated with chronic low-grade inflammation.');
    recommendations.push('Weight reduction where appropriate lowers inflammatory load.');
  } else if (bmi >= 25) {
    score += 5;
  }

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep < 6) {
    score += 8;
    flags.push('short_sleep');
    factors.push('Short sleep is associated with higher inflammatory markers.');
  } else if (sleep >= 7) {
    score -= 4;
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  score -= (exercise / 5) * 8;
  if (exercise < 2) {
    factors.push('Low activity is associated with higher inflammatory load.');
    recommendations.push('Regular moderate activity lowers inflammatory markers.');
  }

  const produce = clamp(input.produce_servings, 0, 12);
  score -= clamp(produce * 1.2, 0, 10);
  const fish = clamp(input.oily_fish_servings, 0, 10);
  score -= clamp(fish * 1.5, 0, 8);
  if (fish < 1) {
    recommendations.push('Consider oily fish for omega-3 intake (food-first).');
  }

  const sugar = clamp(input.sugar_servings, 0, 15);
  if (sugar >= 4) {
    score += clamp((sugar - 3) * 1.5, 0, 8);
    factors.push('High added-sugar intake is associated with inflammation.');
  }

  const alcohol = clamp(input.alcohol_units_week, 0, 80);
  if (alcohol > 14) {
    score += clamp((alcohol - 14) * 0.4, 0, 8);
    flags.push('high_alcohol_intake');
  }

  const stress = clamp(input.stress_level, 1, 10);
  if (stress >= 7) {
    score += 6;
    factors.push('High perceived stress is associated with higher inflammatory markers.');
  }

  if (input.smoker) {
    score += 10;
    flags.push('smoker');
    factors.push('Smoking raises systemic inflammation.');
  }
  if (input.age >= 60) score += 3;

  const index = round(clamp(score, 0, 100), 0);
  const indexBand: InflammationResult['band'] = index <= 33 ? 'low' : index <= 60 ? 'moderate' : 'high';
  const urgent = band === 'very-high';

  recommendations.push('This tool never recommends an anti-inflammatory drug or dose.');
  recommendations.push('Educational index only — it does not diagnose an inflammatory condition.');

  return {
    inflammation_index: index,
    band: indexBand,
    hs_crp_band: band,
    contributing_factors: factors,
    recommendations,
    urgent_review_advised: urgent,
    safety_flags: flags,
    educational_notice:
      'Educational lifestyle index only. It does not diagnose any inflammatory condition and never recommends medication or dosing.',
  };
}
