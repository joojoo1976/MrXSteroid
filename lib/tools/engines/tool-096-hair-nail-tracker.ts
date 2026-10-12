/**
 * Tool #096 — Hair & Nail Tracker
 * Layer 1: Pure TypeScript calculation engine.
 * Tracks androgenic alopecia risk, follicular miniaturization indices,
 * telogen effluvium triggers, and keratin matrix brittle/dystrophy signs.
 */

export interface HairNailTrackerInput {
  daily_shedding_rate: 'normal_under_50' | 'moderate_50_to_100' | 'excessive_over_100';
  temporal_vertex_thinning: boolean;
  scalp_sebum_inflammation: 'none' | 'mild_pruritus' | 'severe_seborrheic_dermatitis';
  nail_brittleness_or_ridging: boolean;
  using_5ar_inhibitor_or_minoxidil: boolean;
}

export interface HairNailTrackerResult {
  hair_follicle_vitality_score: number; // 0..100
  androgenic_alopecia_risk_tier: 'minimal' | 'moderate-shedding' | 'accelerated-miniaturization';
  keratin_matrix_health_tier: 'robust' | 'compromised-brittle';
  support_recommendations: string[];
}

export function trackHairNailStatus(input: HairNailTrackerInput): HairNailTrackerResult {
  const {
    daily_shedding_rate,
    temporal_vertex_thinning,
    scalp_sebum_inflammation,
    nail_brittleness_or_ridging,
    using_5ar_inhibitor_or_minoxidil,
  } = input;

  let score = 50;
  const support_recommendations: string[] = ['educational_androgenic_trichology_screen'];

  if (daily_shedding_rate === 'normal_under_50') {
    score += 25;
  } else if (daily_shedding_rate === 'moderate_50_to_100') {
    score += 5;
    support_recommendations.push('elevated_shedding_phase_monitor_telogen_triggers');
  } else {
    score -= 25;
    support_recommendations.push('severe_telogen_effluvium_or_androgenic_shedding_requires_trichoscopy');
  }

  if (temporal_vertex_thinning) {
    score -= 20;
    support_recommendations.push('patterned_bitemporal_vertex_thinning_indicates_dht_miniaturization');
  } else {
    score += 15;
  }

  if (scalp_sebum_inflammation === 'none') {
    score += 10;
  } else if (scalp_sebum_inflammation === 'mild_pruritus') {
    score -= 5;
    support_recommendations.push('scalp_microinflammation_accelerates_follicular_dropout');
  } else {
    score -= 15;
    support_recommendations.push('seborrheic_dermatitis_and_perifollicular_erythema_require_ketoconazole_protocol');
  }

  if (nail_brittleness_or_ridging) {
    score -= 10;
    support_recommendations.push('longitudinal_nail_ridging_suggests_micronutrient_or_keratin_matrix_strain');
  } else {
    score += 5;
  }

  if (using_5ar_inhibitor_or_minoxidil) {
    score += 10;
  }

  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));

  let androgenic_alopecia_risk_tier: 'minimal' | 'moderate-shedding' | 'accelerated-miniaturization';
  if (boundedScore >= 75) {
    androgenic_alopecia_risk_tier = 'minimal';
  } else if (boundedScore >= 45) {
    androgenic_alopecia_risk_tier = 'moderate-shedding';
  } else {
    androgenic_alopecia_risk_tier = 'accelerated-miniaturization';
  }

  const keratin_matrix_health_tier: 'robust' | 'compromised-brittle' =
    nail_brittleness_or_ridging || boundedScore < 50 ? 'compromised-brittle' : 'robust';

  return {
    hair_follicle_vitality_score: boundedScore,
    androgenic_alopecia_risk_tier,
    keratin_matrix_health_tier,
    support_recommendations,
  };
}
