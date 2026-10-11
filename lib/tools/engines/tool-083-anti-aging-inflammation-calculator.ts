/**
 * Tool #083 — Anti-Aging Inflammation Calculator
 * Models "inflammaging" (the chronic, sterile, low-grade systemic inflammation
 * characteristic of biological aging) via clinical and phenotypic markers:
 * hs-CRP, neutrophil-to-lymphocyte ratio proxy, visceral adiposity, and dental health.
 */

export interface AntiAgingInflammationInput {
  hs_crp_mg_l?: number; // 0.1..20
  visceral_adiposity_rating: 'low' | 'moderate' | 'high'; // waist measurement indicator
  periodontal_disease_present: boolean; // major driver of systemic bacteremia/inflammaging
  daily_joint_stiffness_morning_mins: number; // 0..120
  anti_inflammatory_polyphenols_daily: boolean; // berries, green tea, curcumin
}

export interface AntiAgingInflammationResult {
  inflammaging_index_score: number; // 0..100 (higher = worse inflammaging burden)
  inflammaging_tier: 'minimal-baseline' | 'moderate-inflammaging' | 'pronounced-systemic-wear';
  warnings: string[];
}

export function calculateAntiAgingInflammation(input: AntiAgingInflammationInput): AntiAgingInflammationResult {
  const {
    hs_crp_mg_l,
    visceral_adiposity_rating,
    periodontal_disease_present,
    daily_joint_stiffness_morning_mins,
    anti_inflammatory_polyphenols_daily,
  } = input;

  const warnings: string[] = ['educational_inflammaging_screen'];
  let burden = 15; // baseline

  // hs-CRP
  if (hs_crp_mg_l !== undefined) {
    if (hs_crp_mg_l >= 3.0) {
      burden += 35;
      warnings.push('elevated_crp_indicates_pronounced_systemic_inflammatory_burden');
    } else if (hs_crp_mg_l >= 1.0) {
      burden += 18;
    }
  }

  // Visceral adiposity (secretes IL-6 and TNF-alpha)
  if (visceral_adiposity_rating === 'high') {
    burden += 25;
    warnings.push('visceral_adipose_tissue_is_a_major_driver_of_pro_inflammatory_cytokines');
  } else if (visceral_adiposity_rating === 'moderate') {
    burden += 12;
  }

  // Periodontal disease
  if (periodontal_disease_present) {
    burden += 20;
    warnings.push('periodontal_pathogens_induce_continuous_endotoxin_release_driving_inflammaging');
  }

  // Morning joint stiffness
  if (daily_joint_stiffness_morning_mins >= 30) {
    burden += 15;
    warnings.push('morning_stiffness_exceeding_30m_warrants_clinical_rheumatologic_evaluation');
  } else if (daily_joint_stiffness_morning_mins >= 15) {
    burden += 8;
  }

  // Dietary polyphenols
  if (anti_inflammatory_polyphenols_daily) {
    burden = Math.max(5, burden - 15);
  }

  const finalScore = Math.max(0, Math.min(100, burden));

  let tier: AntiAgingInflammationResult['inflammaging_tier'] = 'moderate-inflammaging';
  if (finalScore >= 65) {
    tier = 'pronounced-systemic-wear';
  } else if (finalScore <= 30) {
    tier = 'minimal-baseline';
  }

  return {
    inflammaging_index_score: finalScore,
    inflammaging_tier: tier,
    warnings,
  };
}
