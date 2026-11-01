/**
 * Tool #121 - Muscle Group Recovery Time-Course Modeler
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates per-muscle recovery time-course
 * from training stimulus. It does not measure actual tissue recovery,
 * replace medical assessment, or guarantee injury prevention.
 * Results are educational references only.
 *
 * Model
 * -----
 * Recovery Time = Base_Time × Set_Factor × Intensity_Factor × Individual_Factor
 * Base times (hours): Chest/Back/Legs=72, Shoulders/Arms=48, Core=24
 * Volume_Factor: 1.0 + (sets-3)×0.15
 * Intensity_Factor: 1.0 + (RPE-7)×0.2
 * Individual_Factor: age/sleep/nutrition/stress/training experience
 */

export type RecoveryInput = {
  muscle_group: string;
  sets: number;
  rpe?: number;
  frequency_per_week: number;
  age: number;
  sleep_hours: number;
  protein_g_per_kg: number;
  stress_level: 1 | 2 | 3 | 4 | 5;
  training_age_years: number;
};

export interface RecoveryResult {
  muscle_group: string;
  estimated_recovery_hours: number;
  estimated_recovery_days: number;
  readiness_timeline: Array<{ hour: number; recovery_pct: number }>;
  volume_factor: number;
  intensity_factor: number;
  individual_factor: number;
  next_session_readiness_pct: number; // at next scheduled session
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

const BASE_RECOVERY_HOURS: Record<string, number> = {
  chest: 72, back: 72, quads: 72, hamstrings: 72, glutes: 72,
  shoulders: 48, biceps: 48, triceps: 48, forearms: 48,
  calves: 36, abs: 24, lower_back: 48,
};

function calcRecovery(input: RecoveryInput): RecoveryResult {
  const { muscle_group, sets, rpe, frequency_per_week, age, sleep_hours, protein_g_per_kg, stress_level, training_age_years } = input;

  const baseHours = BASE_RECOVERY_HOURS[muscle_group] ?? 48;
  
  // Volume factor
  const volumeFactor = 1 + Math.max(0, (sets - 3)) * 0.15;
  
  // Intensity factor
  const intensityFactor = 1 + Math.max(0, (rpe ?? 7) - 7) * 0.2;
  
  // Individual factor
  let individualFactor = 1.0;
  if (age > 40) individualFactor *= 1.15;
  else if (age > 30) individualFactor *= 1.05;
  if (sleep_hours < 7) individualFactor *= 1.2;
  else if (sleep_hours < 8) individualFactor *= 1.1;
  if (protein_g_per_kg < 1.6) individualFactor *= 1.1;
  if (stress_level >= 4) individualFactor *= 1.15;
  if (training_age_years < 1) individualFactor *= 1.2;
  else if (training_age_years > 5) individualFactor *= 0.95;

  const estimatedHours = Math.round(baseHours * volumeFactor * intensityFactor * individualFactor);
  const estimatedDays = Math.round(estimatedHours / 24 * 10) / 10;

  // Readiness timeline (0-168 hours)
  const timeline = [];
  for (let h = 0; h <= 168; h += 12) {
    const recoveryPct = Math.min(100, (h / estimatedHours) * 100);
    timeline.push({ hour: h, recovery_pct: Math.min(100, Math.round(recoveryPct)) });
  }

  // Next session readiness
  const hoursUntilNext = (7 * 24) / frequency_per_week;
  const nextSessionReadiness = Math.min(100, Math.round((hoursUntilNext / estimatedHours) * 100));

  const flags: string[] = [];
  if (estimatedHours > 96) flags.push('recovery_exceeds_4_days');
  if (nextSessionReadiness < 80) flags.push('insufficient_recovery_before_next_session');
  if (sets > 6) flags.push('high_volume_session');
  if ((rpe ?? 7) >= 9) flags.push('very_high_intensity');

  return {
    muscle_group,
    estimated_recovery_hours: estimatedHours,
    estimated_recovery_days: estimatedDays,
    readiness_timeline: timeline,
    volume_factor: Math.round(volumeFactor * 100) / 100,
    intensity_factor: Math.round(intensityFactor * 100) / 100,
    individual_factor: Math.round(individualFactor * 100) / 100,
    next_session_readiness_pct: nextSessionReadiness,
    flags,
    education_flags: [
      'estimates_based_on_population_averages_not_individual_tissue_monitoring',
      'actual_recovery_depends_on_nutrition_sleep_stress_genetics',
      'not_a_substitute_for_listening_to_your_body',
      'consult_professional_for_injury_concerns',
    ],
    scope_notice: 'educational_recovery_time_estimate_not_medical_assessment',
  };
}

export { calcRecovery as calcMuscleGroupRecovery };
