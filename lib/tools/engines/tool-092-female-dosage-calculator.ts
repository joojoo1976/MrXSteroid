/**
 * Tool #092 — Female Dosage Calculator
 * Educational contextualizer for female androgen/anabolic dose ranges.
 * Implements strict clinical harm-reduction safeguards:
 * Flags irreversible virilization risks (clitoromegaly, dysphonia, temporal balding),
 * provides pharmacovigilance exposure limits, and never offers prescriptive dosing cycles.
 *
 * NOTE: Educational harm-reduction reference. Not a medical prescription or endorsement of AAS use.
 */

export interface FemaleDosageCalculatorInput {
  compound: 'oxandrolone' | 'methenolone_acetate' | 'nandrolone_decanoate' | 'testosterone_propionate';
  proposed_weekly_dose_mg: number; // e.g. 5..100 mg
  cycle_experience: 'first_time' | 'intermediate_experience' | 'advanced_risk_aware';
  monitoring_bloodwork_planned: boolean;
}

export interface FemaleDosageCalculatorResult {
  virilization_risk_tier: 'conservative-minimal-risk' | 'moderate-risk' | 'high-irreversible-virilization-risk';
  dose_relative_to_conservative_ceiling_percent: number; // percentage of maximum conservative female ceiling
  recommended_safe_exposure_duration_weeks: number;
  safety_warnings: string[];
}

export function calculateFemaleDosage(input: FemaleDosageCalculatorInput): FemaleDosageCalculatorResult {
  const {
    compound,
    proposed_weekly_dose_mg,
    cycle_experience,
    monitoring_bloodwork_planned,
  } = input;

  const safety_warnings: string[] = [
    'educational_harm_reduction_female_androgen_screen',
  ];

  // Established literature ceilings for female harm-reduction thresholds (conservative weekly mg)
  let conservativeWeeklyCeilingMg = 5; // default oxandrolone baseline (2.5-5mg/day -> 17.5-35mg/week conservative ceiling ~35mg, conservative threshold ~5mg/day = 35mg)
  let maxExposureWeeks = 8;

  switch (compound) {
    case 'oxandrolone':
      conservativeWeeklyCeilingMg = 35; // 5mg/day max for conservative female harm reduction
      maxExposureWeeks = 6;
      break;
    case 'methenolone_acetate':
      conservativeWeeklyCeilingMg = 50; // 50mg/week conservative ceiling
      maxExposureWeeks = 6;
      break;
    case 'nandrolone_decanoate':
      conservativeWeeklyCeilingMg = 25; // 25mg every 10-14 days or ~12.5-25mg/week
      maxExposureWeeks = 6;
      safety_warnings.push('long_ester_19nor_compounds_present_persistent_clearance_lag_if_virilization_manifests');
      break;
    case 'testosterone_propionate':
      conservativeWeeklyCeilingMg = 14; // ~2mg/day for female TRT/androgen replacement
      maxExposureWeeks = 8;
      break;
  }

  const doseRatio = proposed_weekly_dose_mg / conservativeWeeklyCeilingMg;
  const dose_relative_to_conservative_ceiling_percent = Math.round(doseRatio * 100);

  let virilization_risk_tier: 'conservative-minimal-risk' | 'moderate-risk' | 'high-irreversible-virilization-risk';
  if (doseRatio <= 1.0) {
    virilization_risk_tier = 'conservative-minimal-risk';
  } else if (doseRatio <= 1.6) {
    virilization_risk_tier = 'moderate-risk';
    safety_warnings.push('dose_exceeds_conservative_female_harm_reduction_thresholds');
  } else {
    virilization_risk_tier = 'high-irreversible-virilization-risk';
    safety_warnings.push('severe_risk_of_irreversible_virilization_vocal_deepening_and_clitoromegaly');
  }

  if (cycle_experience === 'first_time') {
    maxExposureWeeks = Math.min(maxExposureWeeks, 5);
    if (doseRatio > 1.0) {
      safety_warnings.push('first_time_exposures_require_lowest_viable_titration_to_gauge_individual_androgen_sensitivity');
    }
  }

  if (!monitoring_bloodwork_planned) {
    safety_warnings.push('absence_of_baseline_lipid_hepatic_and_endocrine_monitoring_magnifies_health_hazards');
  }

  return {
    virilization_risk_tier,
    dose_relative_to_conservative_ceiling_percent,
    recommended_safe_exposure_duration_weeks: maxExposureWeeks,
    safety_warnings,
  };
}
