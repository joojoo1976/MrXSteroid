/**
 * Tool #093 — Menstrual Cycle Manager
 * Models hormonal fluctuations across the 4 cycle phases:
 * Early Follicular (Menses), Late Follicular (Estrogen Surge/Ovulation),
 * Mid-Luteal (Progesterone Peak), and Late Luteal (Pre-menstrual drop).
 * Maps training strength tolerance, thermoregulation, carbohydrate oxidation,
 * and recovery parameters to physiological phase dynamics.
 *
 * NOTE: Educational cycle-phase model. Not a fertility tracking or contraception tool.
 */

export interface MenstrualCycleManagerInput {
  cycle_length_days: number; // typically 25..35 (28 avg)
  current_cycle_day: number; // day 1 = onset of menses (1..cycle_length_days)
  oral_contraceptive_active: boolean; // monophasic/triphasic exogenous progestin suppression
  high_intensity_training_focus: boolean;
}

export type CyclePhase = 'early_follicular' | 'late_follicular_ovulatory' | 'mid_luteal' | 'late_luteal_premenstrual';

export interface MenstrualCycleManagerResult {
  current_phase: CyclePhase;
  phase_name_ar: string;
  phase_name_en: string;
  metabolic_substrate_preference: 'carbohydrate_glycogen_dominant' | 'balanced' | 'lipid_oxidation_dominant';
  strength_power_potential_score: number; // 0..100
  thermoregulatory_strain_tier: 'baseline_cool' | 'elevated_core_temp_higher_sweat_sodium';
  recommendations: string[];
}

export function manageMenstrualCycle(input: MenstrualCycleManagerInput): MenstrualCycleManagerResult {
  const {
    cycle_length_days,
    current_cycle_day,
    oral_contraceptive_active,
    high_intensity_training_focus,
  } = input;

  const recommendations: string[] = ['educational_menstrual_phase_periodization_model'];

  // Approximate ovulation day: ~14 days prior to expected menses
  const estimatedOvulationDay = Math.max(10, cycle_length_days - 14);

  let current_phase: CyclePhase;
  let phase_name_en = '';
  let phase_name_ar = '';
  let strength_power_potential_score = 70;
  let metabolic_substrate_preference: 'carbohydrate_glycogen_dominant' | 'balanced' | 'lipid_oxidation_dominant' = 'balanced';
  let thermoregulatory_strain_tier: 'baseline_cool' | 'elevated_core_temp_higher_sweat_sodium' = 'baseline_cool';

  if (oral_contraceptive_active) {
    current_phase = 'early_follicular';
    phase_name_en = 'Exogenous Hormone Steady State';
    phase_name_ar = 'حالة هرمونية ثابتة بالحبوب المانعة للحمل';
    strength_power_potential_score = 75;
    metabolic_substrate_preference = 'balanced';
    recommendations.push('oral_contraceptives_dampen_natural_endogenous_estradiol_peaks');
  } else if (current_cycle_day <= 5) {
    current_phase = 'early_follicular';
    phase_name_en = 'Early Follicular (Menstruation)';
    phase_name_ar = 'الطور الجريبي المبكر (فترة الحيض)';
    strength_power_potential_score = 65;
    metabolic_substrate_preference = 'carbohydrate_glycogen_dominant';
    thermoregulatory_strain_tier = 'baseline_cool';
    recommendations.push('baseline_core_temp_favors_glycogen_utilization_manage_iron_loss');
  } else if (current_cycle_day <= estimatedOvulationDay + 1) {
    current_phase = 'late_follicular_ovulatory';
    phase_name_en = 'Late Follicular / Ovulation';
    phase_name_ar = 'الطور الجريبي المتأخر / الإباضة';
    strength_power_potential_score = 90;
    metabolic_substrate_preference = 'carbohydrate_glycogen_dominant';
    thermoregulatory_strain_tier = 'baseline_cool';
    recommendations.push('peak_estrogen_favors_neuromuscular_recruitment_and_pr_attempts');
  } else if (current_cycle_day <= cycle_length_days - 5) {
    current_phase = 'mid_luteal';
    phase_name_en = 'Mid-Luteal (Progesterone Surge)';
    phase_name_ar = 'طور الجسم الأصفر المتوسط (ذروة البروجسترون)';
    strength_power_potential_score = 70;
    metabolic_substrate_preference = 'lipid_oxidation_dominant';
    thermoregulatory_strain_tier = 'elevated_core_temp_higher_sweat_sodium';
    recommendations.push('progesterone_elevates_basal_temp_and_protein_catabolism_increase_hydration');
  } else {
    current_phase = 'late_luteal_premenstrual';
    phase_name_en = 'Late Luteal (Pre-menstrual)';
    phase_name_ar = 'طور الجسم الأصفر المتأخر (ما قبل الحيض)';
    strength_power_potential_score = 55;
    metabolic_substrate_preference = 'lipid_oxidation_dominant';
    thermoregulatory_strain_tier = 'elevated_core_temp_higher_sweat_sodium';
    recommendations.push('steep_hormonal_withdrawal_prioritize_recovery_and_electrolytes');
  }

  if (high_intensity_training_focus && current_phase === 'late_luteal_premenstrual') {
    recommendations.push('consider_tactical_deload_or_volume_reduction_during_late_luteal_dip');
  }

  return {
    current_phase,
    phase_name_ar,
    phase_name_en,
    metabolic_substrate_preference,
    strength_power_potential_score,
    thermoregulatory_strain_tier,
    recommendations,
  };
}
