/**
 * Tool #070 — Oxidative Stress (Educational)
 * Layer 70: composite oxidative-stress index from lifestyle/exposure inputs.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a laboratory oxidative-stress marker (no d-ROMs,
 *    MDA, 8-OHdG etc.). No biomarker is measured.
 *  - Never recommends an antioxidant supplement or dose.
 *  - Persistent concerning symptoms warrant clinical review.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface OxidativeStressInput {
  age: number;
  /** Cigarettes/day (0 = non-smoker). */
  cigarettes_per_day: number;
  /** Standard alcoholic drinks per week. */
  alcohol_units_week: number;
  /** Moderate activity days per week. */
  exercise_days: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Fruit + vegetable servings per day. */
  produce_servings: number;
  /** Ultra-processed food servings per day. */
  processed_food_servings: number;
  /** Perceived stress level 1 (low) – 10 (high). */
  stress_level: number;
  /** Regular exposure to air pollution / occupational irritants. */
  pollution_exposure: boolean;
  /** Frequent sunburn / excessive UV exposure without protection. */
  excessive_uv: boolean;
}

export interface OxidativeStressResult {
  /** 0–100, higher = greater estimated oxidative load. */
  oxidative_stress_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  clinical_review_advised: boolean;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessOxidativeStress(input: OxidativeStressInput): OxidativeStressResult {
  let score = 25;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const cigs = clamp(input.cigarettes_per_day, 0, 60);
  if (cigs > 0) {
    score += clamp(10 + cigs * 1.2, 0, 30);
    factors.push('Smoking is a major source of reactive oxygen species.');
    recommendations.push('Smoking cessation substantially reduces oxidative load.');
    flags.push('smoker');
  }

  const alcohol = clamp(input.alcohol_units_week, 0, 80);
  if (alcohol > 14) {
    score += clamp((alcohol - 14) * 0.5, 0, 12);
    factors.push('Higher alcohol intake increases oxidative stress.');
    recommendations.push('Reducing alcohol intake lowers oxidative load.');
    flags.push('high_alcohol_intake');
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  if (exercise >= 3) {
    score -= 8;
    factors.push('Regular moderate activity upregulates endogenous antioxidant defences.');
  } else {
    score += 6;
    factors.push('Low activity is associated with weaker antioxidant defences.');
    recommendations.push('Build up regular moderate activity if medically appropriate.');
  }

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep < 6) {
    score += 8;
    factors.push('Short sleep increases oxidative stress.');
    flags.push('short_sleep');
  } else if (sleep >= 7) {
    score -= 4;
  }

  const produce = clamp(input.produce_servings, 0, 12);
  if (produce >= 5) {
    score -= 10;
    factors.push('High fruit/vegetable intake supplies dietary antioxidants.');
  } else {
    score += clamp((5 - produce) * 2, 0, 10);
    factors.push('Low fruit/vegetable intake reduces dietary antioxidant supply.');
    recommendations.push('Increase fruit and vegetable variety.');
  }

  const processed = clamp(input.processed_food_servings, 0, 12);
  if (processed >= 4) {
    score += clamp((processed - 3) * 2, 0, 10);
    factors.push('High ultra-processed food intake is associated with higher oxidative stress.');
  }

  const stress = clamp(input.stress_level, 1, 10);
  if (stress >= 7) {
    score += 6;
    factors.push('High perceived stress is associated with increased oxidative markers.');
    recommendations.push('Stress-reduction practices may help (mindfulness, breathing, sleep hygiene).');
  }

  if (input.pollution_exposure) {
    score += 8;
    factors.push('Regular pollution/irritant exposure increases oxidative load.');
    flags.push('pollution_exposure');
  }
  if (input.excessive_uv) {
    score += 6;
    factors.push('Excessive UV exposure without protection increases oxidative stress.');
    flags.push('excessive_uv');
  }
  if (input.age >= 60) {
    score += 4;
    factors.push('Older age is associated with greater baseline oxidative load.');
  }

  const index = round(clamp(score, 0, 100), 0);
  const band: OxidativeStressResult['band'] = index <= 33 ? 'low' : index <= 60 ? 'moderate' : 'high';
  const review = band === 'high';

  recommendations.push('This tool never recommends an antioxidant supplement or dose.');
  recommendations.push('Educational index only — it does not measure any laboratory marker.');

  return {
    oxidative_stress_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    clinical_review_advised: review,
    safety_flags: flags,
    educational_notice:
      'Educational composite index only. It does not measure oxidative-stress biomarkers and never recommends antioxidant supplementation or dosing.',
  };
}
