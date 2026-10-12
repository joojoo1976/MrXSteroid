/**
 * Tool #090 — Female Hormone Balance Calculator
 * Evaluates estradiol-to-progesterone balance proxies, cycle regularity,
 * androgenic virilization signs, and luteal phase support.
 *
 * NOTE: Educational screening score for female hormonal symptom clusters;
 * not a diagnostic assay for PCOS, endometriosis, or primary ovarian insufficiency.
 */

export interface FemaleHormoneBalanceInput {
  cycle_length_days: number; // 21..45 (28 typical)
  pms_symptom_severity: 'none_mild' | 'moderate' | 'severe'; // breast tenderness, mood swings
  androgenic_signs_present: boolean; // hirsutism, jawline cystic acne, vocal deepening
  cycle_regularity: 'strictly_regular' | 'mildly_variable' | 'highly_irregular_or_absent';
  high_stress_or_rapid_weight_loss: boolean; // hypothalamic-pituitary-ovarian axis suppression
}

export interface FemaleHormoneBalanceResult {
  hormone_harmony_score: number; // 0..100
  estrogen_progesterone_balance_tier: 'harmonious-baseline' | 'estrogen-dominance-leaning' | 'ovulatory-disruption-risk';
  androgenic_virilization_risk: 'low' | 'moderate' | 'elevated';
  warnings: string[];
}

export function calculateFemaleHormoneBalance(input: FemaleHormoneBalanceInput): FemaleHormoneBalanceResult {
  const {
    cycle_length_days,
    pms_symptom_severity,
    androgenic_signs_present,
    cycle_regularity,
    high_stress_or_rapid_weight_loss,
  } = input;

  const warnings: string[] = ['educational_female_hormonal_balance_screen'];
  let score = 35; // baseline

  // Cycle regularity
  if (cycle_regularity === 'strictly_regular') {
    score += 30;
  } else if (cycle_regularity === 'mildly_variable') {
    score += 15;
  } else {
    score -= 20;
    warnings.push('severe_cycle_irregularity_suggests_anovulatory_cycles_or_hpo_dysregulation');
  }

  // Cycle length
  if (cycle_length_days >= 25 && cycle_length_days <= 32) {
    score += 15;
  } else if (cycle_length_days < 24 || cycle_length_days > 35) {
    warnings.push('abnormal_cycle_length_warrants_luteal_phase_and_thyroid_hormone_evaluation');
  }

  // PMS / Estrogen dominance proxy
  if (pms_symptom_severity === 'none_mild') {
    score += 20;
  } else if (pms_symptom_severity === 'severe') {
    score -= 15;
    warnings.push('marked_pms_symptoms_frequently_reflect_relative_luteal_progesterone_insufficiency');
  }

  // Androgenic signs
  let androgenicRisk: FemaleHormoneBalanceResult['androgenic_virilization_risk'] = 'low';
  if (androgenic_signs_present) {
    score -= 25;
    androgenicRisk = 'elevated';
    warnings.push('androgenic_virilization_signs_require_immediate_clinical_androgen_evaluation');
  }

  // Hypothalamic stress
  if (high_stress_or_rapid_weight_loss) {
    score -= 15;
    warnings.push('severe_energy_deficit_or_stress_inhibits_hypothalamic_gnrh_pulsatility');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let tier: FemaleHormoneBalanceResult['estrogen_progesterone_balance_tier'] = 'estrogen-dominance-leaning';
  if (finalScore >= 75 && !androgenic_signs_present) {
    tier = 'harmonious-baseline';
  } else if (finalScore <= 45 || cycle_regularity === 'highly_irregular_or_absent') {
    tier = 'ovulatory-disruption-risk';
  }

  return {
    hormone_harmony_score: finalScore,
    estrogen_progesterone_balance_tier: tier,
    androgenic_virilization_risk: androgenicRisk,
    warnings,
  };
}
