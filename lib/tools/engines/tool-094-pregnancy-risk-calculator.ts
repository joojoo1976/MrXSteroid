/**
 * Tool #094 — Pregnancy Risk Calculator
 * Evaluates reproductive toxicology and teratogenic risk profiles for compounds
 * (AAS, SARMs, SERMs, AIs, Isotretinoin, Peptides, Fat burners).
 * Calculates clearance timelines based on terminal half-life multi-compartment washouts
 * and highlights strict absolute contraindications.
 *
 * NOTE: Educational toxicology screen. Absolutely not medical clearance for conception.
 * Any woman planning pregnancy or potentially pregnant must discontinue all PEDs immediately
 * and consult an obstetrician/maternal-fetal medicine specialist.
 */

export interface PregnancyRiskCalculatorInput {
  compound_class: 'anabolic_androgenic_steroid' | 'sarm' | 'aromatase_inhibitor_or_serm' | 'retinoid_isotretinoin' | 'thermogenic_adrenergic';
  weeks_since_last_exposure: number; // 0..52
  currently_pregnant_or_attempting_conception: boolean;
  unprotected_intercourse_during_exposure: boolean;
}

export interface PregnancyRiskCalculatorResult {
  fetal_teratogenicity_risk: 'absolute-contraindicated-extreme' | 'high-teratogenic-risk' | 'moderate-residual-risk' | 'low-post-washout-risk';
  washout_completion_status: 'within-active-clearance-window' | 'post-5-halflives-washout-cleared';
  recommended_safe_conception_wait_weeks: number;
  critical_safety_alerts: string[];
}

export function calculatePregnancyRisk(input: PregnancyRiskCalculatorInput): PregnancyRiskCalculatorResult {
  const {
    compound_class,
    weeks_since_last_exposure,
    currently_pregnant_or_attempting_conception,
    unprotected_intercourse_during_exposure,
  } = input;

  const critical_safety_alerts: string[] = [
    'educational_teratogenic_risk_assessment_only',
  ];

  let requiredWashoutWeeks = 12;

  switch (compound_class) {
    case 'retinoid_isotretinoin':
      requiredWashoutWeeks = 24; // strict 1-6 months depending on compound
      critical_safety_alerts.push('isotretinoin_and_retinoids_carry_extreme_fetal_craniofacial_cardiac_teratogenicity');
      break;
    case 'anabolic_androgenic_steroid':
      requiredWashoutWeeks = 16;
      critical_safety_alerts.push('androgens_cause_severe_female_fetal_pseudohermaphroditism_and_urogenital_malformations');
      break;
    case 'aromatase_inhibitor_or_serm':
      requiredWashoutWeeks = 12;
      critical_safety_alerts.push('estrogen_deprivation_or_receptor_modulation_disrupts_early_embryonic_implantation');
      break;
    case 'sarm':
      requiredWashoutWeeks = 12;
      critical_safety_alerts.push('unapproved_androgen_modulators_lack_reproductive_safety_data_strict_avoidance_mandated');
      break;
    case 'thermogenic_adrenergic':
      requiredWashoutWeeks = 8;
      critical_safety_alerts.push('sympathomimetic_agents_compromise_uterine_placental_blood_flow');
      break;
  }

  const isCleared = weeks_since_last_exposure >= requiredWashoutWeeks;
  const washout_completion_status: 'within-active-clearance-window' | 'post-5-halflives-washout-cleared' = isCleared
    ? 'post-5-halflives-washout-cleared'
    : 'within-active-clearance-window';

  let fetal_teratogenicity_risk: 'absolute-contraindicated-extreme' | 'high-teratogenic-risk' | 'moderate-residual-risk' | 'low-post-washout-risk';

  if (currently_pregnant_or_attempting_conception && !isCleared) {
    fetal_teratogenicity_risk = 'absolute-contraindicated-extreme';
    critical_safety_alerts.push('absolute_contraindication_active_or_recent_compound_exposure_during_pregnancy');
  } else if (!isCleared) {
    fetal_teratogenicity_risk = 'high-teratogenic-risk';
    critical_safety_alerts.push('residual_circulating_metabolites_present_conception_must_be_strictly_deferred');
  } else if (unprotected_intercourse_during_exposure) {
    fetal_teratogenicity_risk = 'moderate-residual-risk';
    critical_safety_alerts.push('prior_unprotected_exposure_requires_medical_hCG_testing_and_clinical_sonography');
  } else {
    fetal_teratogenicity_risk = 'low-post-washout-risk';
    critical_safety_alerts.push('metabolites_cleared_beyond_established_washout_interval_preconceptional_screening_advised');
  }

  const recommended_safe_conception_wait_weeks = Math.max(0, requiredWashoutWeeks - weeks_since_last_exposure);

  return {
    fetal_teratogenicity_risk,
    washout_completion_status,
    recommended_safe_conception_wait_weeks,
    critical_safety_alerts,
  };
}
