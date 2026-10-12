/**
 * Tool #088 — Dopamine Tracker
 * Evaluates behavioral dopamine baseline, reward-seeking compulsive loops,
 * tyrosine/precursor support, and hedonic reset indicators.
 *
 * NOTE: Educational screening score based on mesolimbic dopamine dynamics
 * and habit loops (Huberman / Lembke research); not a neurotransmitter PET scan.
 */

export interface DopamineTrackerInput {
  daily_short_form_screen_time_hours: number; // 0..12 (TikTok, Reels, gaming, porn)
  tyrosine_rich_protein_intake: 'suboptimal' | 'adequate' | 'optimal';
  habitual_cold_exposure_or_hard_effort: boolean; // sustained dopamine elevation
  frequent_compulsive_dopamine_seeking: boolean; // inability to sit without phone
  sleep_consistency_score: number; // 1..10
  stimulant_usage_frequency: 'none' | 'moderate_caffeine' | 'high_caffeine_or_preworkout' | 'prescription_or_illicit';
}

export interface DopamineTrackerResult {
  dopamine_baseline_health_score: number; // 0..100
  dopaminergic_tone_tier: 'depleted-desensitized' | 'functional-volatile' | 'resilient-balanced';
  warnings: string[];
}

export function trackDopamine(input: DopamineTrackerInput): DopamineTrackerResult {
  const {
    daily_short_form_screen_time_hours,
    tyrosine_rich_protein_intake,
    habitual_cold_exposure_or_hard_effort,
    frequent_compulsive_dopamine_seeking,
    sleep_consistency_score,
    stimulant_usage_frequency,
  } = input;

  const warnings: string[] = ['educational_dopamine_dynamics_screen'];
  let score = 30; // baseline

  // Screen time / cheap dopamine spikes
  if (daily_short_form_screen_time_hours >= 4) {
    score -= 25;
    warnings.push('excessive_short_form_content_induces_frequent_dopamine_peaks_followed_by_sub_baseline_troughs');
  } else if (daily_short_form_screen_time_hours >= 2) {
    score -= 12;
  } else if (daily_short_form_screen_time_hours <= 0.5) {
    score += 15;
  }

  // Tyrosine nutrition
  if (tyrosine_rich_protein_intake === 'optimal') {
    score += 15;
  } else if (tyrosine_rich_protein_intake === 'suboptimal') {
    score -= 10;
    warnings.push('insufficient_dietary_protein_limits_l_tyrosine_precursor_availability');
  }

  // Hard effort hormesis
  if (habitual_cold_exposure_or_hard_effort) {
    score += 20;
  }

  // Compulsive loops
  if (frequent_compulsive_dopamine_seeking) {
    score -= 20;
    warnings.push('compulsive_reward_seeking_indicates_d2_receptor_downregulation_and_tolerance');
  }

  // Sleep
  score += Math.round((sleep_consistency_score / 10) * 15);

  // Stimulants
  if (stimulant_usage_frequency === 'high_caffeine_or_preworkout' || stimulant_usage_frequency === 'prescription_or_illicit') {
    score -= 15;
    warnings.push('heavy_stimulant_cycling_creates_neurochemical_rebound_fatigue');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let tier: DopamineTrackerResult['dopaminergic_tone_tier'] = 'functional-volatile';
  if (finalScore >= 70) {
    tier = 'resilient-balanced';
  } else if (finalScore <= 38) {
    tier = 'depleted-desensitized';
  }

  return {
    dopamine_baseline_health_score: finalScore,
    dopaminergic_tone_tier: tier,
    warnings,
  };
}
