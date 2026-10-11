/**
 * Tool #069 — Detoxification Optimizer (Educational)
 * Layer 69: hepatic/renal clearance-support index from lifestyle inputs.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational lifestyle index; NOT a liver/kidney test and NOT a "detox".
 *  - The body clears xenobiotics via the liver and kidneys; no chelation,
 *    "flush", enema or drug protocol is ever recommended.
 *  - No supplement, herb or medication dose is prescribed.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Sex = 'male' | 'female';

export interface DetoxInput {
  age: number;
  sex: Sex;
  /** Total daily water intake (litres). */
  water_liters: number;
  /** Daily dietary fibre (g). */
  fiber_g: number;
  /** Standard alcoholic drinks per week. */
  alcohol_units_week: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Moderate-intensity activity days per week. */
  exercise_days: number;
  /** Overall diet quality self-rating 1 (poor) – 5 (excellent). */
  diet_quality: number;
  /** Servings of fruit + vegetables per day. */
  produce_servings: number;
  smoker: boolean;
  /** Known chronic liver disease. */
  liver_condition: boolean;
  /** Known chronic kidney disease. */
  kidney_condition: boolean;
}

export interface DetoxResult {
  /** 0–100, higher = better lifestyle support for natural clearance. */
  clearance_support_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  clinical_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessDetoxSupport(input: DetoxInput): DetoxResult {
  let score = 60;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const water = clamp(input.water_liters, 0, 6);
  if (water >= 2) {
    score += 8;
    factors.push('Hydration is in a supportive range.');
  } else {
    score -= clamp((2 - water) * 6, 0, 12);
    factors.push('Hydration is below a supportive range.');
    recommendations.push('Aim for regular water intake across the day (individual needs vary).');
  }

  const fiber = clamp(input.fiber_g, 0, 60);
  if (fiber >= 25) {
    score += 8;
    factors.push('Fibre intake is in a supportive range.');
  } else {
    score -= clamp((25 - fiber) / 5, 0, 8);
    factors.push('Fibre intake is below the reference range.');
    recommendations.push('Increase fibre-rich foods (vegetables, legumes, whole grains).');
  }

  const alcohol = clamp(input.alcohol_units_week, 0, 60);
  if (alcohol === 0) {
    score += 6;
    factors.push('No reported alcohol intake.');
  } else if (alcohol <= 7) {
    score -= 2;
    factors.push('Low-to-moderate alcohol intake reported.');
  } else {
    score -= clamp(4 + (alcohol - 7) * 0.8, 0, 20);
    factors.push('Higher alcohol intake places extra load on hepatic clearance.');
    recommendations.push('Reducing alcohol intake supports liver and metabolic health.');
    flags.push('high_alcohol_intake');
  }

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep >= 7 && sleep <= 9) {
    score += 6;
    factors.push('Sleep duration is in the restorative range.');
  } else if (sleep < 6) {
    score -= 8;
    factors.push('Short sleep duration may impair recovery and metabolic clearance.');
    recommendations.push('Prioritise 7–9 hours of sleep where possible.');
    flags.push('short_sleep');
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  score += (exercise / 5) * 6;
  if (exercise >= 3) factors.push('Regular activity supports circulation and organ perfusion.');
  else recommendations.push('Add regular moderate activity most days if medically appropriate.');

  const produce = clamp(input.produce_servings, 0, 12);
  score += clamp(produce, 0, 6);
  if (produce < 3) {
    factors.push('Low fruit/vegetable intake reported.');
    recommendations.push('Increase fruit and vegetable variety for micronutrient support.');
  }

  const diet = clamp(input.diet_quality, 1, 5);
  score += (diet - 3) * 3;

  if (input.smoker) {
    score -= 12;
    factors.push('Smoking adds a substantial xenobiotic load.');
    recommendations.push('Smoking cessation is the single most impactful step for organ health.');
    flags.push('smoker');
  }

  if (input.liver_condition) {
    score -= 10;
    factors.push('Known chronic liver disease reported.');
    flags.push('liver_condition');
    recommendations.push('Follow your clinician\'s monitoring plan for liver health.');
  }
  if (input.kidney_condition) {
    score -= 10;
    factors.push('Known chronic kidney disease reported.');
    flags.push('kidney_condition');
    recommendations.push('Follow your clinician\'s monitoring plan for kidney health.');
  }

  if (input.age >= 65) {
    score -= 4;
    factors.push('Older age is associated with reduced clearance reserve.');
  }

  const index = round(clamp(score, 0, 100), 0);
  const band: DetoxResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';
  const review = input.liver_condition || input.kidney_condition || band === 'low';

  recommendations.push('The liver and kidneys perform clearance continuously — no "detox" product replaces this.');
  recommendations.push('This tool is educational and never recommends chelation, flushes or drug protocols.');

  return {
    clearance_support_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    clinical_review_advised: review,
    safety_flags: flags,
    educational_notice:
      'Educational lifestyle index only. It is not a liver or kidney test and does not measure toxin clearance. No chelation, flush or drug protocol is recommended.',
  };
}
