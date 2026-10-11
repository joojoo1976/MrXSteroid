/**
 * Tool #082 — Telomere Manager
 * Evaluates lifestyle and physiological factors known to preserve or accelerate
 * telomeric attrition (telomere length maintenance & telomerase activity markers).
 *
 * NOTE: Educational screening score based on Blackburn / Epel research; not
 * a quantitative PCR or Flow-FISH telomere assay measurement.
 */

export interface TelomereInput {
  perceived_chronic_stress_level: 'low' | 'moderate' | 'high' | 'severe';
  aerobic_exercise_hours_weekly: number; // 0..20
  mediterranean_diet_adherence: 'low' | 'moderate' | 'high';
  omega3_supplementation_or_fatty_fish: boolean;
  bmi: number; // 15..50
}

export interface TelomereResult {
  telomere_protection_score: number; // 0..100
  telomere_status_band: 'depleted-attrition-risk' | 'moderate-maintenance' | 'favorable-preservation' | 'optimal-telomere-support';
  warnings: string[];
}

export function manageTelomeres(input: TelomereInput): TelomereResult {
  const {
    perceived_chronic_stress_level,
    aerobic_exercise_hours_weekly,
    mediterranean_diet_adherence,
    omega3_supplementation_or_fatty_fish,
    bmi,
  } = input;

  const warnings: string[] = ['educational_telomere_maintenance_index'];
  let score = 30; // baseline

  // Chronic psychological stress (direct telomerase blunting via cortisol)
  if (perceived_chronic_stress_level === 'severe') {
    score -= 25;
    warnings.push('severe_chronic_stress_significantly_blunts_telomerase_activity');
  } else if (perceived_chronic_stress_level === 'high') {
    score -= 15;
    warnings.push('elevated_stress_accelerates_leukocyte_telomere_shortening');
  } else if (perceived_chronic_stress_level === 'low') {
    score += 15;
  }

  // Aerobic training
  if (aerobic_exercise_hours_weekly >= 3) {
    score += 25;
  } else if (aerobic_exercise_hours_weekly >= 1) {
    score += 12;
  } else {
    warnings.push('sedentary_lifestyle_associated_with_accelerated_telomere_attrition');
  }

  // Diet
  if (mediterranean_diet_adherence === 'high') {
    score += 20;
  } else if (mediterranean_diet_adherence === 'moderate') {
    score += 10;
  }

  // Omega 3
  if (omega3_supplementation_or_fatty_fish) {
    score += 15;
  }

  // Adiposity / low-grade inflammation
  if (bmi >= 32) {
    score -= 15;
    warnings.push('marked_adiposity_induces_oxidative_stress_accelerating_telomeric_loss');
  } else if (bmi >= 27) {
    score -= 8;
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let band: TelomereResult['telomere_status_band'] = 'moderate-maintenance';
  if (finalScore >= 80) {
    band = 'optimal-telomere-support';
  } else if (finalScore >= 60) {
    band = 'favorable-preservation';
  } else if (finalScore <= 35) {
    band = 'depleted-attrition-risk';
  }

  return {
    telomere_protection_score: finalScore,
    telomere_status_band: band,
    warnings,
  };
}
