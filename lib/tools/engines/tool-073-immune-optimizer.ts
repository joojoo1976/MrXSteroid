/**
 * Tool #073 — Immune System Optimizer (Educational)
 * Layer 73: immune-support index from sleep/nutrition/activity.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT an immune-function test.
 *  - Never recommends a supplement, "immune booster" or dose.
 *  - Persistent fever, breathing difficulty or severe symptoms need urgent care.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface ImmuneInput {
  age: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Protein intake adequacy self-rating 1 (poor) – 5 (excellent). */
  protein_adequacy: number;
  /** Fruit + vegetable servings per day. */
  produce_servings: number;
  /** Moderate activity days per week. */
  exercise_days: number;
  /** Perceived stress 1 (low) – 10 (high). */
  stress_level: number;
  /** Standard alcoholic drinks per week. */
  alcohol_units_week: number;
  smoker: boolean;
  /** Diagnosed vitamin D deficiency (lab-confirmed). */
  vitamin_d_deficiency: boolean;
  /** Recent recurrent infections (≥3 in past year). */
  recurrent_infections: boolean;
  /** Fever with breathing difficulty or severe symptoms right now. */
  fever_breathing_difficulty: boolean;
}

export interface ImmuneResult {
  /** 0–100, higher = better estimated immune-support profile. */
  immune_support_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  emergency: boolean;
  emergency_message: string | null;
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export const EMERGENCY_MESSAGE =
  'You reported fever with breathing difficulty or severe symptoms. Seek emergency medical care now (call your local emergency number). Do not wait and do not attempt to self-treat. This tool cannot provide emergency care.';

export function assessImmuneSupport(input: ImmuneInput): ImmuneResult {
  let score = 65;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep >= 7 && sleep <= 9) {
    score += 8;
    factors.push('Sleep duration supports normal immune function.');
  } else if (sleep < 6) {
    score -= 12;
    factors.push('Short sleep impairs immune defence.');
    recommendations.push('Prioritise 7–9 hours of sleep where possible.');
    flags.push('short_sleep');
  }

  const protein = clamp(input.protein_adequacy, 1, 5);
  score += (protein - 3) * 3;
  if (protein <= 2) {
    factors.push('Low protein adequacy may impair immune responses.');
    recommendations.push('Ensure adequate protein intake from varied whole foods.');
  }

  const produce = clamp(input.produce_servings, 0, 12);
  score += clamp(produce * 1.2, 0, 8);
  if (produce < 3) {
    factors.push('Low fruit/vegetable intake reduces micronutrient support.');
    recommendations.push('Increase fruit and vegetable variety.');
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  if (exercise >= 3 && exercise <= 6) {
    score += 6;
    factors.push('Regular moderate activity supports immune surveillance.');
  } else if (exercise < 1) {
    score -= 6;
    factors.push('Very low activity is associated with weaker immune function.');
  }

  const stress = clamp(input.stress_level, 1, 10);
  if (stress >= 7) {
    score -= 8;
    factors.push('High perceived stress can suppress immune function.');
    recommendations.push('Stress-management practices may help (sleep hygiene, mindfulness).');
    flags.push('high_stress');
  }

  const alcohol = clamp(input.alcohol_units_week, 0, 80);
  if (alcohol > 14) {
    score -= 8;
    factors.push('High alcohol intake impairs immune function.');
    flags.push('high_alcohol_intake');
  }

  if (input.smoker) {
    score -= 10;
    factors.push('Smoking impairs respiratory and systemic immunity.');
    flags.push('smoker');
  }

  if (input.vitamin_d_deficiency) {
    score -= 8;
    factors.push('Lab-confirmed vitamin D deficiency is associated with impaired immunity.');
    recommendations.push('Discuss vitamin D correction with your clinician (no dose is given here).');
    flags.push('vitamin_d_deficiency');
  }

  if (input.recurrent_infections) {
    score -= 10;
    factors.push('Recurrent infections warrant clinical assessment of immune function.');
    recommendations.push('Arrange a clinical review for recurrent infections.');
    flags.push('recurrent_infections');
  }

  if (input.age >= 65) {
    score -= 4;
    factors.push('Older age is associated with immunosenescence.');
  }

  const emergency = input.fever_breathing_difficulty;
  if (emergency) flags.push('immune_red_flag');

  const index = round(clamp(score, 0, 100), 0);
  const band: ImmuneResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';

  if (emergency) {
    recommendations.unshift('Seek emergency care immediately for fever with breathing difficulty.');
  }
  recommendations.push('This tool never recommends a supplement, "immune booster" or dose.');
  recommendations.push('Educational index only — it does not measure immune function.');

  return {
    immune_support_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    emergency,
    emergency_message: emergency ? EMERGENCY_MESSAGE : null,
    safety_flags: flags,
    educational_notice:
      'Educational lifestyle index only. It does not measure immune function and never recommends supplements or dosing.',
  };
}
