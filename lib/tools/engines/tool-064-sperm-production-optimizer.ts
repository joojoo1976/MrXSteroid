/**
 * Tool #064 — Sperm Production Optimizer
 * Spermatogenesis recovery support: deterministic recovery score over time
 * off cycle (~74-day spermatogenesis cycle basis), HCG support, sleep,
 * training load and age. Educational, not a fertility treatment.
 * Pure engine, no I/O.
 */

export interface SpermProductionInput {
  months_since_last_cycle: number; // 0..36
  age: number; // 18..70
  hcg_used: boolean;
  weekly_training_hours: number; // 0..30
  sleep_hours: number; // 0..14
}

export interface SpermProductionResult {
  recovery_score: number; // 0..100
  band: 'early-recovery' | 'recovering' | 'recovered-context';
  recommendations: string[]; // fixed machine codes, in documented order
  warnings: string[];
}

export function optimizeSpermProduction(input: SpermProductionInput): SpermProductionResult {
  const { months_since_last_cycle, age, hcg_used, weekly_training_hours, sleep_hours } = input;
  const warnings: string[] = ['educational_not_fertility_treatment'];

  let score = months_since_last_cycle < 3 ? 30 : months_since_last_cycle < 6 ? 55 : 75;
  if (hcg_used) score += 5;
  if (age >= 40) score -= 10;
  if (sleep_hours >= 7) score += 5;
  score = Math.min(100, Math.max(0, score));

  const recommendations: string[] = [];
  if (months_since_last_cycle < 6) recommendations.push('wait_spermatogenesis_74d');
  if (!hcg_used) recommendations.push('hcg_discuss_with_physician');
  if (sleep_hours < 7) recommendations.push('sleep_7h');
  if (weekly_training_hours > 6) recommendations.push('training_6h_cap');

  const band: SpermProductionResult['band'] =
    score < 50 ? 'early-recovery' : score < 75 ? 'recovering' : 'recovered-context';

  return {
    recovery_score: score,
    band,
    recommendations,
    warnings: [...new Set(warnings)],
  };
}
