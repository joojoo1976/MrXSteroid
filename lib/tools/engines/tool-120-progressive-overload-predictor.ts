/**
 * Tool #120 - Progressive Overload & Adaptive Reserve Capacity Predictor
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates progressive overload trajectory and
 * adaptive reserve capacity. It does not guarantee strength gains,
 * predict exact plateaus, or replace periodized programming.
 * Results are educational references only.
 *
 * Model
 * -----
 * Adaptive Reserve = remaining illustrative ceiling margin relative to the
 * baseline; this proxy is an unvalidated heuristic, not a physiological measure.
 * Overload Trajectory = Weekly Load Increase × Adaptation Efficiency × Recovery Factor
 * Predicts weeks to next plateau based on current trajectory
 */

export type OverloadInput = {
  // Current performance
  exercise: string;
  current_1rm_kg: number;
  current_volume_load_kg: number; // weekly
  current_frequency: number; // per week

  // Baseline (when started current program)
  baseline_1rm_kg: number;
  baseline_volume_load_kg: number;

  // Anthropometrics
  body_weight_kg: number;
  height_cm: number;
  age: number;
  sex: 'male' | 'female';
  training_age_years: number;

  // Program parameters
  weekly_load_increase_pct: number; // planned % increase per week
  deload_frequency_weeks: number; // 0 = none
  sleep_hours: number;
  protein_g_per_kg: number;
  days_since_deload: number;

  // Optional genetic/anthropometric
  wrist_cm?: number;
  ankle_cm?: number;
};

export interface OverloadResult {
  adaptive_reserve_pct: number; // 0-100%
  genetic_potential_1rm_kg: number;
  weeks_to_plateau: number;
  projected_1rm_4weeks: number;
  projected_1rm_12weeks: number;
  recommended_weekly_increase_pct: number;
  overload_trajectory: Array<{ week: number; projected_1rm: number; reserve_pct: number }>;
  risk_factors: string[];
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

function estimateGeneticPotential(input: OverloadInput): number {
  const { body_weight_kg, height_cm, age, sex, wrist_cm, ankle_cm, training_age_years } = input;
  
  // Unvalidated illustrative scaling function; not a genetic ceiling estimate.
  let potential = body_weight_kg * 2.5; // rough base
  
  // Height adjustment
  potential *= (height_cm / 175) ** 0.5;
  
  // Age adjustment (peak ~25)
  if (age < 25) potential *= 1 + (25 - age) * 0.01;
  else if (age > 35) potential *= 1 - (age - 35) * 0.015;
  
  // Sex adjustment
  if (sex === 'female') potential *= 0.65;
  
  // Frame size (wrist/ankle)
  if (wrist_cm && ankle_cm) {
    const frameIndex = (wrist_cm + ankle_cm) / 2;
    if (frameIndex > 18) potential *= 1.1;
    else if (frameIndex < 16) potential *= 0.9;
  }
  
  // Training age deduction
  potential *= 1 - Math.min(training_age_years * 0.03, 0.3);
  
  return Math.round(potential);
}

function calcAdaptiveReserve(input: OverloadInput): OverloadResult {
  const geneticPotential = estimateGeneticPotential(input);
  const { current_1rm_kg, baseline_1rm_kg, current_volume_load_kg, baseline_volume_load_kg } = input;
  
  // Adaptive reserve: how much of genetic potential remains
  const strengthReserve = geneticPotential > baseline_1rm_kg 
    ? (geneticPotential - current_1rm_kg) / (geneticPotential - baseline_1rm_kg)
    : 0;
  
  const volumeReserve = baseline_volume_load_kg > 0
    ? (current_volume_load_kg - baseline_volume_load_kg) / (geneticPotential * 100 - baseline_volume_load_kg)
    : 0;
  
  const adaptiveReserve = Math.max(0, Math.min(1, (strengthReserve * 0.7 + volumeReserve * 0.3))) * 100;
  
  // Weeks to plateau based on reserve and progression rate
  const weeklyIncrease = input.weekly_load_increase_pct / 100;
  const adaptationEfficiency = 0.6; // typical
  const recoveryFactor = input.sleep_hours >= 8 ? 1.0 : input.sleep_hours >= 7 ? 0.9 : 0.75;
  const proteinFactor = input.protein_g_per_kg >= 1.6 ? 1.0 : input.protein_g_per_kg >= 1.2 ? 0.9 : 0.8;
  const ageFactor = input.age <= 30 ? 1.0 : input.age <= 40 ? 0.9 : 0.8;
  
  const effectiveRate = weeklyIncrease * adaptationEfficiency * recoveryFactor * proteinFactor * ageFactor;
  
  // Weeks until reserve depleted (simplified)
  const weeksToPlateau = adaptiveReserve > 0 && effectiveRate > 0 
    ? Math.round(adaptiveReserve / (effectiveRate * 100 * 10))
    : 999;
  
  // Projected 1RM
  const weeklyGain = current_1rm_kg * effectiveRate;
  const projected_4w = current_1rm_kg + weeklyGain * 4;
  const projected_12w = current_1rm_kg + weeklyGain * 12;
  
  // Illustrative output derived from the entered scenario; not a prescription.
  const reserveFactor = adaptiveReserve > 50 ? 1.0 : adaptiveReserve > 25 ? 0.7 : 0.5;
  const recommendedIncrease = Math.min(5, Math.max(0, weeklyIncrease * 100 * reserveFactor));
  
  // Trajectory
  const trajectory = [];
  let proj1rm = current_1rm_kg;
  let projReserve = adaptiveReserve;
  for (let w = 1; w <= 12; w++) {
    proj1rm += weeklyGain;
    projReserve = Math.max(0, projReserve - effectiveRate * 100 * 10);
    trajectory.push({ week: w, projected_1rm: Math.round(proj1rm * 10) / 10, reserve_pct: Math.round(projReserve) });
  }
  
  // Risk factors
  const risk_factors: string[] = [];
  if (adaptiveReserve < 15) risk_factors.push('very_low_adaptive_reserve');
  if (input.weekly_load_increase_pct > 5) risk_factors.push('aggressive_progression_rate');
  if (input.sleep_hours < 7) risk_factors.push('insufficient_sleep');
  if (input.protein_g_per_kg < 1.2) risk_factors.push('suboptimal_protein_intake');
  if (input.days_since_deload > 21) risk_factors.push('overdue_deload');
  
  const flags: string[] = [];
  if (adaptiveReserve < 10) flags.push('critical_low_reserve_imminent_plateau');
  if (input.weekly_load_increase_pct > 10) flags.push('excessive_progression_rate');
  if (input.days_since_deload > 28) flags.push('overdue_deload');
  
  return {
    adaptive_reserve_pct: Math.round(adaptiveReserve),
    genetic_potential_1rm_kg: geneticPotential,
    weeks_to_plateau: Math.min(weeksToPlateau, 52),
    projected_1rm_4weeks: Math.round(projected_4w * 10) / 10,
    projected_1rm_12weeks: Math.round(projected_12w * 10) / 10,
    recommended_weekly_increase_pct: Math.round(recommendedIncrease * 10) / 10,
    overload_trajectory: trajectory,
    risk_factors,
    flags,
    education_flags: [
      'projections_based_on_simplified_adaptation_model',
      'genetic_potential_estimate_highly_approximate',
      'plateau_horizon_and_weekly_increase_are_heuristic_scenarios_not_forecasts_or_prescriptions',
      'individual_response_to_training_varies_widely',
      'not_a_substitute_for_coach_supervision',
      'deload_weeks_essential_for_long_term_progress',
    ],
    scope_notice: 'educational_progressive_overload_projection_not_training_guarantee',
  };
}

export { calcAdaptiveReserve as calcOverloadPredictor };
