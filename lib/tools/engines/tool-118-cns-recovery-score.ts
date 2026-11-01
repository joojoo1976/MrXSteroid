/**
 * Tool #118 - CNS Recovery Score
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates CNS fatigue/recovery from subjective
 * and objective markers. It does not diagnose neurological conditions,
 * replace clinical assessment, or guarantee performance outcomes.
 * Results are educational references only.
 *
 * Model
 * -----
 * CNS Recovery Score (0-100) based on weighted factors:
 * - HRV trend (30%)
 * - Sleep quality & duration (25%)
 * - Subjective readiness (20%)
 * - Performance trend (15%)
 * - Biometric markers (HR, temp) (10%)
 *
 * Higher score = better recovery. <40 = high fatigue risk.
 */

export type ReadinessLevel = 'poor' | 'moderate' | 'good' | 'excellent';

export interface CNSRecoveryInput {
  // Objective metrics
  hrv_ms?: number;           // Current HRV (ms)
  hrv_baseline_ms?: number;  // Baseline HRV (ms)
  resting_hr_bpm?: number;   // Current resting HR
  resting_hr_baseline_bpm?: number; // Baseline resting HR
  sleep_hours?: number;      // Last night sleep duration
  sleep_quality?: 1 | 2 | 3 | 4 | 5; // 1-5 subjective
  body_temp_c?: number;      // Morning body temperature
  body_temp_baseline_c?: number; // Baseline temperature

  // Subjective markers (1-5 scale)
  mood?: 1 | 2 | 3 | 4 | 5;
  energy_level?: 1 | 2 | 3 | 4 | 5;
  motivation?: 1 | 2 | 3 | 4 | 5;
  muscle_soreness?: 1 | 2 | 3 | 4 | 5; // 1 = none, 5 = severe
  joint_pain?: 1 | 2 | 3 | 4 | 5;

  // Performance trends
  recent_performance_trend?: 'improving' | 'stable' | 'declining';
  training_load_change_pct?: number; // % change vs baseline

  // Context
  days_since_deload?: number;
  illness_recent?: boolean;
  stress_level?: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = high
}

export interface CNSRecoveryResult {
  cns_recovery_score: number; // 0-100
  data_coverage_pct: number;
  readiness_level: ReadinessLevel;
  factor_scores: {
    hrv_score: number;         // 0-100
    sleep_score: number;       // 0-100
    subjective_score: number;  // 0-100
    performance_score: number; // 0-100
    biometric_score: number;   // 0-100
  };
  risk_flags: string[];
  recommendations: string[];
  interpretation: string;
  scope_notice: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreHRV(input: CNSRecoveryInput): number {
  if (!input.hrv_ms || !input.hrv_baseline_ms) return 50; // neutral if no data
  const ratio = input.hrv_ms / input.hrv_baseline_ms;
  if (ratio >= 1.05) return 100;
  if (ratio >= 1.0) return 85;
  if (ratio >= 0.95) return 70;
  if (ratio >= 0.9) return 50;
  if (ratio >= 0.85) return 30;
  return 15;
}

function scoreSleep(input: CNSRecoveryInput): number {
  let score = 50;
  if (input.sleep_hours !== undefined) {
    if (input.sleep_hours >= 8.5) score += 20;
    else if (input.sleep_hours >= 7.5) score += 15;
    else if (input.sleep_hours >= 6.5) score += 5;
    else if (input.sleep_hours >= 5.5) score -= 10;
    else score -= 25;
  }
  if (input.sleep_quality !== undefined) {
    score += (input.sleep_quality - 3) * 10; // -20 to +20
  }
  return clamp(score, 0, 100);
}

function scoreSubjective(input: CNSRecoveryInput): number {
  const markers = [
    input.mood,
    input.energy_level,
    input.motivation,
    6 - (input.muscle_soreness ?? 3), // invert: less soreness = better
    6 - (input.joint_pain ?? 3),
  ].filter((v): v is number => v !== undefined);

  if (markers.length === 0) return 50;
  const avg = markers.reduce((a, b) => a + b, 0) / markers.length;
  return clamp((avg - 1) * 25, 0, 100); // 1-5 -> 0-100
}

function scorePerformance(input: CNSRecoveryInput): number {
  let score = 50;
  if (input.recent_performance_trend === 'improving') score += 25;
  else if (input.recent_performance_trend === 'declining') score -= 25;

  if (input.training_load_change_pct !== undefined) {
    if (input.training_load_change_pct > 20) score -= 15;
    else if (input.training_load_change_pct < -20) score += 10;
  }
  if (input.days_since_deload !== undefined) {
    if (input.days_since_deload > 21) score -= 10;
    else if (input.days_since_deload > 14) score -= 5;
  }
  return clamp(score, 0, 100);
}

function scoreBiometric(input: CNSRecoveryInput): number {
  let score = 50;
  if (input.resting_hr_bpm !== undefined && input.resting_hr_baseline_bpm !== undefined) {
    const hrRatio = input.resting_hr_bpm / input.resting_hr_baseline_bpm;
    if (hrRatio <= 0.98) score += 15;
    else if (hrRatio <= 1.02) score += 5;
    else if (hrRatio <= 1.05) score -= 10;
    else score -= 20;
  }
  if (input.body_temp_c !== undefined && input.body_temp_baseline_c !== undefined) {
    const tempDiff = input.body_temp_c - input.body_temp_baseline_c;
    if (tempDiff <= 0.2) score += 10;
    else if (tempDiff <= 0.5) score += 5;
    else if (tempDiff <= 0.8) score -= 10;
    else score -= 20;
  }
  if (input.illness_recent) score -= 20;
  if (input.stress_level !== undefined) {
    score -= (input.stress_level - 3) * 8; // -16 to +16
  }
  return clamp(score, 0, 100);
}

export function calcCNSRecovery(input: CNSRecoveryInput): CNSRecoveryResult {
  const factor_scores = {
    hrv_score: scoreHRV(input),
    sleep_score: scoreSleep(input),
    subjective_score: scoreSubjective(input),
    performance_score: scorePerformance(input),
    biometric_score: scoreBiometric(input),
  };

  const markerGroups = [
    input.hrv_ms !== undefined && input.hrv_baseline_ms !== undefined,
    input.sleep_hours !== undefined || input.sleep_quality !== undefined,
    [input.mood, input.energy_level, input.motivation, input.muscle_soreness, input.joint_pain].some((value) => value !== undefined),
    input.recent_performance_trend !== undefined || input.training_load_change_pct !== undefined || input.days_since_deload !== undefined,
    (input.resting_hr_bpm !== undefined && input.resting_hr_baseline_bpm !== undefined) ||
      (input.body_temp_c !== undefined && input.body_temp_baseline_c !== undefined) ||
      input.illness_recent !== undefined || input.stress_level !== undefined,
  ];
  const dataCoveragePct = Math.round((markerGroups.filter(Boolean).length / markerGroups.length) * 100);

  // Weighted composite
  const cns_recovery_score = Math.round(
    factor_scores.hrv_score * 0.30 +
    factor_scores.sleep_score * 0.25 +
    factor_scores.subjective_score * 0.20 +
    factor_scores.performance_score * 0.15 +
    factor_scores.biometric_score * 0.10
  );

  let readiness_level: ReadinessLevel;
  if (cns_recovery_score >= 80) readiness_level = 'excellent';
  else if (cns_recovery_score >= 60) readiness_level = 'good';
  else if (cns_recovery_score >= 40) readiness_level = 'moderate';
  else readiness_level = 'poor';

  const risk_flags: string[] = [];
  if (cns_recovery_score < 40) risk_flags.push('high_cns_fatigue_risk');
  if (factor_scores.hrv_score < 40) risk_flags.push('hrv_significantly_below_baseline');
  if (factor_scores.sleep_score < 40) risk_flags.push('sleep_insufficient');
  if (factor_scores.biometric_score < 40) risk_flags.push('biometric_markers_concerning');
  if (input.illness_recent) risk_flags.push('recent_illness_detected');
  if (input.stress_level !== undefined && input.stress_level >= 4) risk_flags.push('high_psychological_stress');
  if (dataCoveragePct < 100) risk_flags.push('some_recovery_markers_not_reported');

  const recommendations: string[] = [];
  if (dataCoveragePct === 0) {
    recommendations.push('insufficient_data_for_recommendations');
  } else if (cns_recovery_score < 50) {
    recommendations.push('Consider deload or active recovery week');
    recommendations.push('Prioritize sleep hygiene and stress management');
  }
  if (dataCoveragePct > 0 && factor_scores.hrv_score < 60) {
    recommendations.push('Reduce training intensity until HRV normalizes');
  }
  if (dataCoveragePct > 0 && factor_scores.sleep_score < 60) {
    recommendations.push('Aim for 8-9 hours sleep; improve sleep hygiene');
  }
  if (input.days_since_deload !== undefined && input.days_since_deload > 21) {
    recommendations.push('Schedule a deload week');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain current training load with periodic monitoring');
  }

  const interpretation = dataCoveragePct === 0
    ? 'No recovery markers were provided; enter data before interpreting a score'
    : cns_recovery_score >= 75
    ? 'CNS well recovered; ready for high-intensity training'
    : cns_recovery_score >= 55
    ? 'CNS moderately recovered; moderate training appropriate'
    : cns_recovery_score >= 35
    ? 'CNS showing fatigue signs; reduce intensity, prioritize recovery'
    : 'CNS significantly fatigued; deload or rest strongly recommended';

  return {
    cns_recovery_score,
    data_coverage_pct: dataCoveragePct,
    readiness_level,
    factor_scores,
    risk_flags,
    recommendations,
    interpretation,
    scope_notice: 'Educational CNS fatigue estimation from subjective and objective markers. Not a medical diagnosis or neurological assessment. Consult healthcare provider for clinical evaluation.',
  };
}
