/**
 * Tool #091 — Female Health Optimizer
 * Evaluates female-specific physiological vitality pillars:
 * Iron/ferritin risk indicators, pelvic bone and energy availability (RED-S proxy),
 * thyroid-ovarian interaction, and training intensity tolerance.
 *
 * NOTE: Educational screening score for female athletic resilience;
 * not a diagnostic assay for Relative Energy Deficiency in Sport (RED-S) or thyroiditis.
 */

export interface FemaleHealthOptimizerInput {
  energy_availability_adequacy: 'adequate' | 'marginal' | 'severely_deficient'; // caloric intake vs expenditure
  ferritin_status: 'optimal' | 'borderline_low' | 'clinical_deficiency_suspected'; // iron stores/fatigue
  bone_stress_or_joint_pains: boolean; // bone stress injury or osteopenia proxy
  thyroid_cold_intolerance: boolean; // low T3 syndrome proxy
  resistance_training_sessions_per_week: number; // 0..7
}

export interface FemaleHealthOptimizerResult {
  female_vitality_score: number; // 0..100
  athletic_resilience_tier: 'robust-resilience' | 'moderate-strain' | 'high-reds-risk';
  iron_energy_support_priority: 'maintenance' | 'iron-and-nutrition-optimization' | 'urgent-clinical-review';
  warnings: string[];
}

export function optimizeFemaleHealth(input: FemaleHealthOptimizerInput): FemaleHealthOptimizerResult {
  const {
    energy_availability_adequacy,
    ferritin_status,
    bone_stress_or_joint_pains,
    thyroid_cold_intolerance,
    resistance_training_sessions_per_week,
  } = input;

  const warnings: string[] = ['educational_female_athletic_vitality_screen'];
  let score = 50;

  // Energy availability
  if (energy_availability_adequacy === 'adequate') {
    score += 25;
  } else if (energy_availability_adequacy === 'marginal') {
    score += 5;
    warnings.push('marginal_energy_availability_depletes_recovery_and_estradiol_synthesis');
  } else {
    score -= 25;
    warnings.push('severe_energy_deficit_triggers_hypothalamic_amenorrhea_and_metabolic_slowdown');
  }

  // Ferritin
  if (ferritin_status === 'optimal') {
    score += 15;
  } else if (ferritin_status === 'borderline_low') {
    score -= 5;
    warnings.push('suboptimal_iron_stores_impair_oxygen_transport_and_cellular_energy');
  } else {
    score -= 20;
    warnings.push('suspected_iron_deficiency_demands_complete_serum_ferritin_and_cbc_panel');
  }

  // Bone stress
  if (bone_stress_or_joint_pains) {
    score -= 15;
    warnings.push('bone_stress_symptoms_under_low_estrogen_heighten_fracture_risk');
  } else {
    score += 5;
  }

  // Thyroid cold intolerance
  if (thyroid_cold_intolerance) {
    score -= 10;
    warnings.push('cold_intolerance_may_indicate_downregulated_conversion_of_t4_to_t3');
  }

  // Training load context
  if (resistance_training_sessions_per_week >= 3 && resistance_training_sessions_per_week <= 5) {
    score += 5;
  } else if (resistance_training_sessions_per_week > 5 && energy_availability_adequacy !== 'adequate') {
    score -= 10;
    warnings.push('high_training_volume_in_energy_deficit_exponentially_increases_overreaching');
  }

  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));

  let athletic_resilience_tier: 'robust-resilience' | 'moderate-strain' | 'high-reds-risk';
  if (boundedScore >= 75) {
    athletic_resilience_tier = 'robust-resilience';
  } else if (boundedScore >= 45) {
    athletic_resilience_tier = 'moderate-strain';
  } else {
    athletic_resilience_tier = 'high-reds-risk';
  }

  let iron_energy_support_priority: 'maintenance' | 'iron-and-nutrition-optimization' | 'urgent-clinical-review';
  if (ferritin_status === 'clinical_deficiency_suspected' || boundedScore < 40) {
    iron_energy_support_priority = 'urgent-clinical-review';
  } else if (ferritin_status === 'borderline_low' || energy_availability_adequacy === 'marginal') {
    iron_energy_support_priority = 'iron-and-nutrition-optimization';
  } else {
    iron_energy_support_priority = 'maintenance';
  }

  return {
    female_vitality_score: boundedScore,
    athletic_resilience_tier,
    iron_energy_support_priority,
    warnings,
  };
}
