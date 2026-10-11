/**
 * Tool #79 — Fat Metabolism (Educational)
 * Layer 79: estimated fat-oxidation index from activity, diet and body composition.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a metabolic-cart testing or RER measurement.
 *  - Never recommends fat-burner supplements, stimulants or doses.
 *  - Very low body fat or extreme fasting should be clinically supervised.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface FatMetabolismInput {
  age: number;
  /** Cardiovascular activity days per week. */
  cardio_days: number;
  /** Resistance-training days per week. */
  resistance_days: number;
  /** Average daily steps. */
  daily_steps: number;
  /** Daily carbohydrate intake (g). */
  carb_grams: number;
  /** Protein adequacy self-rating 1 (poor) – 5 (excellent). */
  protein_adequacy: number;
  /** Estimated body-fat percentage (%). */
  body_fat_pct: number;
  /** Typical overnight fasting window (hours). */
  fasting_hours: number;
}

export interface FatMetabolismResult {
  /** 0–100, higher = better estimated fat-oxidation capacity. */
  fat_oxidation_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessFatMetabolism(input: FatMetabolismInput): FatMetabolismResult {
  let score = 50;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const cardio = clamp(input.cardio_days, 0, 7);
  score += (cardio / 5) * 14;
  if (cardio >= 3) factors.push('Regular cardio supports fat-oxidation capacity.');
  else recommendations.push('Add regular aerobic activity if medically appropriate.');

  const resistance = clamp(input.resistance_days, 0, 7);
  score += (resistance / 4) * 8;
  if (resistance >= 2) factors.push('Resistance training preserves lean mass, supporting fat metabolism.');

  const steps = clamp(input.daily_steps, 0, 30000);
  score += clamp((steps / 10000) * 8, 0, 10);
  if (steps < 5000) {
    factors.push('Low daily step count.');
    recommendations.push('Increasing daily movement raises energy expenditure.');
  }

  const carbs = clamp(input.carb_grams, 0, 800);
  if (carbs > 400) {
    score -= clamp((carbs - 400) / 40, 0, 8);
    factors.push('Very high carbohydrate intake may reduce reliance on fat oxidation.');
  } else if (carbs >= 100 && carbs <= 300) {
    score += 4;
    factors.push('Moderate carbohydrate intake is compatible with good fat oxidation.');
  }

  const protein = clamp(input.protein_adequacy, 1, 5);
  score += (protein - 3) * 3;
  if (protein <= 2) {
    factors.push('Low protein adequacy may reduce lean-mass preservation.');
    recommendations.push('Ensure adequate protein from varied whole foods.');
  }

  const bf = clamp(input.body_fat_pct, 3, 60);
  if (bf > 30) {
    score -= 8;
    factors.push('Higher body-fat percentage is associated with lower fat-oxidation efficiency.');
  } else if (bf < 8) {
    score -= 6;
    factors.push('Very low body-fat percentage may impair metabolic health.');
    flags.push('very_low_body_fat');
    recommendations.push('Very low body fat should be managed with clinical/dietetic support.');
  } else {
    score += 4;
  }

  const fast = clamp(input.fasting_hours, 0, 24);
  if (fast >= 12 && fast <= 16) {
    score += 6;
    factors.push('A moderate overnight fasting window supports fat oxidation.');
  } else if (fast > 20) {
    score -= 8;
    factors.push('Very prolonged fasting may be unsafe without supervision.');
    flags.push('prolonged_fasting');
    recommendations.push('Prolonged fasting should only be done under supervision.');
  }

  if (input.age >= 60) score -= 3;

  const index = round(clamp(score, 0, 100), 0);
  const band: FatMetabolismResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';

  recommendations.push('This tool never recommends fat-burner supplements, stimulants or doses.');
  recommendations.push('Educational index only — it does not measure fat oxidation directly.');

  return {
    fat_oxidation_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    safety_flags: flags,
    educational_notice:
      'Educational index only. It does not measure fat oxidation directly and never recommends supplements or dosing.',
  };
}
