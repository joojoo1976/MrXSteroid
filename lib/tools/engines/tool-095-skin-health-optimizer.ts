/**
 * Tool #095 — Skin Health Optimizer
 * Evaluates dermatological effects of androgens and exogenous hormones:
 * Sebum production rate, follicular hyperkeratinization, cystic acne severity,
 * and skin barrier integrity (collagen synthesis vs. thinning).
 *
 * NOTE: Educational dermatological screen for androgen-mediated skin changes;
 * not a diagnostic assay for acne vulgaris or cutis laxa.
 */

export interface SkinHealthOptimizerInput {
  sebum_production_level: 'normal_balanced' | 'moderately_oily' | 'excessive_hyperseborrhea';
  acne_lesion_distribution: 'none_or_mild_comedones' | 'papules_and_pustules_face_or_back' | 'deep_cystic_nodular_lesions';
  barrier_dryness_or_flaking: boolean; // compromised skin barrier or retinoid peeling
  sweat_hygiene_post_workout: 'immediate_shower' | 'delayed_over_1hr';
  using_topical_dht_blockers_or_salicylic: boolean;
}

export interface SkinHealthOptimizerResult {
  skin_clarity_score: number; // 0..100
  dermatological_risk_tier: 'calm-healthy' | 'moderate-breakout-risk' | 'severe-cystic-inflammatory-flare';
  skincare_protocol_priority: 'maintenance-hydration' | 'comedolytic-sebum-control' | 'clinical-dermatology-escalation';
  warnings: string[];
}

export function optimizeSkinHealth(input: SkinHealthOptimizerInput): SkinHealthOptimizerResult {
  const {
    sebum_production_level,
    acne_lesion_distribution,
    barrier_dryness_or_flaking,
    sweat_hygiene_post_workout,
    using_topical_dht_blockers_or_salicylic,
  } = input;

  const warnings: string[] = ['educational_androgenic_dermatology_screen'];
  let score = 50;

  // Sebum production
  if (sebum_production_level === 'normal_balanced') {
    score += 25;
  } else if (sebum_production_level === 'moderately_oily') {
    score += 5;
    warnings.push('androgen_stimulation_accelerates_sebaceous_gland_hypertrophy');
  } else {
    score -= 20;
    warnings.push('excessive_hyperseborrhea_promotes_cutibacterium_acnes_colonization');
  }

  // Acne lesions
  if (acne_lesion_distribution === 'none_or_mild_comedones') {
    score += 20;
  } else if (acne_lesion_distribution === 'papules_and_pustules_face_or_back') {
    score -= 10;
    warnings.push('follicular_microcomedones_progressing_to_inflammatory_pustules');
  } else {
    score -= 30;
    warnings.push('nodulocystic_acne_carries_high_risk_of_permanent_atrophic_scarring');
  }

  // Sweat hygiene
  if (sweat_hygiene_post_workout === 'delayed_over_1hr') {
    score -= 10;
    warnings.push('delayed_post_workout_hygiene_traps_sweat_salts_and_lipids_in_pores');
  } else {
    score += 5;
  }

  // Skincare intervention
  if (using_topical_dht_blockers_or_salicylic) {
    score += 10;
  }

  // Barrier damage
  if (barrier_dryness_or_flaking) {
    score -= 10;
    warnings.push('compromised_stratum_corneum_barrier_permits_transepidermal_water_loss');
  }

  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));

  let dermatological_risk_tier: 'calm-healthy' | 'moderate-breakout-risk' | 'severe-cystic-inflammatory-flare';
  if (boundedScore >= 75) {
    dermatological_risk_tier = 'calm-healthy';
  } else if (boundedScore >= 45) {
    dermatological_risk_tier = 'moderate-breakout-risk';
  } else {
    dermatological_risk_tier = 'severe-cystic-inflammatory-flare';
  }

  let skincare_protocol_priority: 'maintenance-hydration' | 'comedolytic-sebum-control' | 'clinical-dermatology-escalation';
  if (acne_lesion_distribution === 'deep_cystic_nodular_lesions' || boundedScore < 40) {
    skincare_protocol_priority = 'clinical-dermatology-escalation';
  } else if (sebum_production_level === 'excessive_hyperseborrhea' || acne_lesion_distribution === 'papules_and_pustules_face_or_back') {
    skincare_protocol_priority = 'comedolytic-sebum-control';
  } else {
    skincare_protocol_priority = 'maintenance-hydration';
  }

  return {
    skin_clarity_score: boundedScore,
    dermatological_risk_tier,
    skincare_protocol_priority,
    warnings,
  };
}
