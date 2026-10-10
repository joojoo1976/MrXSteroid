/**
 * Tool #059 — Androgen Receptor Optimizer
 * Androgen receptor upregulation guidance: a deterministic responsiveness
 * score (0–100) over documented modifiable factors (sleep, training density,
 * time off cycle). Educational guidance, not a lab measurement.
 * Pure engine, no I/O.
 */

export interface ReceptorResponsivenessInput {
  training_days_per_week: number; // 0..7
  sleep_hours: number; // 0..14
  weeks_since_last_break: number; // 0..104
  current_cycle_week: number; // 0..52
}

export interface ReceptorResponsivenessResult {
  score: number; // 0..100
  band: 'downregulated-context' | 'baseline' | 'responsive-context';
  recommendations: string[]; // fixed machine codes, in documented order
  warnings: string[];
}

const BASE_SCORE = 60;

export function scoreReceptorResponsiveness(input: ReceptorResponsivenessInput): ReceptorResponsivenessResult {
  const { training_days_per_week, sleep_hours, weeks_since_last_break, current_cycle_week } = input;
  const warnings: string[] = ['educational_guidance_not_lab'];

  let score = BASE_SCORE;
  const recommendations: string[] = [];

  if (sleep_hours >= 7.5) {
    score += 10;
  } else {
    recommendations.push('sleep_7_5h');
  }

  if (training_days_per_week >= 4 && training_days_per_week <= 5) {
    score += 8;
  } else if (training_days_per_week > 6) {
    score -= 8;
  }
  if (!(training_days_per_week >= 4 && training_days_per_week <= 5)) {
    recommendations.push('training_4_5_days');
  }

  if (weeks_since_last_break >= 8) {
    score += 12;
  } else if (weeks_since_last_break >= 4) {
    score += 6;
    recommendations.push('cycle_break_8_weeks');
  } else {
    recommendations.push('cycle_break_8_weeks');
  }

  if (current_cycle_week > 12) {
    score -= 10;
    recommendations.push('time_off_recommended');
  }

  score = Math.min(100, Math.max(0, score));
  const band: ReceptorResponsivenessResult['band'] =
    score < 50 ? 'downregulated-context' : score < 75 ? 'baseline' : 'responsive-context';

  return {
    score,
    band,
    recommendations,
    warnings: [...new Set(warnings)],
  };
}
