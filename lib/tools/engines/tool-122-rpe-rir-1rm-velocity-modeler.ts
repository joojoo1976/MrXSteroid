/**
 * Tool #122 - RPE / RIR to 1RM Dynamic Velocity Modeler
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates 1RM from RPE/RIR and velocity data.
 * It does not replace direct 1RM testing, guarantee accuracy, or replace
 * coaching supervision. Results are educational references only.
 *
 * Model
 * -----
 * 1RM from RPE: weight / (1 - 0.033 × (10 - RPE))  [Epley-like]
 * 1RM from RIR: weight × (1 + RIR × 0.033)
 * Velocity-based: 1RM = weight / (a + b × velocity)  [linear fit]
 * Combined estimate: weighted average
 */

export type VelocityInput = {
  // Load-velocity profile (at least 2 points)
  velocity_profile: Array<{
    weight_kg: number;
    velocity_m_s: number; // mean concentric velocity
  }>;
  // Target set
  target_weight_kg: number;
  target_velocity_m_s?: number;
  target_rpe?: number;
  target_rir?: number;
};

export interface VelocityResult {
  estimated_1rm_kg: number;
  estimation_method: 'velocity' | 'rpe' | 'rir' | 'combined';
  confidence: 'high' | 'medium' | 'low';
  velocity_based_1rm?: number;
  rpe_based_1rm?: number;
  rir_based_1rm?: number;
  load_velocity_profile: Array<{ weight_kg: number; velocity_m_s: number }>;
  lvp_equation: { slope: number; intercept: number; r_squared: number };
  mv_threshold_m_s: number; // minimal velocity threshold
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

function linearRegression(points: Array<{ x: number; y: number }>): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const yMean = sumY / n;
  const ssTotal = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTotal === 0 ? 0 : 1 - ssRes / ssTotal;
  
  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
}

function calcVelocity1RM(input: VelocityInput): VelocityResult {
  const { velocity_profile, target_weight_kg, target_velocity_m_s, target_rpe, target_rir } = input;
  
  if (velocity_profile.length < 2) {
    return {
      estimated_1rm_kg: 0,
      estimation_method: 'combined',
      confidence: 'low',
      load_velocity_profile: velocity_profile,
      lvp_equation: { slope: 0, intercept: 0, r_squared: 0 },
      mv_threshold_m_s: 0,
      flags: ['insufficient_velocity_data_points'],
      education_flags: ['insufficient_data_for_velocity_based_estimation'],
      scope_notice: 'educational_1rm_estimation_not_direct_testing',
    };
  }

  // Load-velocity profile (velocity = slope × weight + intercept)
  const points = velocity_profile.map(p => ({ x: p.weight_kg, y: p.velocity_m_s }));
  const lvp = linearRegression(points);
  
  // Minimal velocity threshold (at 1RM)
  const mvThreshold = lvp.slope > 0 ? 0 : Math.abs(lvp.intercept / lvp.slope) * 0.15;
  
  // Velocity-based 1RM
  let velocityBased1RM: number | undefined;
  if (target_velocity_m_s !== undefined && lvp.slope !== 0) {
    velocityBased1RM = (target_velocity_m_s - lvp.intercept) / lvp.slope;
  }
  
  // RPE-based 1RM (Epley: 1RM = weight × (1 + (10-RPE)/33.3))
  let rpeBased1RM: number | undefined;
  if (input.target_rpe !== undefined) {
    // Need a reference weight - use target_weight_kg
    rpeBased1RM = input.target_weight_kg * (1 + (10 - input.target_rpe) / 33.3);
  }
  
  // RIR-based 1RM (1RM = weight × (1 + RIR × 0.033))
  let rirBased1RM: number | undefined;
  if (input.target_rir !== undefined) {
    rirBased1RM = input.target_weight_kg * (1 + input.target_rir * 0.033);
  }
  
  // Combined estimate
  const estimates = [
    velocityBased1RM,
    rpeBased1RM,
    rirBased1RM,
  ].filter((v): v is number => v !== undefined && v > 0 && v < 1000);
  
  let estimated1RM = 0;
  let method: VelocityResult['estimation_method'] = 'combined';
  let confidence: VelocityResult['confidence'] = 'low';
  
  if (estimates.length >= 2) {
    estimated1RM = estimates.reduce((a, b) => a + b, 0) / estimates.length;
    method = 'combined';
    confidence = lvp.r2 > 0.9 ? 'high' : lvp.r2 > 0.7 ? 'medium' : 'low';
  } else if (estimates.length === 1) {
    estimated1RM = estimates[0];
    method = velocityBased1RM !== undefined ? 'velocity' : rpeBased1RM !== undefined ? 'rpe' : 'rir';
    confidence = 'medium';
  } else {
    estimated1RM = input.target_weight_kg; // fallback
    confidence = 'low';
  }
  
  const flags: string[] = [];
  if (velocity_profile.length < 3) flags.push('limited_velocity_data_points');
  if (lvp.r2 < 0.7) flags.push('poor_load_velocity_fit');
  if (target_rpe && target_rpe < 6) flags.push('rpe_too_low_for_reliable_estimation');
  if (target_rir && target_rir > 4) flags.push('high_rir_reduces_accuracy');
  
  return {
    estimated_1rm_kg: Math.round(estimated1RM * 10) / 10,
    estimation_method: method,
    confidence,
    velocity_based_1rm: velocityBased1RM ? Math.round(velocityBased1RM * 10) / 10 : undefined,
    rpe_based_1rm: rpeBased1RM ? Math.round(rpeBased1RM * 10) / 10 : undefined,
    rir_based_1rm: rirBased1RM ? Math.round(rirBased1RM * 10) / 10 : undefined,
    load_velocity_profile: velocity_profile,
    lvp_equation: { slope: Math.round(lvp.slope * 1000) / 1000, intercept: Math.round(lvp.intercept * 1000) / 1000, r_squared: Math.round(lvp.r2 * 1000) / 1000 },
    mv_threshold_m_s: Math.round(mvThreshold * 1000) / 1000,
    flags,
    education_flags: [
      'estimates_based_on_population_models_not_individual_testing',
      'velocity_based_estimation_requires_calibrated_device',
      'rpe_rir_accuracy_depends_on_honest_self_report',
      'not_a_substitute_for_direct_1rm_testing_under_supervision',
    ],
    scope_notice: 'educational_1rm_estimation_not_direct_testing',
  };
}

export { calcVelocity1RM as calcRPE_RIR_Velocity };