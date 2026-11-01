/**
 * Tool #125 - Fiber Type Adaptation & Mechanical Tension Score
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates muscle fiber type distribution
 * and mechanical tension effectiveness from training data.
 * It does not replace muscle biopsy, genetic testing, or guarantee
 * specific hypertrophic outcomes.
 * Results are educational references only.
 *
 * Model
 * -----
 * Fiber Type Estimate = f(Rep_Range_Preference, Explosive_Performance, Fatigue_Resistance)
 * Mechanical Tension Score = Load × Time_Under_Tension × Range_of_Motion × Intent
 * Fiber Type Shift Potential = f(Training_History, Age, Training_Age)
 */

export type FiberInput = {
  // Anthropometrics
  age: number;
  sex: 'male' | 'female';
  height_cm: number;
  body_weight_kg: number;
  
  // Performance indicators
  max_reps_225_bench?: number; // reps at 102kg
  max_reps_135_squat?: number; // reps at 61kg
  vertical_jump_cm?: number;
  broad_jump_cm?: number;
  sprint_30m_time?: number; // seconds
  
  // Training preferences
  preferred_rep_range: '1-5' | '6-10' | '11-15' | '16-20' | '20+';
  enjoys_explosive_training: boolean;
  fatigues_quickly_high_reps: boolean;
  recovers_fast_between_sets: boolean;
  
  // Training history
  training_age_years: number;
  avg_weekly_volume_sets: number;
  avg_intensity_rpe: number;
  
  // Current program
  current_tempo: 'explosive' | 'controlled' | 'slow_eccentric';
  current_rom: 'partial' | 'full' | 'extended';
  current_intent: 'speed' | 'tension' | 'pump';
};

export interface FiberResult {
  estimated_fiber_distribution: {
    type_I_pct: number;  // slow oxidative
    type_IIa_pct: number; // fast oxidative glycolytic
    type_IIx_pct: number; // fast glycolytic
  };
  fiber_type_dominance: 'type_I' | 'type_IIa' | 'type_IIx' | 'mixed';
  mechanical_tension_score: number; // 0-100
  tension_effectiveness: 'optimal' | 'suboptimal' | 'poor';
  fiber_type_shift_potential: 'high' | 'moderate' | 'low';
  recommended_rep_range: '1-5' | '6-10' | '11-15' | '16-20';
  recommended_tempo: 'explosive' | 'controlled' | 'slow_eccentric';
  training_recommendations: string[];
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

function calcFiberType(input: FiberInput): FiberResult {
  const {
    age, sex, height_cm, body_weight_kg,
    max_reps_225_bench, max_reps_135_squat,
    vertical_jump_cm, broad_jump_cm, sprint_30m_time,
    preferred_rep_range, enjoys_explosive_training,
    fatigues_quickly_high_reps, recovers_fast_between_sets,
    training_age_years, avg_weekly_volume_sets, avg_intensity_rpe,
    current_tempo, current_rom, current_intent
  } = input;

  // Estimate fiber distribution from performance indicators
  let typeI = 33, typeIIa = 34, typeIIx = 33; // baseline

  // Rep range preference
  if (preferred_rep_range === '1-5') { typeIIx += 15; typeI -= 10; }
  else if (preferred_rep_range === '6-10') { typeIIa += 15; typeI -= 10; }
  else if (preferred_rep_range === '16-20') { typeI += 15; typeIIx -= 10; }
  else if (preferred_rep_range === '20+') { typeI += 20; typeIIx -= 15; }

  // Explosive performance
  if (vertical_jump_cm !== undefined) {
    if (vertical_jump_cm > 60) { typeIIx += 10; typeI -= 5; }
    else if (vertical_jump_cm < 40) { typeI += 5; typeIIx -= 5; }
  }
  if (broad_jump_cm !== undefined) {
    if (broad_jump_cm > 250) { typeIIx += 10; typeI -= 5; }
    else if (broad_jump_cm < 200) { typeI += 5; typeIIx -= 5; }
  }
  if (sprint_30m_time !== undefined) {
    if (sprint_30m_time < 4.0) { typeIIx += 10; typeI -= 5; }
    else if (sprint_30m_time > 5.0) { typeI += 5; typeIIx -= 5; }
  }

  // Subjective indicators
  if (enjoys_explosive_training) { typeIIx += 5; typeI -= 3; }
  if (fatigues_quickly_high_reps) { typeIIx += 8; typeI -= 5; }
  if (recovers_fast_between_sets) { typeIIa += 5; typeI -= 3; }

  // Strength endurance tests
  if (max_reps_225_bench !== undefined) {
    if (max_reps_225_bench > 15) { typeI += 10; typeIIx -= 8; }
    else if (max_reps_225_bench < 5) { typeIIx += 10; typeI -= 8; }
  }
  if (max_reps_135_squat !== undefined) {
    if (max_reps_135_squat > 20) { typeI += 10; typeIIx -= 8; }
    else if (max_reps_135_squat < 8) { typeIIx += 10; typeI -= 8; }
  }

  // Age adjustment
  if (age > 40) { typeI += 5; typeIIx -= 5; }

  // Normalize
  const total = typeI + typeIIa + typeIIx;
  typeI = Math.max(0, Math.round(typeI / total * 100));
  typeIIa = Math.max(0, Math.round(typeIIa / total * 100));
  typeIIx = Math.max(0, Math.round(typeIIx / total * 100));

  // Renormalize
  const newTotal = typeI + typeIIa + typeIIx;
  if (newTotal !== 100) {
    const diff = 100 - newTotal;
    if (typeIIx > typeI) typeIIx += diff;
    else if (typeI > typeIIx) typeI += diff;
    else typeIIa += diff;
  }

  // Dominance
  let dominance: FiberResult['fiber_type_dominance'] = 'mixed';
  if (typeI > 50) dominance = 'type_I';
  else if (typeIIx > 45) dominance = 'type_IIx';
  else if (typeIIa > 40) dominance = 'type_IIa';

  // Mechanical Tension Score
  let tensionScore = 50;
  // Load factor
  tensionScore += Math.min(30, (input.current_intent === 'tension' ? 20 : input.current_intent === 'speed' ? 10 : 5));
  // ROM factor
  tensionScore += input.current_rom === 'full' ? 15 : input.current_rom === 'partial' ? 5 : 10;
  // Tempo factor
  tensionScore += input.current_tempo === 'slow_eccentric' ? 15 : input.current_tempo === 'controlled' ? 10 : 5;
  // Volume/Intensity
  tensionScore += Math.min(15, input.avg_weekly_volume_sets * 0.3);
  tensionScore += Math.min(10, (input.avg_intensity_rpe - 5) * 2);
  // Experience
  tensionScore += Math.min(10, input.training_age_years * 1.5);

  tensionScore = Math.max(0, Math.min(100, tensionScore));

  let tensionEffectiveness: FiberResult['tension_effectiveness'] = 'suboptimal';
  if (tensionScore >= 80) tensionEffectiveness = 'optimal';
  else if (tensionScore < 50) tensionEffectiveness = 'poor';

  // Fiber type shift potential
  let shiftPotential: FiberResult['fiber_type_shift_potential'] = 'moderate';
  if (training_age_years < 2 && age < 30) shiftPotential = 'high';
  else if (training_age_years > 10 || age > 45) shiftPotential = 'low';

  // Recommendations
  let recommendedRepRange: FiberResult['recommended_rep_range'] = '6-10';
  if (dominance === 'type_I') recommendedRepRange = '11-15';
  else if (dominance === 'type_IIx') recommendedRepRange = '1-5';
  else if (dominance === 'type_IIa') recommendedRepRange = '6-10';

  let recommendedTempo: FiberResult['recommended_tempo'] = 'controlled';
  if (dominance === 'type_IIx') recommendedTempo = 'explosive';
  else if (dominance === 'type_I') recommendedTempo = 'slow_eccentric';

  const recommendations: string[] = [];
  if (dominance === 'type_I') {
    recommendations.push('Focus on higher rep ranges (12-20) with controlled tempo');
    recommendations.push('Include blood flow restriction training for hypertrophy');
  } else if (dominance === 'type_IIx') {
    recommendations.push('Prioritize low-rep explosive work (1-5 reps)');
    recommendations.push('Include plyometrics and Olympic lift variations');
  } else {
    recommendations.push('Balanced approach: 6-12 reps with controlled eccentric');
  }
  if (tensionEffectiveness === 'poor') {
    recommendations.push('Increase mechanical tension: full ROM, controlled eccentric, 3-5 second eccentrics');
  }
  if (shiftPotential === 'high') {
    recommendations.push('High fiber shift potential - periodize between strength and hypertrophy blocks');
  }

  const flags: string[] = [];
  if (age > 50) flags.push('age_related_fiber_type_shift_toward_type_I');
  if (training_age_years < 1) flags.push('novice_fiber_estimates_unreliable');

  return {
    estimated_fiber_distribution: {
      type_I_pct: typeI,
      type_IIa_pct: typeIIa,
      type_IIx_pct: typeIIx,
    },
    fiber_type_dominance: dominance,
    mechanical_tension_score: tensionScore,
    tension_effectiveness: tensionEffectiveness,
    fiber_type_shift_potential: shiftPotential,
    recommended_rep_range: recommendedRepRange,
    recommended_tempo: recommendedTempo,
    training_recommendations: recommendations,
    flags,
    education_flags: [
      'fiber_type_estimates_from_indirect_markers_not_biopsy',
      'fiber_type_distribution_largely_genetic_shift_potential_limited',
      'mechanical_tension_model_simplified_individual_variation_high',
      'not_a_substitute_for_genetic_testing_or_muscle_biopsy',
    ],
    scope_notice: 'educational_fiber_type_tension_reference_not_genetic_testing',
  };
}

export { calcFiberType as calcFiberTypeTension };