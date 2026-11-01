/**
 * Tool #124 - Deload Frequency & Fatigue Accumulation Modeler
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates optimal deload frequency and timing
 * from fatigue accumulation markers. It does not replace coaching intuition,
 * medical assessment, or guarantee injury prevention.
 * Results are educational references only.
 *
 * Model
 * -----
 * Fatigue Accumulation = Σ (Weekly_Stress × Recovery_Deficit)
 * Optimal Deload Interval = Base_Interval × Individual_Factor × Stress_Factor
 * Fatigue Markers: HRV, RHR, Sleep, Mood, Performance, Soreness
 */

export type DeloadInput = {
  training_age_years: number;
  weekly_volume_sets: number;
  avg_weekly_rpe: number;
  frequency_per_week: number;
  age: number;
  sleep_hours: number;
  stress_level: 1 | 2 | 3 | 4 | 5;
  hrv_trend: 'improving' | 'stable' | 'declining';
  rhr_trend: 'improving' | 'stable' | 'declining';
  sleep_quality_trend: 'improving' | 'stable' | 'declining';
  performance_trend: 'improving' | 'stable' | 'declining';
  mood_trend: 'improving' | 'stable' | 'declining';
  soreness_level: 1 | 2 | 3 | 4 | 5;
  joint_pain: 1 | 2 | 3 | 4 | 5;
  last_deload_weeks_ago: number;
  planned_deload_frequency_weeks: number;
};

export interface DeloadResult {
  recommended_deload_interval_weeks: number;
  current_fatigue_index: number; // 0-100
  fatigue_trend: 'accumulating' | 'stable' | 'dissipating';
  weeks_until_deload: number;
  deload_type: 'full' | 'volume' | 'intensity' | 'active_recovery';
  deload_duration_days: number;
  risk_of_overreaching: 'low' | 'moderate' | 'high';
  marker_analysis: {
    hrv: 'positive' | 'neutral' | 'negative';
    rhr: 'positive' | 'neutral' | 'negative';
    sleep: 'positive' | 'neutral' | 'negative';
    performance: 'positive' | 'neutral' | 'negative';
    mood: 'positive' | 'neutral' | 'negative';
    soreness: 'low' | 'moderate' | 'high';
  };
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

function calcDeload(input: DeloadInput): DeloadResult {
  const {
    training_age_years, weekly_volume_sets, avg_weekly_rpe, frequency_per_week,
    age, sleep_hours, stress_level, hrv_trend, rhr_trend,
    sleep_quality_trend, performance_trend, mood_trend,
    soreness_level, joint_pain, last_deload_weeks_ago, planned_deload_frequency_weeks
  } = input;

  // Base deload interval (weeks)
  let baseInterval = 6;
  if (training_age_years < 1) baseInterval = 4;
  else if (training_age_years < 3) baseInterval = 5;
  else if (training_age_years > 5) baseInterval = 8;

  // Individual factor
  let individualFactor = 1.0;
  if (age > 40) individualFactor *= 0.85;
  if (sleep_hours < 7) individualFactor *= 0.9;
  if (stress_level >= 4) individualFactor *= 0.85;
  if (training_age_years < 1) individualFactor *= 0.8;

  // Stress factor
  let stressFactor = 1.0;
  if (avg_weekly_rpe > 8.5) stressFactor *= 0.8;
  if (weekly_volume_sets > 100) stressFactor *= 0.85;
  if (frequency_per_week > 5) stressFactor *= 0.9;

  const recommendedInterval = Math.max(3, Math.min(12, Math.round(baseInterval * individualFactor * stressFactor)));

  // Fatigue index
  let fatigueIndex = 50;
  fatigueIndex += (avg_weekly_rpe - 7) * 5;
  fatigueIndex += Math.max(0, weekly_volume_sets - 80) * 0.2;
  fatigueIndex += Math.max(0, frequency_per_week - 4) * 3;
  fatigueIndex += Math.max(0, age - 30) * 0.5;
  fatigueIndex += Math.max(0, 8 - sleep_hours) * 3;
  fatigueIndex += (stress_level - 3) * 5;
  fatigueIndex += Math.max(0, soreness_level - 3) * 4;
  fatigueIndex += Math.max(0, joint_pain - 2) * 3;
  fatigueIndex = Math.max(0, Math.min(100, fatigueIndex));

  // Fatigue trend
  let trendScore = 0;
  const trendMap = { improving: 1, stable: 0, declining: -1 };
  trendScore += trendMap[hrv_trend] * 2;
  trendScore += trendMap[rhr_trend] * 1.5;
  trendScore += trendMap[sleep_quality_trend] * 1.5;
  trendScore += trendMap[performance_trend] * 2;
  trendScore += trendMap[mood_trend] * 1.5;

  let fatigueTrend: 'accumulating' | 'stable' | 'dissipating' = 'stable';
  if (trendScore < -2) fatigueTrend = 'dissipating';
  else if (trendScore > 2) fatigueTrend = 'accumulating';

  // Weeks until deload
  const weeksSinceDeload = last_deload_weeks_ago;
  const weeksUntilDeload = Math.max(0, recommendedInterval - weeksSinceDeload);

  // Deload type
  let deloadType: 'full' | 'volume' | 'intensity' | 'active_recovery' = 'volume';
  if (fatigueIndex > 70) deloadType = 'full';
  else if (fatigueIndex > 50) deloadType = 'intensity';
  else if (fatigueIndex < 30) deloadType = 'active_recovery';

  // Deload duration
  const deloadDuration = deloadType === 'full' ? 7 : deloadType === 'intensity' ? 5 : 3;

  // Overreaching risk
  let overreachingRisk: 'low' | 'moderate' | 'high' = 'low';
  if (fatigueIndex > 70 || fatigueTrend === 'accumulating') overreachingRisk = 'high';
  else if (fatigueIndex > 45 || fatigueTrend === 'stable') overreachingRisk = 'moderate';

  // Marker analysis
  const markerAnalysis: {
    hrv: 'positive' | 'neutral' | 'negative';
    rhr: 'positive' | 'neutral' | 'negative';
    sleep: 'positive' | 'neutral' | 'negative';
    performance: 'positive' | 'neutral' | 'negative';
    mood: 'positive' | 'neutral' | 'negative';
    soreness: 'low' | 'moderate' | 'high';
  } = {
    hrv: hrv_trend === 'improving' ? 'positive' : hrv_trend === 'declining' ? 'negative' : 'neutral',
    rhr: rhr_trend === 'improving' ? 'positive' : rhr_trend === 'declining' ? 'negative' : 'neutral',
    sleep: sleep_quality_trend === 'improving' ? 'positive' : sleep_quality_trend === 'declining' ? 'negative' : 'neutral',
    performance: performance_trend === 'improving' ? 'positive' : performance_trend === 'declining' ? 'negative' : 'neutral',
    mood: mood_trend === 'improving' ? 'positive' : mood_trend === 'declining' ? 'negative' : 'neutral',
    soreness: soreness_level <= 2 ? 'low' : soreness_level <= 3 ? 'moderate' : 'high',
  };

  const flags: string[] = [];
  if (last_deload_weeks_ago >= planned_deload_frequency_weeks) flags.push('deload_overdue');
  if (fatigueIndex > 70) flags.push('high_fatigue_index');
  if (fatigueTrend === 'accumulating') flags.push('fatigue_accumulating');
  if (overreachingRisk === 'high') flags.push('overreaching_risk');
  if (hrv_trend === 'declining' && rhr_trend === 'declining') flags.push('autonomic_distress');

  return {
    recommended_deload_interval_weeks: recommendedInterval,
    current_fatigue_index: Math.round(fatigueIndex),
    fatigue_trend: fatigueTrend,
    weeks_until_deload: weeksUntilDeload,
    deload_type: deloadType,
    deload_duration_days: deloadDuration,
    risk_of_overreaching: overreachingRisk,
    marker_analysis: markerAnalysis,
    flags,
    education_flags: [
      'model_based_on_population_averages_individual_response_varies',
      'subjective_markers_require_honest_self_reporting',
      'not_a_substitute_for_coach_supervision_or_medical_advice',
      'deload_timing_should_consider_competition_calendar',
    ],
    scope_notice: 'educational_deload_timing_reference_not_medical_advice',
  };
}

export { calcDeload as calcDeloadFrequency };