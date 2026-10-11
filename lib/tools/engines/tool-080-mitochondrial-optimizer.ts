/**
 * Tool #80 — Mitochondrial Optimizer (Educational)
 * Layer 80: mitochondrial-health index from activity, sleep, diet and thermal exposure.
 * ════════════════════════════════════════════════════════════════════════════
 * SAFETY (SPEC §15, §19, §40):
 *  - Educational index; NOT a measurement of mitochondrial function.
 *  - Never recommends supplements (e.g. NAD+ precursors), drugs or doses.
 *  - Cold/heat exposure must be medically appropriate; cardiovascular caution.
 * ════════════════════════════════════════════════════════════════════════════
 */

export interface MitochondrialInput {
  age: number;
  /** Combined exercise days per week (cardio + resistance). */
  exercise_days: number;
  /** Average nightly sleep (hours). */
  sleep_hours: number;
  /** Dietary diversity self-rating 1 (poor) – 5 (excellent). */
  diet_diversity: number;
  /** Deliberate cold-exposure sessions per week. */
  cold_exposure_days: number;
  /** Sauna/heat-exposure sessions per week. */
  heat_exposure_days: number;
  /** Perceived stress 1 (low) – 10 (high). */
  stress_level: number;
  smoker: boolean;
  /** Known cardiovascular disease (thermal exposure caution). */
  cardiovascular_disease: boolean;
}

export interface MitochondrialResult {
  /** 0–100, higher = better estimated mitochondrial-health profile. */
  mitochondrial_health_index: number;
  band: 'low' | 'moderate' | 'high';
  contributing_factors: string[];
  recommendations: string[];
  safety_flags: string[];
  educational_notice: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

export function assessMitochondrialHealth(input: MitochondrialInput): MitochondrialResult {
  let score = 55;
  const factors: string[] = [];
  const recommendations: string[] = [];
  const flags: string[] = [];

  const exercise = clamp(input.exercise_days, 0, 7);
  score += (exercise / 5) * 16;
  if (exercise >= 3) factors.push('Regular exercise stimulates mitochondrial biogenesis.');
  else recommendations.push('Regular aerobic and resistance activity supports mitochondrial health.');

  const sleep = clamp(input.sleep_hours, 0, 12);
  if (sleep >= 7 && sleep <= 9) {
    score += 8;
    factors.push('Adequate sleep supports mitochondrial repair.');
  } else if (sleep < 6) {
    score -= 10;
    factors.push('Short sleep impairs mitochondrial function.');
    flags.push('short_sleep');
  }

  const diet = clamp(input.diet_diversity, 1, 5);
  score += (diet - 3) * 4;
  if (diet <= 2) {
    factors.push('Low dietary diversity reduces micronutrient support.');
    recommendations.push('Increase variety of whole, minimally processed foods.');
  }

  const cold = clamp(input.cold_exposure_days, 0, 7);
  if (cold >= 1 && cold <= 5) {
    score += 5;
    factors.push('Regular cold exposure may support mitochondrial adaptation.');
  }
  if (input.cardiovascular_disease && (cold >= 1 || input.heat_exposure_days >= 1)) {
    flags.push('thermal_caution_cvd');
    recommendations.push('Cold/heat exposure requires medical clearance with cardiovascular disease.');
  }

  const heat = clamp(input.heat_exposure_days, 0, 7);
  if (heat >= 1 && heat <= 5) {
    score += 5;
    factors.push('Sauna/heat exposure may support mitochondrial and cardiovascular health.');
  }

  const stress = clamp(input.stress_level, 1, 10);
  if (stress >= 7) {
    score -= 8;
    factors.push('High perceived stress is associated with mitochondrial dysfunction.');
    flags.push('high_stress');
  }

  if (input.smoker) {
    score -= 14;
    factors.push('Smoking damages mitochondria.');
    recommendations.push('Smoking cessation supports mitochondrial health.');
    flags.push('smoker');
  }

  if (input.age >= 60) score -= 4;

  const index = round(clamp(score, 0, 100), 0);
  const band: MitochondrialResult['band'] = index >= 70 ? 'high' : index >= 45 ? 'moderate' : 'low';

  recommendations.push('This tool never recommends NAD+ precursors, supplements or doses.');
  recommendations.push('Educational index only — it does not measure mitochondrial function.');

  return {
    mitochondrial_health_index: index,
    band,
    contributing_factors: factors,
    recommendations,
    safety_flags: flags,
    educational_notice:
      'Educational index only. It does not measure mitochondrial function and never recommends supplements, drugs or dosing.',
  };
}
