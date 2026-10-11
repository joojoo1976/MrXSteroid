/**
 * Tool #77 — Nitric Oxide Optimizer (Educational)
 * Layer 77: educational NO-support index from diet/activity inputs.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a measurement of nitric-oxide production.
 *  - Never recommends L-arginine, L-citrulline, nitrates or any supplement/dose.
 *  - Chest pain or breathing difficulty at rest escalate to urgent care.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface NitricOxideInput {
  age: number;
  /** Leafy-green servings per day (spinach, rocket, lettuce). */
  leafy_green_servings: number;
  /** Beetroot servings per week. */
  beetroot_servings: number;
  /** Other nitrate-rich vegetables (celery, cress) most days. */
  nitrate_rich_veg: boolean;
  /** Moderate activity days per week. */
  exercise_days: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Protein foods rich in arginine (nuts, seeds, legumes, poultry). */
  arginine_rich_foods: boolean;
  /** Regular antiseptic mouthwash use (may reduce oral nitrate reduction). */
  mouthwash_use: boolean;
  smoker: boolean;
  /** Chest pain, pressure or tightness. */
  chest_pain: boolean;
  /** Breathing difficulty. */
  breathing_difficulty: boolean;
}

export interface NitricOxideResult {
  /** 0–100, higher = better estimated NO-support profile. */
  no_support_index: number;
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
  'You reported chest pain or breathing difficulty. Seek emergency medical care now — call your local emergency number. Do not wait and do not try to self-treat. This tool cannot provide emergency care.';

export function assessNitricOxide(input: NitricOxideInput): NitricOxideResult {
  let score = 55;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const leafy = clamp(input.leafy_green_servings, 0, 8);
  score += clamp(leafy * 2, 0, 10);
  if (leafy >= 2) factors.push('Leafy greens supply dietary nitrate for the nitrate–nitrite–NO pathway.');
  else recommendations.push('Increase leafy-green intake where appropriate.');

  const beet = clamp(input.beetroot_servings, 0, 14);
  score += clamp(beet * 1.5, 0, 8);
  if (beet >= 1) factors.push('Beetroot contributes dietary nitrate.');

  if (input.nitrate_rich_veg) {
    score += 6;
    factors.push('Regular nitrate-rich vegetables are reported.');
  }

  const exercise = clamp(input.exercise_days, 0, 7);
  score += (exercise / 5) * 12;
  if (exercise >= 3) factors.push('Regular aerobic activity upregulates endothelial NO synthase.');
  else recommendations.push('Regular aerobic activity supports endothelial NO production.');

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep >= 7) score += 4;
  else if (sleep < 6) {
    score -= 6;
    factors.push('Short sleep is associated with reduced endothelial function.');
  }

  if (input.arginine_rich_foods) {
    score += 6;
    factors.push('Arginine-rich protein foods support the NO precursor pool.');
  }

  if (input.mouthwash_use) {
    score -= 6;
    factors.push('Regular antiseptic mouthwash may reduce oral nitrate-reducing bacteria.');
    flags.push('mouthwash_use');
  }

  if (input.smoker) {
    score -= 14;
    factors.push('Smoking impairs endothelial NO production.');
    recommendations.push('Smoking cessation improves endothelial function.');
    flags.push('smoker');
  }

  if (input.age >= 60) score -= 4;

  const emergency = input.chest_pain || input.breathing_difficulty;
  if (emergency) flags.push('cardiac_red_flag');

  const index = round(clamp(score, 0, 100), 0);
  const band: NitricOxideResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';

  if (emergency) recommendations.unshift('Seek emergency care immediately for chest pain or breathing difficulty.');
  recommendations.push('This tool never recommends L-arginine, L-citrulline, nitrate or any supplement dose.');
  recommendations.push('Educational index only — it does not measure nitric-oxide production.');

  return {
    no_support_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    emergency,
    emergency_message: emergency ? EMERGENCY_MESSAGE : null,
    safety_flags: flags,
    educational_notice:
      'Educational index only. It does not measure nitric-oxide production and never recommends supplement or drug dosing.',
  };
}
