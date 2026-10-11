/**
 * Tool #085 — Sleep Quality Manager
 * Evaluates sleep architecture indices, circadian rhythm alignment,
 * sleep efficiency, and recovery restorative indicators.
 *
 * NOTE: Educational sleep analytics screening; not formal polysomnography (PSG)
 * and does not diagnose obstructive sleep apnea (OSA).
 */

export interface SleepQualityInput {
  sleep_duration_hours: number; // 3..14
  sleep_latency_minutes: number; // 0..120 (time to fall asleep)
  night_awakenings_count: number; // 0..10
  caffeine_within_6h_of_bedtime: boolean;
  dark_cool_room_optimized: boolean; // temperature < 19°C, blackout
  morning_rested_feeling_score: number; // 1..10
}

export interface SleepQualityResult {
  sleep_quality_index: number; // 0..100
  sleep_tier: 'poor-fragmented' | 'fair-restorative' | 'good-consolidated' | 'optimal-restorative';
  estimated_sleep_efficiency_pct: number; // 50..100%
  warnings: string[];
}

export function manageSleepQuality(input: SleepQualityInput): SleepQualityResult {
  const {
    sleep_duration_hours,
    sleep_latency_minutes,
    night_awakenings_count,
    caffeine_within_6h_of_bedtime,
    dark_cool_room_optimized,
    morning_rested_feeling_score,
  } = input;

  const warnings: string[] = ['educational_sleep_architecture_screen'];
  let score = 30; // baseline

  // Duration
  if (sleep_duration_hours >= 7 && sleep_duration_hours <= 9) {
    score += 25;
  } else if (sleep_duration_hours >= 6 && sleep_duration_hours < 7) {
    score += 10;
  } else if (sleep_duration_hours < 6) {
    score -= 15;
    warnings.push('insufficient_duration_deprives_deep_slow_wave_and_rem_cycles');
  } else if (sleep_duration_hours > 10) {
    warnings.push('hypersomnia_can_correlate_with_underlying_fatigue_or_poor_sleep_depth');
  }

  // Latency
  if (sleep_latency_minutes <= 20) {
    score += 15;
  } else if (sleep_latency_minutes >= 45) {
    score -= 15;
    warnings.push('prolonged_sleep_onset_latency_indicates_circadian_or_arousal_dysregulation');
  }

  // Awakenings & efficiency
  const estimated_waso_mins = night_awakenings_count * 15;
  const time_in_bed_mins = sleep_duration_hours * 60 + sleep_latency_minutes + estimated_waso_mins;
  const efficiency = Math.round(( (sleep_duration_hours * 60) / Math.max(1, time_in_bed_mins) ) * 100);

  if (night_awakenings_count === 0) {
    score += 15;
  } else if (night_awakenings_count >= 3) {
    score -= 15;
    warnings.push('frequent_nocturnal_awakenings_fragment_sleep_architecture');
  }

  // Caffeine near bedtime
  if (caffeine_within_6h_of_bedtime) {
    score -= 15;
    warnings.push('late_caffeine_reduces_slow_wave_sleep_depth_even_if_falling_asleep_easily');
  }

  // Environment
  if (dark_cool_room_optimized) {
    score += 10;
  }

  // Subjective restedness
  score += Math.round((morning_rested_feeling_score / 10) * 15);

  const finalScore = Math.max(0, Math.min(100, score));

  let tier: SleepQualityResult['sleep_tier'] = 'fair-restorative';
  if (finalScore >= 80) {
    tier = 'optimal-restorative';
  } else if (finalScore >= 60) {
    tier = 'good-consolidated';
  } else if (finalScore <= 40) {
    tier = 'poor-fragmented';
  }

  return {
    sleep_quality_index: finalScore,
    sleep_tier: tier,
    estimated_sleep_efficiency_pct: Math.min(100, Math.max(50, efficiency)),
    warnings,
  };
}
